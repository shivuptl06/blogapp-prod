const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    cover: { type: String },
    author: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const PostModule = mongoose.model("Posts", PostSchema);
module.exports = PostModule;
