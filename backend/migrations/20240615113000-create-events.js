'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      bar_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Bars',
          key: 'id'
        },
        allowNull: false
      },
      match_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Matches',
          key: 'id'
        },
        allowNull: false
      },
      sound: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      earlyOpening: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      openingTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Events');
  }
};
