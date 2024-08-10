module.exports = (sequelize, DataTypes) => {
    const BarTeam = sequelize.define('BarTeam', {
        bar_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Bars',
                key: 'id'
            }
        },
        team_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Teams', 
                key: 'id'
            }
        }
    });
    return BarTeam;
};