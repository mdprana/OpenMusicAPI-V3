require('dotenv').config();
const nodemailer = require('nodemailer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function debugSMTP() {
  console.log('Gmail SMTP Debugger for OpenMusic API v3\n');
  console.log('This will help you setup Gmail SMTP correctly.\n');

  // Check current .env configuration
  console.log('Current .env configuration:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? 'SET (' + process.env.SMTP_PASSWORD.length + ' chars)' : 'NOT SET'}\n`);

  // Ask user about 2-Step Verification
  const has2Step = await ask('Have you enabled 2-Step Verification on your Gmail account? (y/n): ');
  
  if (has2Step.toLowerCase() !== 'y') {
    console.log('\nYou MUST enable 2-Step Verification first!');
    console.log('Steps:');
    console.log('1. Go to: https://myaccount.google.com/security');
    console.log('2. Find "2-Step Verification" and enable it');
    console.log('3. Follow all steps (you need a phone number)');
    console.log('4. Come back here after enabling it\n');
    rl.close();
    return;
  }

  // Ask about App Password
  const hasAppPassword = await ask('Have you generated an App Password for Mail? (y/n): ');
  
  if (hasAppPassword.toLowerCase() !== 'y') {
    console.log('\nYou need to generate an App Password!');
    console.log('Steps:');
    console.log('1. Go to: https://myaccount.google.com/security');
    console.log('2. Find "App passwords" (below 2-Step Verification)');
    console.log('3. Click "App passwords"');
    console.log('4. Select "Mail" and "Other (Custom name)"');
    console.log('5. Name it "OpenMusic API"');
    console.log('6. Copy the 16-character password');
    console.log('7. Update your .env file with this password\n');
    rl.close();
    return;
  }

  // Get email and app password from user
  const email = await ask('Enter your Gmail address: ');
  const appPassword = await ask('Enter your 16-character App Password (no spaces): ');

  console.log('\nTesting SMTP connection...');

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: appPassword.replace(/\s/g, ''), // Remove any spaces
      },
    });

    // Test connection
    await transporter.verify();
    console.log('Connection verified successfully!');

    // Send test email
    const sendTest = await ask('Send a test email? (y/n): ');
    
    if (sendTest.toLowerCase() === 'y') {
      console.log('Sending test email...');
      
      const info = await transporter.sendMail({
        from: email,
        to: email,
        subject: 'OpenMusic API v3 - SMTP Test Success',
        text: 'Congratulations! Your SMTP configuration is working correctly.',
        html: `
          <h2>OpenMusic API v3 - SMTP Test</h2>
          <p>Congratulations! Your SMTP configuration is working correctly.</p>
          <p><strong>Configuration used:</strong></p>
          <ul>
            <li>Host: smtp.gmail.com</li>
            <li>Port: 587</li>
            <li>Email: ${email}</li>
            <li>App Password: ${appPassword.substring(0, 4)}****</li>
          </ul>
          <p>You can now use this configuration in your .env file.</p>
        `,
      });

      console.log(`Test email sent successfully! Message ID: ${info.messageId}`);
      console.log('Check your email inbox.');
    }

    console.log('\nUpdate your .env file with these values:');
    console.log(`SMTP_HOST=smtp.gmail.com`);
    console.log(`SMTP_PORT=587`);
    console.log(`SMTP_USER=${email}`);
    console.log(`SMTP_PASSWORD=${appPassword.replace(/\s/g, '')}`);

  } catch (error) {
    console.log('\nSMTP Test Failed:');
    console.log(`Error: ${error.message}\n`);

    if (error.code === 'EAUTH') {
      console.log('Authentication Error - Possible causes:');
      console.log('1. Wrong email address');
      console.log('2. Wrong App Password');
      console.log('3. 2-Step Verification not properly enabled');
      console.log('4. App Password not generated correctly');
      console.log('\nSolutions:');
      console.log('- Double-check your email address');
      console.log('- Generate a new App Password');
      console.log('- Make sure you copied the App Password correctly (no spaces)');
      console.log('- Verify 2-Step Verification is active');
    }

    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('Connection Error - Possible causes:');
      console.log('1. Internet connection issues');
      console.log('2. Firewall blocking port 587');
      console.log('3. Antivirus blocking SMTP');
      console.log('\nSolutions:');
      console.log('- Check your internet connection');
      console.log('- Temporarily disable firewall/antivirus');
      console.log('- Try from a different network');
    }
  }

  rl.close();
}

debugSMTP().catch(console.error);
