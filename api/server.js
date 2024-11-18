const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");
const Post = require("./models/post");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const port = process.env.PORT || 5000; // or any other safe port
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests
  })
);

const secretKey = process.env.SECRET_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(express.json());
app.use(cookieParser());

const uploadMiddleware = multer({ storage: multer.memoryStorage() });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
// ! For signup page
app.post("/register", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const file = req.file;

    // Validate request data
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!file) {
      return res.status(400).json({ error: "Profile image is required." });
    }

    console.log("File received:", file);

    // Upload the image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "profilePicture", // Organize uploads in "profilePicture" folder
      public_id: uuidv4(), // Generate a unique identifier for the file
    });

    console.log("Cloudinary upload successful:", uploadResult);

    // Clean up the temporary file
    fs.unlinkSync(file.path);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the user to the database
    const newUser = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      cover: uploadResult.secure_url,
      following: [], // Set default value explicitly if needed
      followers: [],
    });

    console.log("New user created:", newUser);

    // Respond with success
    res.status(201).json({
      message: "User Registration Successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        cover: newUser.cover,
        following: [],
        followers: [],
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: `Validation error: ${error.message}` });
    }

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(error.keyValue || error.keyPattern || {}).join(", ") ||
        "unknown field";
      return res.status(409).json({
        error: `The following already exists: ${duplicateField}`,
      });
    }

    res.status(500).json({ error: "Internal server error from file github" });
  }
});

// ! For Login Page
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Fetch user by username only
  const user = await User.findOne({ username: username }); // This only fetches the user document based on the username

  try {
    if (!user) {
      console.error("User Not Found");
      console.log("User Not Found at 84: ", user); // Logs `null` since no user was found
      res.status(404).json("User Not Found");
    } else {
      // Compare entered password with the stored hashed password in the user document
      const isMatch = await bcrypt.compare(password, user.password); // bcrypt compares the plain password with the hashed password in DB

      if (isMatch) {
        // JWT
        jwt.sign({ username, id: user.id }, secretKey, {}, (error, token) => {
          if (error) {
            console.log("Error in Login at 94", error);
            res.status(500).json({ message: "Internal Server Error" });
          } else {
            res.cookie("token", token,{
    httpOnly: true,
    secure: true, // Set to true in production
    sameSite: "none",
  }).json("OK");
          }
        });
      } else {
        res.status(401).json("Invalid Password");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error", error);
  }
});

// ! For profile Page
app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  // if (!token) {
  //   res.status(401).json("Unauthorized get/profile");
  //   console.log("No Token Found");
  // } else {
    jwt.verify(token, secretKey, {}, async (error, info) => {
      // console.log("Token Verification Started");
      if (error) {
        console.log("Error in Profile retrival at 120: ", error);
        console.log("Token Verification Error");
        res.status(401).json("Unauthorized get/profile");
      } else {
        // console.log("Token: ", token);
        //console.log("Sent Data: ", info);
        const userProfile = await User.findOne({ username: info.username });
        // console.log("User Profile Fetched: ", userProfile);
        res.json(userProfile);
      }
    });
  // }
});

// ! TO GET BLOGS POSTED BY A USER
app.get("/profile/blogs", async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(401).json("Unauthorized get/profile");
    console.log("No Token Found");
  } else {
    jwt.verify(token, secretKey, {}, async (error, info) => {
      if (error) {
        console.log("Error in Blogs retrival at 143: ", error);
        console.log("Token Verification Error");
        res.status(401).json("Unauthorized get/profile");
      } else {
        const userProfile = await User.findOne({ username: info.username });
        // console.log("UserProfile: ",userProfile);
        const blogs = await Post.find({ author: userProfile.username });
        res.json(blogs);
        //console.log("Blog Info Sent: ", blogs);
        // Blogs are correctly sent ✅
      }
    });
  }
});

// ! For logout Page
app.post("/logout", async (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" }); // Clear the cookie
  res.status(200).json({ message: "Logged out successfully" });
});

// ! For create-new-post Page
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { token } = req.cookies;
  console.log("Request Body:", req.body); // Log the body (title, summary, content)
