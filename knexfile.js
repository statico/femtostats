module.exports = {
  client: "sqlite3",
  connection: { filename: (process.env.DATA_DIR || "/tmp") + "/stats.db" },
  asyncStackTraces: process.env.NODE_ENV !== "production",
  useNullAsDefault: true,
};
