
exports.up = function(knex, Promise) {
  return knex.schema.
    createTable('locks', function locksTable(table) {
      table.increments('id').primary()
      table.uuid('macId').notNullable()
      table.string('name')
      table.integer("userId").unsigned().notNullable()
      table.foreign("userId").references("id").inTable("users")
      table.timestamps()
      table.unique(["name", "userId"])
      table.unique(["macId", "userId"])
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('locks')
};
