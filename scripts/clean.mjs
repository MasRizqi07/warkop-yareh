import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isAbsolute, relative, resolve } from 'node:path';

const workspaceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const generatedDirectories = [
  'apps/api/dist',
  'apps/admin/.next',
  'apps/web/.next',
  'apps/api/coverage',
  'apps/admin/coverage',
  'apps/web/coverage',
  '.turbo',
];

for (const relativePath of generatedDirectories) {
  const target = resolve(workspaceRoot, relativePath);
  const pathFromWorkspace = relative(workspaceRoot, target);
  if (pathFromWorkspace.startsWith('..') || isAbsolute(pathFromWorkspace)) {
    throw new Error(`Refusing to clean path outside workspace: ${target}`);
  }
  await rm(target, { recursive: true, force: true });
}

console.log(`Removed ${generatedDirectories.length} generated build/cache targets.`);
