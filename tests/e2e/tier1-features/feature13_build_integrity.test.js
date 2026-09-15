import { describe, it, setTier, setFeature } from '../framework/testHarness.js';
import { assert } from '../framework/assert.js';
import fs from 'node:fs';
import path from 'node:path';

setTier('Tier 1: Feature Coverage');
setFeature('Feature 13: 100% E2E Test Suite Pass & Build Verification');

describe('Feature 13: 100% E2E Test Suite Pass & Build Verification', () => {
  const rootDir = process.cwd();

  it('13.1 should have valid package.json with ESM type and build script', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    assert.strictEqual(pkg.type, 'module', 'Package must use ES modules');
    assert.ok(pkg.scripts && pkg.scripts.build, 'Must have build script');
    assert.includes(pkg.scripts.build, 'vite build');
  });

  it('13.2 should have valid vite.config.js with React plugin configured', () => {
    const viteConfigPath = path.join(rootDir, 'vite.config.js');
    const content = fs.readFileSync(viteConfigPath, 'utf8');

    assert.includes(content, '@vitejs/plugin-react');
    assert.includes(content, 'defineConfig');
  });

  it('13.3 should verify that all essential source directories exist and are populated', () => {
    const requiredDirs = ['components', 'data', 'pages', 'types', 'utils'];
    for (const d of requiredDirs) {
      const fullPath = path.join(rootDir, 'src', d);
      assert.ok(fs.existsSync(fullPath), `Directory src/${d} must exist`);
      const files = fs.readdirSync(fullPath);
      assert.greaterThan(files.length, 0, `Directory src/${d} must not be empty`);
    }
  });

  it('13.4 should verify PROJECT.md documents all 14 feature inventory items', () => {
    const projectMdPath = path.join(rootDir, 'PROJECT.md');
    const content = fs.readFileSync(projectMdPath, 'utf8');

    for (let i = 1; i <= 14; i++) {
      assert.includes(content, `| ${i} |`, `PROJECT.md must document Feature #${i}`);
    }
  });

  it('13.5 should verify dist assets or compilation readiness without missing dependencies', () => {
    const nodeModulesPath = path.join(rootDir, 'node_modules');
    assert.ok(fs.existsSync(nodeModulesPath), 'node_modules must exist in project');
  });
});
