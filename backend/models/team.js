module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
      name: DataTypes.STRING,
      short_name: DataTypes.STRING,
      type: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      stadium: DataTypes.STRING,
      logo: {
        type: DataTypes.STRING,
        validate: {
            isLogo(value) {
                if (!value.match(/^https?:\/\/.+/) && !value.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u)) {
                    throw new Error('Logo must be a valid URL or an emoji flag');
                }
            }
        }
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });

    Team.associate = models => {
        // Association for when the team is the home team
        Team.hasMany(models.Match, { as: 'aTeam', foreignKey: 'a_team_id' });
    
        // Association for when the team is the away team
        Team.hasMany(models.Match, { as: 'bTeam', foreignKey: 'b_team_id' });

        // For bars that support specific teams
        Team.belongsToMany(models.Bar, { through: 'BarTeam', as: 'supportedTeams',foreignKey: 'team_id', otherKey: 'bar_id' });

        // For teams that belong to different competitions
        Team.belongsToMany(models.Competition, {
          through: 'TeamCompetitions',
          as: 'competitions',
          foreignKey: 'team_id',
          otherKey: 'competition_id',
          onDelete: 'CASCADE'
        });
    };

    return Team;
  };