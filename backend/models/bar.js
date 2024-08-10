module.exports = (sequelize, DataTypes) => {
  const Bar = sequelize.define('Bar', {
      name: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      place_id: DataTypes.STRING,
      location: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      neighborhood: {
        type: DataTypes.STRING,
        allowNull: true
      },
      capacity: DataTypes.INTEGER,
      phone: DataTypes.STRING,
      instagram: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
              isUrlOrEmpty(value) {
                  if (value && value !== '' && !/^https?:\/\/\S+$/.test(value)) {
                      throw new Error("Instagram must be a valid URL");
                  }
              }
          }
      },
      website: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
              isUrlOrEmpty(value) {
                  if (value && value !== '' && !/^https?:\/\/\S+$/.test(value)) {
                      throw new Error("Website must be a valid URL");
                  }
              }
          }
      },
      photos: DataTypes.STRING,
      numberOfTVs: DataTypes.INTEGER,
      hasOutdoorSpace: DataTypes.BOOLEAN,
      bio: DataTypes.TEXT,
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
  });

  Bar.associate = models => {
      Bar.hasMany(models.Event, { foreignKey: 'bar_id' });
      Bar.belongsToMany(models.Team, { through: 'BarTeam', as: 'supportedTeams', foreignKey: 'bar_id', otherKey: 'team_id' });
  };

  return Bar;
};
