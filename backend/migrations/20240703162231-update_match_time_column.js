'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Matches', 'time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Matches', 'time', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};