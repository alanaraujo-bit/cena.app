import type { Title } from '@prisma/client';
import type { VersusChoice, VersusSummary } from '@cena/shared';
import { toTitleSummary } from './titleMapper';

interface VersusRow {
  id: string;
  question: string | null;
  creator: { username: string; name: string };
  titleA: Title;
  titleB: Title;
  closesAt: Date;
  votes: { userId: string; choice: string }[];
}

/** Pure mapper — no I/O — shared by versusService (standalone fetch) and
 * activityService (feed embedding) so both render the exact same shape. */
export function toVersusSummary(
  row: VersusRow,
  viewerId: string,
  watchedTitleIds: Set<string>,
): VersusSummary {
  const isClosed = Date.now() >= row.closesAt.getTime();
  const votesA = row.votes.filter((v) => v.choice === 'a').length;
  const votesB = row.votes.filter((v) => v.choice === 'b').length;
  const myVote = row.votes.find((v) => v.userId === viewerId);
  const eligible = watchedTitleIds.has(row.titleA.id) && watchedTitleIds.has(row.titleB.id);

  return {
    id: row.id,
    question: row.question,
    creator: row.creator,
    titleA: toTitleSummary(row.titleA),
    titleB: toTitleSummary(row.titleB),
    votesA,
    votesB,
    closesAt: row.closesAt.toISOString(),
    isClosed,
    canVote: !isClosed && eligible && !myVote,
    myChoice: (myVote?.choice as VersusChoice | undefined) ?? null,
  };
}
