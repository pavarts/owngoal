const Sequelize = require('sequelize');

// Use environment variables for sensitive information
const sequelize = new Sequelize(process.env.SUPABASE_DB_NAME, process.env.SUPABASE_DB_USER, process.env.SUPABASE_DB_PASSWORD, {
  host: process.env.SUPABASE_DB_HOST,
  dialect: 'postgres',
  port: 6543, 
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Call the function
testDatabaseConnection();

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Team = require('./team')(sequelize, Sequelize.DataTypes);
db.Bar = require('./bar')(sequelize, Sequelize.DataTypes);
db.BarTeam = require('./barTeam')(sequelize, Sequelize.DataTypes);
db.Competition = require('./competition')(sequelize, Sequelize.DataTypes);
db.Event = require('./event')(sequelize, Sequelize.DataTypes);
db.Match = require('./match')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes); 

// Load model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;