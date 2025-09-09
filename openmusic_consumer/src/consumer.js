require('dotenv').config();

const amqp = require('amqplib');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const MailSender = require('./services/nodemailer/MailSender');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const config = require('./utils/config');

const init = async () => {
  console.log('🎵 OpenMusic Consumer Starting...\n');

  // Validate required environment variables
  const requiredEnvVars = [
    'RABBITMQ_SERVER',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`));
    console.error('\nPlease check your .env file and restart the consumer.');
    process.exit(1);
  }

  try {
    // Initialize services
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const mailSender = new MailSender();

    console.log('🔗 Connecting to RabbitMQ...');
    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();

    console.log('✅ Connected to RabbitMQ successfully');

    // Declare queue
    const queueName = 'export:playlist';
    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log(`📥 Listening for messages on queue: ${queueName}`);
    console.log('🔄 Consumer is ready and waiting for export requests...\n');

    // Set prefetch to process one message at a time
    channel.prefetch(1);

    // Consume messages
    channel.consume(queueName, async (message) => {
      if (message !== null) {
        try {
          console.log('📨 Received export request');
          const { playlistId, targetEmail } = JSON.parse(message.content.toString());

          console.log(`   Playlist ID: ${playlistId}`);
          console.log(`   Target Email: ${targetEmail}`);

          // Get playlist data
          console.log('🔍 Fetching playlist data...');
          const playlist = await playlistsService.getPlaylistById(playlistId);
          const songs = await playlistsService.getSongsFromPlaylist(playlistId);

          console.log(`   Playlist: ${playlist.name}`);
          console.log(`   Songs count: ${songs.length}`);

          // Prepare export data matching the required format
          const exportData = {
            playlist: {
              id: playlist.id,
              name: playlist.name,
              songs: songs.map((song) => ({
                id: song.id,
                title: song.title,
                performer: song.performer,
              })),
            },
          };

          const exportJson = JSON.stringify(exportData, null, 2);

          console.log('📤 Sending email...');
          await mailSender.sendEmail(targetEmail, exportJson);

          console.log('✅ Export completed successfully');
          console.log(`   Email sent to: ${targetEmail}`);
          console.log(`   Playlist: ${playlist.name} (${songs.length} songs)\n`);

          // Acknowledge message
          channel.ack(message);
        } catch (error) {
          console.error('❌ Failed to process export request:');
          console.error(`   Error: ${error.message}`);
          console.error(`   Stack: ${error.stack}\n`);

          // Reject message and don't requeue to avoid infinite loop
          channel.nack(message, false, false);
        }
      }
    });

    // Handle connection events
    connection.on('error', (error) => {
      console.error('RabbitMQ Connection Error:', error.message);
    });

    connection.on('close', () => {
      console.log('RabbitMQ Connection Closed');
      console.log('Attempting to reconnect in 5 seconds...');
      setTimeout(() => {
        init();
      }, 5000);
    });
  } catch (error) {
    console.error('Consumer initialization failed:');
    console.error(`   Error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      console.error('\nRabbitMQ Connection Failed:');
      console.error('   1. Make sure RabbitMQ is running');
      console.error('   2. Check RABBITMQ_SERVER in .env file');
      console.error('   3. Default: amqp://localhost');
      console.error('\n   Start RabbitMQ:');
      console.error('   - Windows: Start RabbitMQ Service');
      console.error('   - macOS: brew services start rabbitmq');
      console.error('   - Linux: sudo systemctl start rabbitmq-server');
    }

    console.error('\nRetrying in 10 seconds...');
    setTimeout(() => {
      init();
    }, 10000);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Consumer shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Consumer terminated');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection in Consumer:', err);
  process.exit(1);
});

// Start the consumer
init();
