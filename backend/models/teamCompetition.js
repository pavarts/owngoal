// teamCompetition.js
module.exports = (sequelize, DataTypes) => {
    const TeamCompetitions = sequelize.define('TeamCompetitions', {
      team_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Teams',
          key: 'id'
        }
      },
      competition_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Competitions',
          key: 'id'
        }
      }
    });
  
    return TeamCompetitions;
  };
  