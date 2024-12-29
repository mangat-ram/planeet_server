import app from "./app";
import connect from "./services/mongoDB";
import { createRedisClient } from "./services/redis";
import { port } from "./config";

connect()
  .then(() => {
    try {
      createRedisClient();
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.error("Error creating Redis client:", error);
      process.exit(1); // Exit if Redis client could not be created
    }
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB: ", error);
    process.exit(1); // Exit if MongoDB connection fails
  });
