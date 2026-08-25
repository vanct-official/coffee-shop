const mysql = require('mysql2/promise');
const env = require('./env');

// Tạo connection pool
const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+07:00',
  dateStrings: ['DATE'], // DATE columns luôn trả về string 'YYYY-MM-DD', không convert sang Date object
});

// Set timezone to +07:00 for every connection session
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+07:00'", (err) => {
    if (err) {
      console.error('Database connection timezone setup failed:');
      console.error('Code:', err.code);
      console.error('Errno:', err.errno);
      console.error('SQL State:', err.sqlState);
      console.error('Message:', err.message);
    }
  });
});

// Test connection
const testConnection = async () => {
  let connection;
  let connectionError = null;

  try {
    connection = await pool.getConnection();
    await connection.query("SET time_zone = '+07:00'");
    console.log('Database connected successfully (timezone set to +07:00)');
  } catch (error) {
    connectionError = error;
  } finally {
    if (connection) {
      connection.release();
    }
  }

  if (connectionError) {
    console.error('Database connection failed:');
    console.error('Code:', connectionError.code);
    console.error('Errno:', connectionError.errno);
    console.error('SQL State:', connectionError.sqlState);
    console.error('Message:', connectionError.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = pool;
