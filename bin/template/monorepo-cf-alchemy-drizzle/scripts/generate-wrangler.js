#!/usr/bin/env node

/**
 * Wrangler Configuration Generator
 *
 * This script generates package-specific wrangler.jsonc files by merging
 * the base configuration with package-specific overrides.
 *
 * Usage: pnpm wrangler:generate
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Package configurations
const packages = [
  {
    name: 'cf-worker',
    config: {
      name: 'template-worker',
      main: 'src/index.ts',
      triggers: {
        crons: ['0 6 * * *'] // Daily at 6 AM UTC
      },
      vars: {
        WORKER_ENABLED: 'true'
      }
    }
  }
  // Add more workers here as needed
];

// Parse JSONC (JSON with comments)
function parseJSONC(content) {
  // Remove single-line comments
  const withoutSingleLine = content.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  const withoutComments = withoutSingleLine.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove trailing commas
  const withoutTrailingCommas = withoutComments.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(withoutTrailingCommas);
}

// Deep merge objects
function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        result[key] = [...target[key], ...source[key]];
      } else {
        result[key] = deepMerge(target[key], source[key]);
      }
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

// Generate JSONC with header comment
function generateJSONC(config, packageName) {
  const header = `// Auto-generated wrangler configuration for ${packageName}
// DO NOT EDIT DIRECTLY - run \`pnpm wrangler:generate\` to regenerate
// Base configuration: ../wrangler.base.jsonc
`;

  return header + JSON.stringify(config, null, 2);
}

// Main generation logic
function main() {
  console.log('🔧 Generating wrangler configurations...\n');

  // Read base config
  const baseConfigPath = join(rootDir, 'wrangler.base.jsonc');
  if (!existsSync(baseConfigPath)) {
    console.error('❌ Base config not found:', baseConfigPath);
    process.exit(1);
  }

  const baseContent = readFileSync(baseConfigPath, 'utf-8');
  const baseConfig = parseJSONC(baseContent);

  // Remove $schema from merged config (will be added at package level)
  const { $schema, ...baseWithoutSchema } = baseConfig;

  // Generate config for each package
  for (const pkg of packages) {
    const packageDir = join(rootDir, 'packages', pkg.name);

    if (!existsSync(packageDir)) {
      console.log(`⚠️  Skipping ${pkg.name}: directory not found`);
      continue;
    }

    // Merge base config with package-specific config
    const mergedConfig = deepMerge(baseWithoutSchema, pkg.config);

    // Add schema reference
    const finalConfig = {
      $schema: 'node_modules/wrangler/config-schema.json',
      ...mergedConfig
    };

    // Write to package
    const outputPath = join(packageDir, 'wrangler.jsonc');
    const content = generateJSONC(finalConfig, pkg.name);
    writeFileSync(outputPath, content);

    console.log(`✅ Generated: packages/${pkg.name}/wrangler.jsonc`);
  }

  console.log('\n🎉 Done!');
}

main();
