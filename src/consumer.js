require('dotenv').config();

const amqp = require('amqplib');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const MailSender = require('./services/nodemailer/MailSender');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const config = require('./utils/config');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const mailSender = new MailSender();

  const connection = await amqp.connect(config.rabbitMq.server);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlist', {
    durable: true,
  });

  channel.consume('export:playlist', async (message) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      // Get playlist data
      const playlist = await playlistsService.getPlaylistById(playlistId);
      const songs = await playlistsService.getSongsFromPlaylist(playlistId);

      const result = {
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

      const message = JSON.stringify(result);
      await mailSender.sendEmail(targetEmail, message);

      channel.ack(message);
    } catch (error) {
      console.log('Failed to process message', error);
      channel.nack(message, false, false);
    }
  });

  console.log('Consumer started and waiting for messages...');
};

init();
