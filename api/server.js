const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");
const Post = require("./models/post");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const secretKey = "1234567890987654321";
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const port = 5000; // or any other safe port
const path = require("path");
const { timeStamp } = require("console");
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const uploadMiddleware = multer({ dest: "uploads/" });

mongoose.connect(
  "mongodb+srv://Shivam:Shivam@cluster0.fb778.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

// ! For signup page
// Example: For user registration (Profile Image)
app.post("/register", uploadMiddleware.single("file"), async (req, res) => {
  console.log("File received:", req.file);

  const { name, email, username, password } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  const profileImageDir = "uploads/profilePic";
  if (!fs.existsSync(profileImageDir)) {
    fs.mkdirSync(profileImageDir, { recursive: true });
  }

  try {
    const { originalname, path: tempPath } = req.file;
    const newPath = path.join(profileImageDir, originalname);
    fs.renameSync(tempPath, newPath);

    const fileUrl = `http://localhost:5000/${newPath}`; // This will give the full URL

    bcrypt.hash(password, saltRounds, async function (err, hash) {
      if (err) throw err;

      await User.create({
        name,
        email,
        username,
        password: hash,
        cover: fileUrl, // Store the full URL
      });

      res
        .status(200)
        .json({ message: "User Registration Successful", cover: fileUrl });
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Error saving file" });
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
            res.cookie("token", token).json("OK");
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
  if (!token) {
    res.status(401).json("Unauthorized get/profile");
    console.log("No Token Found");
  } else {
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
  }
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
  res.cookie("token", "");
  res.status(200).json({ message: "Logged out successfully" });
});

// ! For create-new-post Page
// Example: For blog post (Cover Image)
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json("Unauthorized No Token in post:post");
  }

  jwt.verify(token, secretKey, {}, async (error, info) => {
    if (error) {
      return res.status(401).json("Unauthorized error in post:post");
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const postImageDir = "uploads/postImages";
    if (!fs.existsSync(postImageDir)) {
      fs.mkdirSync(postImageDir, { recursive: true });
    }

    const { originalname, path: tempPath } = req.file;
    const newPath = path.join(postImageDir, originalname);
    fs.renameSync(tempPath, newPath);

    const fileUrl = `http://localhost:5000/${newPath}`; // Full URL

    const { title, summary, content } = req.body;

    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: fileUrl, // Store the full URL for the post cover
        author: info.username,
      });

      res.status(200).json(postDoc);
    } catch (err) {
      console.error("Error creating post:", err);
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
  //console.log(req);
  const deletePost = await Post.findById(req.body.id);
  if (!deletePost) {
    console.log("Post Not Found 404");
    return res.status(404).json("Post Not Found");
  } else {
    const id = deletePost._id;
    await Post.deleteOne({ _id: id });
    console.log("Post Deleted Successfully");
    return res.status(200).json("Post deletion successful");
  }
});

// ! Edit the post of user
app.post("/edit", async (req, res) => {
  const { id, title, summary, content } = req.body;

  try {
    const findPost = await Post.findById(id); // Ensure to use `findById`

    if (!findPost) {
      console.log("Post Not Found 404");
      return res.status(404).json("Post Not Found");
    }

    // Update the post
    findPost.title = title;
    findPost.summary = summary;
    findPost.content = content;

    await findPost.save(); // Save the updated document

    res.status(200).json(findPost); // Return the updated post document
  } catch (error) {
    console.error("Error updating post:", error);
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
    }).sort({ timestamp: -1 }).lean(); // Use await here to get the data

    console.log("Posts Found: ", retrievedPosts);

    // Send the retrieved posts as a response
    res.json(retrievedPosts);
    console.log("Sent Relevant Posts");

  } catch (error) {
    console.error("Error retrieving User-Specific posts:", error);
    res.status(500).json("Internal Server Error");
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
app.post("/unfollow", async (req, res) => {
  const { currentUsername, userToUnfollow } = req.body;

  // Removes from following list Current User POV
  try {
    await User.findOneAndUpdate(
      { username: currentUsername },
      {
        $pull: {
          following: userToUnfollow,
        },
      }
    );
  } catch (error) {
    console.error("Error Unfollowing user:", error);
  }

  // Removes from Current User as follower from other person POV
  try {
    await User.findOneAndUpdate(
      { username: userToUnfollow },
      {
        $pull: {
          followers: currentUsername,
        },
      }
    );
  } catch (error) {
    console.error("Error Unfollowing user:", error);
  }
});

// ! Remove a Follower from your follower list
// ! Remove a Follower from your follower list
app.post("/removefollower", async (req, res) => {
  const { currentUsername, followerToRemove } = req.body;

  try {
    // Remove follower from `currentUsername`'s followers list
    await User.findOneAndUpdate(
      { username: currentUsername },
      { $pull: { followers: followerToRemove } }
    );
    console.log("Follower successfully removed from followers list");

    // Remove current user from `followerToRemove`'s following list
    await User.findOneAndUpdate(
      { username: followerToRemove },
      { $pull: { following: currentUsername } }
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
