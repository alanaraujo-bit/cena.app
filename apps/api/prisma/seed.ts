import { prisma } from '../src/db';
import { FRAME_CATALOG } from '../src/services/frameCatalog';

async function main() {
  for (const frame of FRAME_CATALOG) {
    await prisma.frame.upsert({
      where: { key: frame.key },
      create: frame,
      update: {
        name: frame.name,
        description: frame.description,
        rarity: frame.rarity,
        effect: frame.effect,
        colors: frame.colors,
        unlockRank: frame.unlockRank,
      },
    });
  }
  console.log(`Seeded ${FRAME_CATALOG.length} frames.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
