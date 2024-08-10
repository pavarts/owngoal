module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
        bar_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Bars', // 'Bars' is the table name
                key: 'id'
            }
        },
        match_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Matches', // 'Matches' is the table nam
                key: 'id'
            }
        },
        sound: DataTypes.BOOLEAN,
        earlyOpening: DataTypes.BOOLEAN,
        openingTime: DataTypes.TIME
    });
    
    Event.associate = models => {
        Event.belongsTo(models.Bar, { foreignKey: 'bar_id' });
        Event.belongsTo(models.Match, { foreignKey: 'match_id', onDelete: 'CASCADE' });
    };

    return Event;
  
  };