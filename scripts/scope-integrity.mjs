import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const historicalMerge = '90c4366792b6408cfdf8660981f13c45f3a355d1';
const firstParent = '0b3efd9e3b97ad8711e1f77ecbc22d4eebcf91d3';
const importedParent = 'f7c76db4604bd7e80287be6829558609c4f59cd4';
const disclosurePath = path.join(
  'docs',
  'release',
  'scope-disclosures',
  `${importedParent}.json`
);

function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function changedFiles(base, head) {
  const output = git([
    'diff',
    '--name-status',
    '--find-renames',
    `${base}..${head}`,
  ]);
  if (!output) return [];

  return output.split(/\r?\n/).map((line) => {
    const fields = line.split('\t');
    const status = fields[0];
    const filePath = fields.at(-1).replaceAll('\\', '/');
    return { status, path: filePath };
  });
}

function classify(entry) {
  const filePath = entry.path;

  if (entry.status.startsWith('D')) return 'repository-cleanup';
  if (filePath.startsWith('apps/admin/')) return 'admin-operations';
  if (filePath.includes('cashier_shift') || filePath.includes('/shift.')) {
    return 'cashier-shift-operations';
  }
  if (filePath.startsWith('apps/api/')) return 'backend-operations';
  if (filePath.startsWith('apps/web/')) return 'customer-experience';
  if (filePath.startsWith('packages/database/')) return 'database-contracts';
  if (filePath.startsWith('docs/')) return 'documentation';
  if (
    filePath.startsWith('.github/') ||
    filePath.startsWith('scripts/') ||
    [
      '.env.example',
      '.gitignore',
      '.node-version',
      'README.md',
      'package.json',
      'pnpm-lock.yaml',
      'turbo.json',
    ].includes(filePath)
  ) {
    return 'platform-and-release';
  }

  throw new Error(`Unclassified imported path: ${filePath}`);
}

function makeHistoricalDisclosure() {
  const files = changedFiles(firstParent, historicalMerge).map((entry) => ({
    ...entry,
    area: classify(entry),
    decision: entry.status.startsWith('D') ? 'retain-removal' : 'retain',
  }));

  const areaCounts = files.reduce((counts, file) => {
    counts[file.area] = (counts[file.area] ?? 0) + 1;
    return counts;
  }, {});

  return {
    schemaVersion: 1,
    sourceMerge: historicalMerge,
    firstParent,
    importedParent,
    approvedOn: '2026-09-09',
    decision:
      'Retain the imported implementation in main, review it as a separate scope, and keep production release frozen until its named gates pass.',
    summary: {
      changedFiles: files.length,
      insertions: 8815,
      deletions: 81176,
      areaCounts,
    },
    evidence: [
      'docs/release/SCOPE_INTEGRITY_REMEDIATION.md',
      'docs/release/ADMIN_REVIEW_MATRIX.md',
      'apps/api/test/operations.e2e-spec.ts',
      'pnpm audit:scope',
      'pnpm verify',
    ],
    files,
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function verifyHistoricalDisclosure() {
  const expected = makeHistoricalDisclosure();
  if (process.argv.includes('--write')) {
    writeFileSync(disclosurePath, stableJson(expected));
    console.log(`Wrote ${disclosurePath} with ${expected.files.length} paths`);
    return;
  }

  const actual = JSON.parse(readFileSync(disclosurePath, 'utf8'));
  if (stableJson(actual) !== stableJson(expected)) {
    throw new Error(
      `Historical scope disclosure is stale. Review the diff, then run pnpm audit:scope -- --write`
    );
  }
  console.log(
    `Historical merge disclosure verified: ${expected.files.length} paths across ${Object.keys(expected.summary.areaCounts).length} areas`
  );
}

function isCommit(value) {
  if (!value || /^0+$/.test(value)) return false;
  try {
    git(['rev-parse', '--verify', `${value}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function verifyNewMergeDisclosures() {
  const base = process.env.SCOPE_BASE_SHA;
  const head = process.env.SCOPE_HEAD_SHA ?? 'HEAD';
  if (!isCommit(base) || !isCommit(head)) {
    console.log(
      'New-merge audit skipped: no complete Git comparison range is available'
    );
    return;
  }

  const merges = git(['rev-list', '--merges', `${base}..${head}`])
    .split(/\r?\n/)
    .filter(Boolean);
  const missing = [];

  for (const merge of merges) {
    const parents = git(['show', '-s', '--format=%P', merge]).split(' ');
    const isHostingMerge =
      process.env.GITHUB_EVENT_NAME === 'push' &&
      merge === git(['rev-parse', head]) &&
      parents[0] === git(['rev-parse', base]);
    if (isHostingMerge) continue;

    const candidate = path.join(
      'docs',
      'release',
      'scope-disclosures',
      `${merge}.json`
    );
    try {
      const disclosure = JSON.parse(readFileSync(candidate, 'utf8'));
      if (disclosure.sourceMerge !== merge)
        missing.push(`${merge} (mismatched ${candidate})`);
    } catch {
      missing.push(`${merge} (expected ${candidate})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Merge commits without explicit scope disclosure:\n${missing.join('\n')}`
    );
  }
  console.log(
    `New merge disclosure audit passed: ${merges.length} merge commit(s) inspected`
  );
}

verifyHistoricalDisclosure();
verifyNewMergeDisclosures();
