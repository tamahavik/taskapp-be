const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection established");
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username cannot be empty"],
  },
  email: {
    type: String,
    required: [true, "email cannot be empty"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password cannot be empty"],
  },
});

const User = mongoose.model("User", userSchema);

const testUser = new User({
  username: "admin",
  email: "admin@admin.com",
  password: "123456",
});

testUser
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "OK",
    data: "Hello World!",
  });
});

app.post("/register", (req, res) => {});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("listening on port " + port);
});
