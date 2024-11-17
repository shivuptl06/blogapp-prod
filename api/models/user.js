//const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cover: { type: String, required: true, default: "default_image_url" },
    password: { type: String, required: true },
    followers: { type: [String], ref: "User", default: [] },
    following: {
      type: [String],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
