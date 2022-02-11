const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
