const Sequelize = require('sequelize');
const sequelize = new Sequelize('owngoal', 'owngoalowner', 'LosfeliZ67!', {
  host: 'localhost',
  dialect: 'postgres'
});

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