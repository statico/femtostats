exports.up = (knex) => {
  return knex.schema.alterTable("events", (t) => {
    t.text("country").index();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable("events", (t) => {
    t.dropColumn("country");
  });
};
