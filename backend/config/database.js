const { Sequelize } = require('sequelize');

// Initialize your database connection
const sequelize = new Sequelize('owngoal', 'owngoalowner', 'LosfeliZ67!', {
  host: 'localhost',
  dialect: 'postgres'
});

// Test the database connection
async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkConnection();

// Export the sequelize instance to use in other parts of your application
module.exports = sequelize;