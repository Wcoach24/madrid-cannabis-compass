#!/usr/bin/env node
/**
 * Complete SSG Build Pipeline
 * 
 * Runs the full build process:
 * 1. Vite build
 * 2. Prerender all routes
 * 3. Validate SEO
 * 
 * Usage: node scripts/build-ssg.mjs
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Running: ${command} ${args.join(' ')}\n`);
    
    const proc = spawn(command, args, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting SSG Build Pipeline\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Vite build
    console.log('\n📦 STEP 1: Building with Vite...\n');
    await run('npx', ['vite', 'build']);

    // Step 2: Prerender
    console.log('\n🎭 STEP 2: Prerendering all routes...\n');
    await run('node', ['scripts/prerender.mjs']);

    // Step 3: Generate Sitemap
    console.log('\n🗺️  STEP 3: Generating sitemap...\n');
    await run('node', ['scripts/generate-sitemap.mjs']);

    // Step 4: Validate SEO
    console.log('\n🔍 STEP 4: Validating SEO...\n');
    await run('node', ['scripts/validate-seo.mjs']);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SSG BUILD COMPLETE');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('  1. Deploy dist/ to Vercel');
    console.log('  2. Run smoke tests: node scripts/smoke-test.mjs');
    console.log('');

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
