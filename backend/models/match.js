const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
    const Match = sequelize.define('Match', {
        a_team_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Teams',
                key: 'id'
            }
        },
        b_team_id: {
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
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        location: DataTypes.STRING,
        endTime: {
            type: DataTypes.VIRTUAL,
            get() {
                const startDateTime = moment.utc(`${this.date} ${this.time}`);
                return startDateTime.add(2, 'hours').toDate();
            }
        }
    });

    Match.associate = models => {
        Match.belongsTo(models.Team, { as: 'aTeam', foreignKey: 'a_team_id' });
        Match.belongsTo(models.Team, { as: 'bTeam', foreignKey: 'b_team_id' });
        Match.belongsTo(models.Competition, { as: 'competition', foreignKey: 'competition_id' });
        Match.hasMany(models.Event, { foreignKey: 'match_id', onDelete: 'CASCADE' });
    };

    return Match;
};
