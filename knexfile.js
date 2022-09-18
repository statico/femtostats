module.exports = {
  client: "sqlite3",
  connection: { filename: process.env.DB_PATH || "/tmp/femtostats.db" },
  asyncStackTraces: process.env.NODE_ENV !== "production",
  useNullAsDefault: true,
};