console.log("Uploaded File Info:", req.file); // Log the file object


  if (!token) {
    console.log("Entered !token");
    return res.status(401).json("Unauthorized: No token in post:post");
  }

  jwt.verify(token, secretKey, {}, async (error, info) => {

    console.log("Entered jwt verification");
    
    
    if (error) {
      console.log("Entered Error block 1 in JWT verification block");
      return res.status(401).json("Unauthorized: Error in post:post");
    }

    const file = req.file;
    if (!file) {
      console.log("No File Found. Entered !file in JWT Verification");
      return res.status(400).json({ error: "File upload failed" });
    }

    const { title, summary, content } = req.body;

     try {
      console.log("Entered Try Block In JWT verification");
      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload_stream({
        folder: "postImages",
      }, async (error, result) => {
        if (error) {
          console.log("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Error uploading image" });
        }

        // Create the post with the Cloudinary URL
        const postDoc = await Post.create({
          title,
          summary,
          content,
          cover: result.secure_url,
          author: info.username,
        });

        console.log("Post Created On Cloudinary: ", postDoc);
        res.status(200).json(postDoc);
      }).end(file.buffer);

    }
     catch (err) {
      console.log("Faced Error. Entered Catch Block in main try-catch");

      console.log("Error creating post:", err);

      // Clean up the temp file in case of an error
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.status(500).json({ message: "Error creating post" });
    }
  });
});

// ! To Get All Posts to display in homescreen
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts in /post get:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// //
// app.get("/post", async (req, res) => {
//   const posts = await Post.find();
//   res.json(posts);
// });

// ! Delete The Post
app.post("/delete", async (req, res) => {
  const { id } = req.body;

  try {
    const deletePost = await Post.findById(id);

    if (!deletePost) {
      return res.status(404).json("Post Not Found");
    }

    // Delete the file from Cloudinary
    const oldImagePublicId = deletePost.cover.split("/").pop().split(".")[0]; // Extract public ID
    await cloudinary.uploader.destroy(`postImages/${oldImagePublicId}`);

    // Delete the post from MongoDB
    await Post.deleteOne({ _id: id });

    res.status(200).json("Post deletion successful");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json("Internal Server Error");
  }
});

// ! Edit the post of user
app.post("/edit", uploadMiddleware.single("file"), async (req, res) => {
  const { id, title, summary, content } = req.body;
  const file = req.file;

  try {
    const findPost = await Post.findById(id); // Ensure the post exists

    if (!findPost) {
      return res.status(404).json("Post Not Found");
    }

    // If a new file is uploaded, handle file replacement
    if (file) {
      // Delete the old file from Cloudinary
      const oldImagePublicId = findPost.cover.split("/").pop().split(".")[0]; // Extract public ID from the URL
      await cloudinary.uploader.destroy(`postImages/${oldImagePublicId}`);

      // Upload new file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "postImages",
      });

      // Update the cover field with the new URL
      findPost.cover = uploadResult.secure_url;

      // Clean up the temporary file
      fs.unlinkSync(file.path);
    }

    // Update other fields
    findPost.title = title;
    findPost.summary = summary;
    findPost.content = content;

    await findPost.save(); // Save the updated document

    res.status(200).json(findPost); // Return updated post
  } catch (error) {
    console.error("Error updating post:", error);

    // Clean up temp file in case of error
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(500).json("Internal Server Error");
  }
});

// ! To Search For User Details and sends User Details searched and also blogs posted by that user
app.post("/search/users", async (req, res) => {
  const { query } = req.body;
  //console.log("Search Parameter at 271: ", query);

  const findUserData = await User.findOne({ username: query });
  const findPost = await Post.findOne({ author: findUserData.username });
  if (!findUserData) {
    //console.log("User Not Found 404 at 275");
    return res.status(404).json("User Not Found");
  } else {
    // console.log("User Found at 278", findUserData);
    //console.log("Blogs Found at 280", findPost);
    return res.status(200).json([findUserData, findPost]);
  }
});

