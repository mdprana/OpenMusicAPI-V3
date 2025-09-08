const fs = require('fs');
const path = require('path');

console.log('Checking for nodemailer syntax errors...\n');

// Function to recursively find all JS files
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Find all JS files in src directory
const jsFiles = findJSFiles(path.join(__dirname, '..', 'src'));

let fixedFiles = 0;

jsFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for incorrect nodemailer syntax
  if (content.includes('createTransporter(')) {
    console.log(`Found error in: ${filePath}`);
    const fixedContent = content.replace(/createTransporter\(/g, 'createTransport(');
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
    fixedFiles++;
  }
});

if (fixedFiles === 0) {
  console.log('No nodemailer syntax errors found. All files are clean!');
} else {
  console.log(`\nFixed ${fixedFiles} file(s) with nodemailer syntax errors.`);
}

console.log('\nNow try running the consumer again:');
console.log('npm run dev:consumer');
