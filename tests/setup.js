const { sequelizeVidhyatra } = require('../config/db');

beforeAll(async () => {
  // Wait for database connection
  try {
    await sequelizeVidhyatra.authenticate();
    console.log('Database connected for tests.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Close database connection
  await sequelizeVidhyatra.close();
});
