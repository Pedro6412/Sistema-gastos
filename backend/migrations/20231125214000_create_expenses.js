exports.up = function(knex) {
  return knex.schema.createTable('expenses', function(table) {
    table.increments('id').primary();
    table.string('description').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('category').notNullable();
    table.date('date').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('expenses');
};
