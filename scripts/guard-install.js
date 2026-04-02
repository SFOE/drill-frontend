/**
 * Blocks `npm install`. Only `npm ci` is allowed.
 * This script is referenced in package.json "preinstall".
 *
 * NOTE: `npm install --ignore-scripts` bypasses this guard (npm limitation).
 * That case is mitigated by:
 *   - CI workflows always using `npm ci --ignore-scripts`
 *   - `package-lock.json` being committed and verified by `npm ci`
 *   - Trivy + npm audit in the security CI workflow
 */
const command = process.env.npm_command;
if (!command || command === 'install') {
  console.error('\x1b[31m');
  console.error('ERROR: "npm install" is not allowed in this project.');
  console.error('Use "npm ci" to install dependencies from the lockfile.');
  console.error('\x1b[0m');
  process.exit(1);
}
