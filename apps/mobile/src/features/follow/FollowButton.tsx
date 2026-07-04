import type { FollowRelationship } from '@cena/shared';
import { PrimaryButton } from '@/design-system';
import { useFollowToggle } from './hooks';

const LABELS: Record<FollowRelationship, string> = {
  self: '',
  none: 'Seguir',
  pending: 'Solicitação enviada',
  accepted: 'Seguindo',
};

export function FollowButton({
  username,
  relationship,
}: {
  username: string;
  relationship: FollowRelationship;
}) {
  const toggle = useFollowToggle(username);
  if (relationship === 'self') return null;

  const variant = relationship === 'none' ? 'primary' : 'glass';

  return (
    <PrimaryButton
      label={LABELS[relationship]}
      variant={variant}
      loading={toggle.isPending}
      onPress={() => toggle.mutate(relationship)}
    />
  );
}
