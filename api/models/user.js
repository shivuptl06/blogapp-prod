//const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  //   const { username, name, email, profilePic, followers, following } = useContext(UserContext);

  username: { type: String, required: true, min: 4, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cover: {
    type: String,
    required: true,
    default: `../default/defau.png`, // Default SVG profile pic
  },
  password: { type: String, required: true },
  followers: { type: Array, unique: true, },
  following: { type: Array, unique: true,  },
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
