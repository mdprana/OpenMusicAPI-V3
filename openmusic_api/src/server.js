require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

// Import routes
const albums = require('./routes/albums');
const songs = require('./routes/songs');
const users = require('./routes/users');
const authentications = require('./routes/authentications');
const playlists = require('./routes/playlists');
const collaborations = require('./routes/collaborations');
const exportRoutes = require('./routes/exports');
const uploads = require('./routes/uploads');
const likes = require('./routes/likes');

// Import error classes
const ClientError = require('./exceptions/ClientError');
const config = require('./utils/config');

const init = async () => {
  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register plugins
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Define JWT authentication strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Global error handling with onPreResponse
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Handle Joi validation errors
      if (response.isJoi || response.name === 'ValidationError') {
        const newResponse = h.response({
          status: 'fail',
          message: response.details ? response.details[0].message : response.message,
        });
        newResponse.code(400);
        return newResponse;
      }

      // Handle payload too large (413)
      if (response.output && response.output.statusCode === 413) {
        const newResponse = h.response({
          status: 'fail',
          message: 'Payload terlalu besar',
        });
        newResponse.code(413);
        return newResponse;
      }

      // Handle custom client errors
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Handle Hapi boom errors
      if (response.isBoom) {
        const { statusCode } = response.output;

        if (statusCode === 415) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Tipe media tidak didukung',
          });
          newResponse.code(415);
          return newResponse;
        }

        if (statusCode === 404) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Resource tidak ditemukan',
          });
          newResponse.code(404);
          return newResponse;
        }

        if (statusCode >= 400 && statusCode < 500) {
          const newResponse = h.response({
            status: 'fail',
            message: response.message || response.output.payload.message,
          });
          newResponse.code(statusCode);
          return newResponse;
        }

        // Server errors (500+)
        const newResponse = h.response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        newResponse.code(500);
        console.error(response);
        return newResponse;
      }

      // Generic server errors
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    // Continue with normal response
    return h.continue;
  });

  // Register all routes
  server.route([
    ...albums,
    ...songs,
    ...users,
    ...authentications,
    ...playlists,
    ...collaborations,
    ...exportRoutes,
    ...uploads,
    ...likes,
  ]);

  await server.start();
  console.log(`🎵 OpenMusic API v3 berjalan pada ${server.info.uri}`);
  console.log('✓ Ekspor Playlist (RabbitMQ + Email)');
  console.log('✓ Upload Sampul Album (Local/S3)');
  console.log('✓ Menyukai Album (Like System)');
  console.log('✓ Server-Side Cache (Redis)');
  console.log('✓ Fitur OpenMusic v1 & v2');
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

init();
