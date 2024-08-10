module.exports = (sequelize, DataTypes) => {
    const Competition = sequelize.define('Competition', {
      name: DataTypes.STRING,
      type: DataTypes.STRING,  // 'league' or 'cup'
      country: DataTypes.STRING
    });

    Competition.associate = models => {
        Competition.hasMany(models.Match, { foreignKey: 'competition_id', as:'matches'});

        //For compeitions that host many teams
        Competition.belongsToMany(models.Team, {
          through: 'TeamCompetitions',
          as: 'teams',
          foreignKey: 'competition_id',
          otherKey: 'team_id',
          onDelete: 'CASCADE'
        });
    };

    return Competition;
  };