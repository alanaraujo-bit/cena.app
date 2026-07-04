// Monorepo-aware Metro config.
// Lets the mobile bundler resolve hoisted deps at the repo root and follow the
// @cena/shared workspace package.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo so changes in packages/shared trigger reloads.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from both the app and the hoisted root store.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Metro in SDK 57 follows workspace symlinks natively — no resolver override
// needed for @cena/shared.

module.exports = config;
