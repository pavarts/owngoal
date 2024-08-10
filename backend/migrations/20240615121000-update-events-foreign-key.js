'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing foreign key constraint if any
    await queryInterface.removeConstraint('Events', 'Events_match_id_fkey');

    // Add foreign key constraint with cascade on delete
    await queryInterface.addConstraint('Events', {
      fields: ['match_id'],
      type: 'foreign key',
      name: 'Events_match_id_fkey',
      references: {
        table: 'Matches',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('Events', 'Events_match_id_fkey');

    // Add the original foreign key constraint
    await queryInterface.addConstraint('Events', {
      fields: ['match_id'],
      type: 'foreign key',
      name: 'Events_match_id_fkey',
      references: {
        table: 'Matches',
        field: 'id',
      },
      onDelete: 'NO ACTION',
    });
  },
};
