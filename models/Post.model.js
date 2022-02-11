const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
});

const PostModel = mongoose.model("posts", PostSchema);
module.exports = PostModel;
