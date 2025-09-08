console.log('Checking nodemailer installation...\n');

try {
  // Check if nodemailer is installed
  const nodemailer = require('nodemailer');
  console.log('Nodemailer import: SUCCESS');
  
  // Check version
  try {
    const packageInfo = require('nodemailer/package.json');
    console.log(`Nodemailer version: ${packageInfo.version}`);
  } catch (e) {
    console.log('Could not read nodemailer version');
  }
  
  // Check available methods
  console.log('\nAvailable methods:');
  console.log('- createTransport:', typeof nodemailer.createTransport);
  console.log('- getTestMessageUrl:', typeof nodemailer.getTestMessageUrl);
  
  // Test basic transporter creation
  console.log('\nTesting transporter creation...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'test@example.com',
      pass: 'test'
    }
  });
  
  console.log('Transporter created successfully!');
  console.log('Transporter type:', typeof transporter);
  console.log('Available transporter methods:');
  console.log('- sendMail:', typeof transporter.sendMail);
  console.log('- verify:', typeof transporter.verify);
  
} catch (error) {
  console.error('Nodemailer check failed:');
  console.error('Error type:', error.constructor.name);
  console.error('Error message:', error.message);
  
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('\nSolution: Install nodemailer');
    console.log('Run: npm install nodemailer');
  }
  
  console.log('\nDebugging info:');
  console.log('Node version:', process.version);
  console.log('Current directory:', process.cwd());
  
  // Check if node_modules exists
  const fs = require('fs');
  const path = require('path');
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const nodemailerPath = path.join(nodeModulesPath, 'nodemailer');
  
  console.log('node_modules exists:', fs.existsSync(nodeModulesPath));
  console.log('nodemailer folder exists:', fs.existsSync(nodemailerPath));
  
  if (fs.existsSync(nodemailerPath)) {
    const packagePath = path.join(nodemailerPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log('Installed nodemailer version:', pkg.version);
      } catch (e) {
        console.log('Could not read nodemailer package.json');
      }
    }
  }
}
