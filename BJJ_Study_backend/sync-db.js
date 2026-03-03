import db from "./models/index.js";

async function sync() {
  try {
    await db.sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
    process.exit();
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
}

sync();
