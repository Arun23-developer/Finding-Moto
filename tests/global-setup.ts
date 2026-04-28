/**
 * Playwright global setup — runs once before all tests.
 * Seeds the test users (buyer + seller) into MongoDB.
 */
import { execSync } from 'child_process';
import path from 'path';

async function globalSetup() {
  const backendDir = path.resolve(__dirname, '..', 'backend');

  console.log('\n[global-setup] Seeding test users…');
  try {
    execSync('npx ts-node scripts/seedTestUsers.ts', {
      cwd: backendDir,
      stdio: 'inherit',
      timeout: 30000,
    });
    console.log('[global-setup] Test users ready.\n');
  } catch (err: any) {
    console.warn(
      '[global-setup] seedTestUsers failed — tests that require login may be skipped.\n',
      err?.message ?? err
    );
  }
}

export default globalSetup;