// ! Retrieves the posts of people that the user follows
// ! Retrieves the posts of people that the user follows
app.post("/getPosts", async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user to get their following list
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followingList = user.following;

    // Retrieve posts of users in the following list, sorted by timestamp (descending)
    const retrievedPosts = await Post.find({
      author: { $in: followingList },
    })
      .sort({ timestamp: -1 })
      .lean(); // Use await here to get the data

    //  console.log("Posts Found: ", retrievedPosts);

    // Send the retrieved posts as a response
    res.status(200).json(retrievedPosts);
    console.log("Sent Relevant Posts");
  } catch (error) {
    console.error("Error retrieving User-Specific posts:", error);
    res.status(500).json("Error retrieving User-Specific posts:");
  }
});

// ! Follows a user when follow button is clicked [Update Followers and Following]
app.post("/follow", async (req, res) => {
  const { currentUsername, userToFollow } = req.body;
  // console.log(currentUsername); ✅
  // console.log(userToFollow);✅
  const findUser = User.findOne({ username: currentUsername });
  const findUserToFollow = User.findOne({ username: userToFollow });
  if (!findUser) {
    console.log("User Not Found 404");
    return res.status(404).json("User Not Found");
  } else if (!findUserToFollow) {
    console.log("User Not Found 404");
    return res.status(404).json("User Not Found");
  } else {
    try {
      const updatedUserProfile = await User.findOneAndUpdate(
        { username: currentUsername },
        {
          $addToSet: { following: userToFollow },
        },
        { new: true }
      );
      console.log("New Following", updatedUserProfile);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json("Internal Server Error");
    }
    // Update The Follower List
    try {
      const updatedUserProfileForFollower = await User.findOneAndUpdate(
        { username: userToFollow },
        {
          $addToSet: { followers: currentUsername },
        },
        { new: true }
      );
      console.log("New Follower", updatedUserProfileForFollower);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json("Internal Server Error");
    }
    //return res.status(200).json(updatedUserProfile);
  }
});

// ! Unfollow a user
// ! Unfollow a user
app.post("/unfollow", async (req, res) => {
  const { currentUsername, userToUnfollow } = req.body;

  try {
    // Removes from following list (Current User's POV)
    const updatedUserProfile = await User.findOneAndUpdate(
      { username: currentUsername },
      {
        $pull: {
          following: userToUnfollow,
        },
      },
      {
        new: true,
      }
    );
    console.log("Removed Follower", updatedUserProfile);

    // Removes from followers list (Other User's POV)
    const updatedUserProfileForFollower = await User.findOneAndUpdate(
      { username: userToUnfollow },
      {
        $pull: {
          followers: currentUsername,
        },
      },
      {
        new: true,
      }
    );
    console.log("Removed Current User as Follower", updatedUserProfileForFollower);

    // Send a response back to the client with the updated following list
    res.status(200).json({
      success: true,
      updatedFollowingList: updatedUserProfile.following,
    });
  } catch (error) {
    console.error("Error Unfollowing user:", error);
    res.status(500).json({ success: false, message: "Error unfollowing user" });
  }
});


// ! Remove a Follower from your follower list
app.post("/removefollower", async (req, res) => {
  const { currentUsername, followerToRemove } = req.body;

  try {
    // Remove follower from `currentUsername`'s followers list
    await User.findOneAndUpdate(
      { username: currentUsername },
      { $pull: { followers: followerToRemove } },
      {
        new: true,
      }
    );
    console.log("Follower successfully removed from followers list");

    // Remove current user from `followerToRemove`'s following list
    await User.findOneAndUpdate(
      { username: followerToRemove },
      { $pull: { following: currentUsername } },
      {
        new: true,
      }
    );
    console.log(
      "User successfully removed from following list of followerToRemove"
    );

    res.status(200).json("Follower successfully removed");
  } catch (error) {
    console.error("Error removing follower:", error);
    res.status(500).json("Internal Server Error");
  }
});

// ! All the extra Code is below this // // // // /////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection:", reason);
  // Optionally, shut down the server or handle specific cleanup
});

// Catch uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception:", error);
  // Gracefully close server connections if needed
  process.exit(1); // Exit after handling the error
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
