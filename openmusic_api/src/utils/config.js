const config = {
  app: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
  },
  database: {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE || 1800,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER || 'amqp://localhost',
  },
  redis: {
    host: process.env.REDIS_SERVER || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  storage: {
    path: process.env.UPLOAD_PATH || './uploads',
  },
};

module.exports = config;
