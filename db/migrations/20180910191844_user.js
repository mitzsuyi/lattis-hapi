
exports.up = function(knex, Promise) {
  return knex.schema.
    createTable('users', function usersTable(table) {
      table.increments('id').primary()
      table.string('username').notNullable()
      table.unique('username')
      table.string('password').notNullable()
      table.date('birthDate')
      table.string('name')      
      table.timestamps()
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('users')
};
