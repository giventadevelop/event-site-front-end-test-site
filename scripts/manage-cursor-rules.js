#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RULES_DIR = '.cursor/rules';
const SHARED_RULES_DIR = 'shared-cursor-rules';

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRules(source, destination) {
  if (!fs.existsSync(source)) {
    console.error(`❌ Source directory not found: ${source}`);
    return false;
  }

  ensureDirectoryExists(destination);

  const files = fs.readdirSync(source);
  let copiedCount = 0;

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
      console.log(`✅ Copied: ${file}`);
    }
  });

  return copiedCount;
}

function exportRules() {
  console.log('📤 Exporting cursor rules to shared directory...');
  const count = copyRules(RULES_DIR, SHARED_RULES_DIR);
  if (count > 0) {
    console.log(`✅ Exported ${count} rule files to ${SHARED_RULES_DIR}/`);
  } else {
    console.log('❌ No rules found to export');
  }
}

function importRules() {
  console.log('📥 Importing cursor rules from shared directory...');
  const count = copyRules(SHARED_RULES_DIR, RULES_DIR);
  if (count > 0) {
    console.log(`✅ Imported ${count} rule files to ${RULES_DIR}/`);
  } else {
    console.log('❌ No rules found to import');
  }
}

function listRules() {
  console.log('📋 Current project rules:');
  if (fs.existsSync(RULES_DIR)) {
    const files = fs.readdirSync(RULES_DIR);
    files.forEach(file => {
      const stats = fs.statSync(path.join(RULES_DIR, file));
      console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    });
  } else {
    console.log('  No rules directory found');
  }

  console.log('\n📋 Shared rules:');
  if (fs.existsSync(SHARED_RULES_DIR)) {
    const files = fs.readdirSync(SHARED_RULES_DIR);
    files.forEach(file => {
      const stats = fs.statSync(path.join(SHARED_RULES_DIR, file));
      console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    });
  } else {
    console.log('  No shared rules directory found');
  }
}

function createGitRepo() {
  console.log('🔧 Creating git repository for shared rules...');
  try {
    if (!fs.existsSync('.git')) {
      execSync('git init', { stdio: 'inherit' });
    }
    execSync('git add shared-cursor-rules/', { stdio: 'inherit' });
    execSync('git commit -m "Add shared cursor rules"', { stdio: 'inherit' });
    console.log('✅ Git repository created with shared rules');
  } catch (error) {
    console.error('❌ Error creating git repository:', error.message);
  }
}

function showHelp() {
  console.log(`
🔄 Cursor Rules Manager

Usage: node scripts/manage-cursor-rules.js [command]

Commands:
  export    - Export current project rules to shared directory
  import    - Import rules from shared directory to current project
  list      - List all available rules
  git       - Create git repository for shared rules
  help      - Show this help message

Examples:
  node scripts/manage-cursor-rules.js export
  node scripts/manage-cursor-rules.js import
  node scripts/manage-cursor-rules.js list
`);
}

const command = process.argv[2] || 'help';

switch (command) {
  case 'export':
    exportRules();
    break;
  case 'import':
    importRules();
    break;
  case 'list':
    listRules();
    break;
  case 'git':
    createGitRepo();
    break;
  case 'help':
  default:
    showHelp();
    break;
}