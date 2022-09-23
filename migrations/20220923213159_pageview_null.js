exports.up = async (knex) => {
  await knex.schema.alterTable("events", (t) => {
    t.setNullable("name");
  });
  await knex("events").update({ name: null }).where("name", "pageview");
};

exports.down = async (knex) => {
  await knex("events").update({ name: "pageview" }).whereNull("name");
  await knex.schema.alterTable("events", (t) => {
    t.dropNullable("name");
  });
};
