import mongoose from "mongoose";
import { DB_NAME } from "../../constants";

// Connect to MongoDB
const connect = async () => {
  try {
    const instance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log("Connected to MongoDB successfully --- Host:: ", instance.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
};

export default connect;