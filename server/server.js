import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });
import app from "./app.js";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
).replace("<USERNAME>", process.env.DATABASE_USERNAME);

<<<<<<< HEAD
mongoose.connect(DB).then(() => console.log("DB connection successful"));
// test
=======
mongoose.connect(DB).then(() => console.log("DB connection successul"));

>>>>>>> bc8dcb0 (test deleted)

const port = process.env.PORT || 6969;
const server = app.listen(port, () => console.log("Listening on port " + port));
