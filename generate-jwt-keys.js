const crypto = require('crypto');

function generateSecureKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('=== JWT Keys Generator ===\n');
console.log('ACCESS_TOKEN_KEY=' + generateSecureKey());
console.log('REFRESH_TOKEN_KEY=' + generateSecureKey());
console.log('\nCopy keys di atas ke file .env Anda');
console.log('Pastikan keys ini rahasia dan tidak di-commit ke git!');

// Alternative: Generate base64 keys
console.log('\n=== Alternative Base64 Keys ===');
console.log('ACCESS_TOKEN_KEY=' + crypto.randomBytes(32).toString('base64'));
console.log('REFRESH_TOKEN_KEY=' + crypto.randomBytes(32).toString('base64'));