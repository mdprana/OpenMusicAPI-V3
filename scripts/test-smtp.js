require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing SMTP Configuration...\n');

  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  };

  console.log('SMTP Config:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Password: ${'*'.repeat(config.password?.length || 0)}\n`);

  // Check nodemailer version
  try {
    const packageInfo = require('nodemailer/package.json');
    console.log(`Nodemailer version: ${packageInfo.version}`);
  } catch (e) {
    console.log('Could not determine nodemailer version');
  }

  // Validate required fields
  if (!config.host || !config.port || !config.user || !config.password) {
    console.error('Missing SMTP configuration in .env file');
    console.log('Required variables:');
    console.log('- SMTP_HOST');
    console.log('- SMTP_PORT');
    console.log('- SMTP_USER');
    console.log('- SMTP_PASSWORD');
    process.exit(1);
  }

  try {
    // Use correct nodemailer syntax
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port, 10),
      secure: false,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully!\n');

    // Send test email
    const testEmail = {
      from: config.user,
      to: config.user, // Send to self for testing
      subject: 'OpenMusic API v3 - SMTP Test',
      text: 'Congratulations! Your SMTP configuration is working correctly.',
      attachments: [
        {
          filename: 'test-playlist.json',
          content: JSON.stringify({
            playlist: {
              id: 'playlist-test',
              name: 'Test Playlist',
              songs: [
                {
                  id: 'song-test',
                  title: 'Test Song',
                  performer: 'Test Artist',
                },
              ],
            },
          }, null, 2),
        },
      ],
    };

    console.log('Sending test email...');
    const info = await transporter.sendMail(testEmail);
    console.log('Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}\n`);

    console.log('SMTP setup completed successfully!');
    console.log('Check your email for the test message.');

  } catch (error) {
    console.error('SMTP Test Failed:');
    console.error(`Error: ${error.message}\n`);

    if (error.code === 'EAUTH') {
      console.log('Authentication Error Solutions:');
      console.log('1. Enable 2-Step Verification in your Gmail account');
      console.log('2. Generate an App Password for "Mail"');
      console.log('3. Use the App Password (16 chars) as SMTP_PASSWORD');
      console.log('4. Do NOT use your regular Gmail password\n');
    }

    if (error.code === 'ECONNREFUSED') {
      console.log('Connection Error Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify SMTP_HOST and SMTP_PORT settings');
      console.log('3. Check firewall/antivirus blocking port 587\n');
    }

    console.log('Helpful Resources:');
    console.log('- Gmail App Passwords: https://support.google.com/accounts/answer/185833');
    console.log('- 2-Step Verification: https://support.google.com/accounts/answer/185839');

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

testSMTP();
