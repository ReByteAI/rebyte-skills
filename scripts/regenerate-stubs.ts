#!/usr/bin/env npx tsx
/**
 * Regenerate public stub bodies in rebyte-skills/<slug>/SKILL.md.
 *
 * Keeps the existing frontmatter (preserves per-skill name/description plus
 * any extras like `license`), replaces the body with the canonical fetch
 * instruction. Only touches stubs whose body already looks like a fetch stub
 * — full-content (unmigrated) SKILL.md files are skipped, never clobbered.
 *
 * Usage:
 *   npx tsx scripts/regenerate-stubs.ts <slug>
 *   npx tsx scripts/regenerate-stubs.ts --all
 *   npx tsx scripts/regenerate-stubs.ts --all --dry
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');

function bodyFor(slug: string): string {
  return `# ${slug}

Run:

\`\`\`bash
rebyte-install-skill ${slug}
\`\`\`

Then read and follow the \`_SKILL.md\` path the script prints.
`;
}

const STUB_MARKERS = [/rebyte-install-skill\s+\S+/, /\/api\/data\/skills\//];
function looksLikeStub(body: string): boolean {
  return STUB_MARKERS.some((re) => re.test(body));
}

function regenerate(slug: string, dry: boolean): 'updated' | 'skipped-not-stub' | 'skipped-no-skill' | 'unchanged' {
  const stubPath = path.join(REPO_ROOT, slug, 'SKILL.md');
  if (!fs.existsSync(stubPath)) return 'skipped-no-skill';

  const current = fs.readFileSync(stubPath, 'utf-8');
  const fmMatch = current.match(/^(---\n[\s\S]*?\n---\n)/);
  if (!fmMatch) return 'skipped-not-stub';

  const body = current.slice(fmMatch[0].length);
  if (!looksLikeStub(body)) return 'skipped-not-stub';

  const next = fmMatch[1] + '\n' + bodyFor(slug);
  if (next === current) return 'unchanged';
  if (!dry) fs.writeFileSync(stubPath, next);
  return 'updated';
}

function discoverSlugs(): string[] {
  return fs
    .readdirSync(REPO_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
    .filter((e) => fs.existsSync(path.join(REPO_ROOT, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const all = args.includes('--all');
  const positional = args.filter((a) => !a.startsWith('-'));

  let slugs: string[];
  if (all) {
    slugs = discoverSlugs();
  } else if (positional.length > 0) {
    slugs = positional;
  } else {
    console.log('Usage:');
    console.log('  npx tsx scripts/regenerate-stubs.ts <slug>');
    console.log('  npx tsx scripts/regenerate-stubs.ts --all [--dry]');
    process.exit(1);
  }

  let updated = 0, unchanged = 0, skipped = 0;
  for (const slug of slugs) {
    const result = regenerate(slug, dry);
    console.log(`  ${slug}: ${result}${dry && result === 'updated' ? ' (dry)' : ''}`);
    if (result === 'updated') updated++;
    else if (result === 'unchanged') unchanged++;
    else skipped++;
  }
  console.log(`\n${updated} updated, ${unchanged} unchanged, ${skipped} skipped`);
}

main();
