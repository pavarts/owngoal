'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Matches', 'time', {
      type: Sequelize.TIME,
      allowNull: true  // Set to true initially to avoid issues with existing data
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Matches', 'time');
  }
};