import "dotenv/config";
import app from "./app.js";
import { connectDB, sequelize } from "./config/db.js";
import "./models/index.js";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  await sequelize.sync({ alter: true });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
