// Seed generation utility according to case instructions.
// Usage: node seed.js <remote_url> <first_commit_epoch> <start_time>
const crypto = require('crypto');

const remote = process.argv[2] || '';
const epoch = process.argv[3] || '';
const start = process.argv[4] || '';

if (!remote || !epoch || !start) {
  console.error('Usage: node seed.js <remote_url> <first_commit_epoch> <start_time>\nExample: node seed.js "git@github.com:user/repo.git" 1588291200 202501011200');
  process.exit(1);
}

const raw = `${remote}|${epoch}|${start}`;
const hash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12);
console.log(hash);
