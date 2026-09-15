import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 2: Boundary & Corner Cases');
setFeature('Boundary 13: Build & Code Integrity Boundaries');

describe('Boundary 13: Build & Code Integrity Boundaries', () => {
  const rootDir = process.cwd();

  it('B13.1 should have typescript configured in devDependencies with version 5+', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    assert.ok(pkg.devDependencies && pkg.devDependencies.typescript, 'TypeScript must be listed in devDependencies');
    assert.match(pkg.devDependencies.typescript, /\^?5\./, 'Must use TypeScript 5+');
  });

  it('B13.2 should verify src/types/birthday.ts exports ThemeId, MusicType, and BirthdayData', () => {
    const typesPath = path.join(rootDir, 'src', 'types', 'birthday.ts');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.includes(content, 'export type ThemeId');
    assert.includes(content, 'export type MusicType');
    assert.includes(content, 'export interface BirthdayData');
    assert.includes(content, 'export interface MemoryItem');
  });

  it('B13.3 should verify src/utils/shareEncoder.ts exports encoding and decoding functions', () => {
    const encoderPath = path.join(rootDir, 'src', 'utils', 'shareEncoder.ts');
    const content = fs.readFileSync(encoderPath, 'utf8');

    assert.includes(content, 'export function encodeBirthdayToUrlPayload');
    assert.includes(content, 'export function decodeBirthdayFromUrlPayload');
    assert.includes(content, 'export function generateUniversalShareUrl');
  });

  it('B13.4 should verify index.html links to /src/main.tsx as Vite module entrypoint', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');

    assert.includes(content, '<script type="module" src="/src/main.tsx"></script>');
  });

  it('B13.5 should verify no unresolved merge conflict markers in source tree', () => {
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          checkDir(full);
        } else if (/\.(tsx?|css|html|json|js)$/.test(f)) {
          const fileContent = fs.readFileSync(full, 'utf8');
          assert.strictEqual(fileContent.includes('<<<<<<<'), false, `Conflict marker found in ${f}`);
          assert.strictEqual(fileContent.includes('>>>>>>>'), false, `Conflict marker found in ${f}`);
        }
      }
    };
    checkDir(path.join(rootDir, 'src'));
  });
});
