'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Events', 'Events_match_id_fkey');
    await queryInterface.addConstraint('Events', {
      fields: ['match_id'],
      type: 'foreign key',
      name: 'Events_match_id_fkey',
      references: {
        table: 'Matches',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Events', 'Events_match_id_fkey');
    await queryInterface.addConstraint('Events', {
      fields: ['match_id'],
      type: 'foreign key',
      name: 'Events_match_id_fkey',
      references: {
        table: 'Matches',
        field: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    });
  },
};
