import { execSync } from 'node:child_process';

const targetRef = process.argv[2];
console.log(`--- Verifying Git Paths & Filenames ${targetRef ? `(ref: ${targetRef})` : '(working tree)'} ---`);

let trackedFiles;
try {
  if (targetRef) {
    const output = execSync(`git ls-tree -r -z --name-only ${targetRef}`, { maxBuffer: 10 * 1024 * 1024 });
    trackedFiles = output.toString('utf8').split('\0').filter(Boolean);
  } else {
    const output = execSync('git ls-files -z', { maxBuffer: 10 * 1024 * 1024 });
    trackedFiles = output.toString('utf8').split('\0').filter(Boolean);
  }
} catch (error) {
  console.error('Failed to run git command:', error.message);
  process.exit(1);
}

function hasControlChar(str) {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if ((code >= 0 && code <= 31) || code === 127) {
      return true;
    }
  }
  return false;
}

const violations = [];
const INVALID_CHARS_REGEX = /[\r\n"*:?<>|]/;

for (const filePath of trackedFiles) {
  // Check 1: embedded newlines or carriage returns
  if (filePath.includes('\n') || filePath.includes('\r')) {
    violations.push({
      path: filePath.replace(/\r/g, '\\r').replace(/\n/g, '\\n'),
      reason: 'Contains newline or carriage return character',
    });
    continue;
  }

  // Check 2: control characters
  if (hasControlChar(filePath)) {
    violations.push({
      path: filePath,
      reason: 'Contains ASCII control characters',
    });
    continue;
  }

  // Check 3: cross-platform invalid filesystem characters
  if (INVALID_CHARS_REGEX.test(filePath)) {
    violations.push({
      path: filePath,
      reason: 'Contains illegal filesystem characters (one of: " * : ? < > |)',
    });
    continue;
  }

  // Check 4: path segments with trailing dots or spaces
  const segments = filePath.split('/');
  for (const segment of segments) {
    if (segment.endsWith(' ') || (segment.endsWith('.') && segment !== '.' && segment !== '..')) {
      violations.push({
        path: filePath,
        reason: `Path segment "${segment}" ends with space or period (illegal on Windows)`,
      });
      break;
    }
  }
}

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} malformed Git path violation(s):`);
  for (const v of violations) {
    console.error(`  - [${v.reason}]: ${v.path}`);
  }
  process.exit(1);
}

console.log(`✅ All ${trackedFiles.length} Git paths have valid, safe paths and filenames.`);
