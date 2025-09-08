require('dotenv').config();
const { Pool } = require('pg');
const redis = require('redis');
const amqp = require('amqplib');

async function testServices() {
  console.log('Testing All Required Services...\n');

  let allPassed = true;

  // Test PostgreSQL
  console.log('Testing PostgreSQL...');
  try {
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });

    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL: Connected successfully');
    console.log(`   Database: ${process.env.PGDATABASE}`);
    console.log(`   Time: ${result.rows[0].now}\n`);
    await pool.end();
  } catch (error) {
    console.error('PostgreSQL: Connection failed');
    console.error(`   Error: ${error.message}\n`);
    allPassed = false;
  }

  // Test Redis
  console.log('Testing Redis...');
  try {
    const redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
    });

    await redisClient.connect();
    const pong = await redisClient.ping();
    console.log('Redis: Connected successfully');
    console.log(`   Response: ${pong}`);
    console.log(`   Host: ${process.env.REDIS_SERVER || 'localhost'}:${process.env.REDIS_PORT || 6379}\n`);
    await redisClient.disconnect();
  } catch (error) {
    console.error('Redis: Connection failed');
    console.error(`   Error: ${error.message}\n`);
    allPassed = false;
  }

  // Test RabbitMQ
  console.log('Testing RabbitMQ...');
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER || 'amqp://localhost');
    const channel = await connection.createChannel();
    
    console.log('RabbitMQ: Connected successfully');
    console.log(`   Server: ${process.env.RABBITMQ_SERVER || 'amqp://localhost'}`);
    console.log('   Web UI: http://localhost:15672 (guest/guest)\n');
    
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('RabbitMQ: Connection failed');
    console.error(`   Error: ${error.message}\n`);
    allPassed = false;
  }

  // Test Database Tables
  console.log('Testing Database Tables...');
  try {
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const expectedTables = [
      'albums',
      'authentications',
      'collaborations',
      'pgmigrations',
      'playlist_song_activities',
      'playlist_songs',
      'playlists',
      'songs',
      'user_album_likes',
      'users',
    ];

    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    if (missingTables.length === 0) {
      console.log('Database Tables: All required tables exist');
      console.log(`   Tables found: ${existingTables.length}`);
    } else {
      console.error('Database Tables: Missing tables');
      console.error(`   Missing: ${missingTables.join(', ')}`);
      console.error('   Run: npm run migrate:up');
      allPassed = false;
    }

    await pool.end();
  } catch (error) {
    console.error('Database Tables: Check failed');
    console.error(`   Error: ${error.message}`);
    allPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('All Services Test PASSED!');
    console.log('PostgreSQL, Redis, RabbitMQ are ready');
    console.log('Database tables are properly migrated');
    console.log('\nYou can now start the application:');
    console.log('   npm run dev (API Server)');
    console.log('   npm run dev:consumer (Consumer)');
  } else {
    console.log('Some Services Test FAILED!');
    console.log('Please fix the issues above before starting the application');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

testServices();
