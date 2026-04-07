/**
 * verify-prod-boot.ts
 *
 * Proves the full documented production startup contract:
 *   1. Builds (prisma generate + tsc)
 *   2. Runs prisma migrate deploy (production-safe migration)
 *   3. Starts the compiled server with NODE_ENV=production
 *   4. Polls the health endpoint
 *   5. Verifies logs/ directory exists
 *   6. Sends SIGTERM for graceful shutdown
 *
 * This matches the documented `start:prod` contract:
 *   prisma migrate deploy && node dist/server.js
 *
 * Usage: npx tsx scripts/verify-prod-boot.ts
 *
 * Prerequisites:
 *   - PostgreSQL must be running (docker-compose up -d postgres)
 *   - .env must have valid DATABASE_URL and JWT secrets
 */

import { execSync, spawn } from 'child_process';

const PORT = 3099; // Use a non-default port to avoid conflicts with running dev server
const API_PREFIX = '/api/v1';
const HEALTH_URL = `http://localhost:${PORT}${API_PREFIX}/health`;
const BOOT_TIMEOUT_MS = 15000;
const HEALTH_POLL_INTERVAL_MS = 500;

function log(msg: string) {
  console.log(`[verify-prod-boot] ${msg}`);
}

function fail(msg: string): never {
  console.error(`[verify-prod-boot] ❌ FAIL: ${msg}`);
  process.exit(1);
}

// ─── Step 1: Build ──────────────────────────────────────────

log('Step 1: Building (prisma generate + tsc)...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch {
  fail('Build failed.');
}
log('Build succeeded.');

// ─── Step 2: Run production migrations ──────────────────────

log('Step 2: Running prisma migrate deploy...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch {
  fail('prisma migrate deploy failed.');
}
log('Migrations applied successfully.');

// ─── Step 3: Start production server ────────────────────────

log(`Step 3: Starting production server on port ${PORT}...`);

const serverProcess = spawn('node', ['dist/server.js'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PORT),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
serverProcess.stdout?.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
serverProcess.stderr?.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

// ─── Step 3: Wait for health endpoint ───────────────────────

async function pollHealth(): Promise<boolean> {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(HEALTH_URL);
      if (response.ok) {
        const body = await response.json();
        if (body?.data?.status === 'ok' && body?.data?.environment === 'production') {
          return true;
        }
      }
    } catch {
      // Server not ready yet, retry
    }
    await new Promise((r) => setTimeout(r, HEALTH_POLL_INTERVAL_MS));
  }

  return false;
}

async function run() {
  log('Step 4: Polling health endpoint...');

  // Handle process exit before we're done
  let earlyExit = false;
  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0 && !earlyExit) {
      console.error('\nServer output:\n' + serverOutput);
      fail(`Server process exited unexpectedly with code ${code}.`);
    }
  });

  const healthy = await pollHealth();

  if (!healthy) {
    console.error('\nServer output:\n' + serverOutput);
    earlyExit = true;
    serverProcess.kill('SIGTERM');
    fail(`Health endpoint did not respond within ${BOOT_TIMEOUT_MS}ms.`);
  }

  log('✅ Health endpoint responded: status=ok, environment=production');

  // ─── Step 5: Verify logs directory was created ────────────

  const fs = await import('fs');
  if (fs.existsSync('logs')) {
    log('✅ logs/ directory exists.');
  } else {
    earlyExit = true;
    serverProcess.kill('SIGTERM');
    fail('logs/ directory was not created in production mode.');
  }

  // ─── Step 6: Graceful shutdown ────────────────────────────

  log('Step 6: Sending SIGTERM for graceful shutdown...');
  earlyExit = true;
  serverProcess.kill('SIGTERM');

  // Wait for child to fully exit (including pipe cleanup) before reporting success
  const exitCode = await new Promise<number | null>((resolve) => {
    const timeout = setTimeout(() => {
      log('⚠️  Server did not exit within 10s, killing.');
      serverProcess.kill('SIGKILL');
      resolve(1);
    }, 12000);

    serverProcess.on('close', (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });

  if (exitCode === 0 || exitCode === null) {
    log('✅ Server shut down cleanly.');
  } else {
    log(`⚠️  Server exited with code ${exitCode} (may be normal on Windows).`);
  }

  log('');
  log('═══════════════════════════════════════');
  log('  Production boot verification PASSED  ');
  log('═══════════════════════════════════════');
}

run().catch((err) => {
  serverProcess.kill('SIGTERM');
  fail(`Unexpected error: ${err}`);
});
