import app from "./app";
import dotenv from "dotenv";
import connect from "./services/mongoDB";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB: ", error);
  });