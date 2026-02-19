/**
 * Template Seeder
 * Seeds all 57 built-in templates into the database.
 *
 * Usage:
 *   npx tsx packages/database/prisma/seed-templates.ts
 *
 * Requires CORE_DATABASE_URL environment variable.
 */

import { PrismaClient } from '../generated/core';
import { allTemplates } from '@ims/templates';

const prisma = new PrismaClient();

async function seedTemplates() {
  console.log(`Seeding ${allTemplates.length} templates...`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const tpl of allTemplates) {
    try {
      const existing = await prisma.template.findUnique({
        where: { code: tpl.code },
      });

      if (existing) {
        // Update if built-in and version differs
        if (existing.isBuiltIn) {
          await prisma.template.update({
            where: { code: tpl.code },
            data: {
              name: tpl.name,
              description: tpl.description,
              module: tpl.module as string,
              category: tpl.category as string,
              tags: tpl.tags,
              fields: tpl.fields as Record<string, unknown>[],
              defaultContent: (tpl.defaultContent as string | undefined) ?? undefined,
              status: 'ACTIVE',
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.template.create({
          data: {
            code: tpl.code,
            name: tpl.name,
            description: tpl.description,
            module: tpl.module as string,
            category: tpl.category as string,
            status: 'ACTIVE',
            tags: tpl.tags,
            fields: tpl.fields as Record<string, unknown>[],
            defaultContent: (tpl.defaultContent as string | undefined) ?? undefined,
            isBuiltIn: true,
          },
        });
        created++;
      }
    } catch (err: unknown) {
      console.error(`  ERROR seeding ${tpl.code}: ${(err as Error).message}`);
    }
  }

  console.log(`Done: ${created} created, ${updated} updated, ${skipped} skipped`);
}

seedTemplates()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
