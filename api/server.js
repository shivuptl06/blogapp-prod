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

let userAuthor;

// For signup page
app.post("/register", uploadMiddleware.single("file"), async (req, res) => {
  console.log("File received:", req.file); // Check if req.file is populated

  const { name, email, username, password } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  // Define a new path specifically for profile images
  const profileImageDir = "uploads/profilePic";
  if (!fs.existsSync(profileImageDir)) {
    fs.mkdirSync(profileImageDir, { recursive: true });
  }

  try {
    const { originalname, path: tempPath } = req.file;
    const newPath = path.join(profileImageDir, originalname);
    fs.renameSync(tempPath, newPath); // Rename file into profilePic directory

    bcrypt.hash(password, saltRounds, async function (err, hash) {
      if (err) throw err;

      await User.create({
        name,
        email,
        username,
        password: hash,
        cover: newPath,
      });

      res.status(200).json({ message: "User Registration Successful" });
    });
  } catch (error) {
    // Error handling
  }
});

// For Login Page
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Fetch user by username only
  const user = await User.findOne({ username: username }); // This only fetches the user document based on the username

  try {
    if (!user) {
      console.error("User Not Found");
      console.log(user); // Logs `null` since no user was found
      res.status(404).json("User Not Found");
    } else {
      // Compare entered password with the stored hashed password in the user document
      const isMatch = await bcrypt.compare(password, user.password); // bcrypt compares the plain password with the hashed password in DB

      if (isMatch) {
        // JWT
        jwt.sign({ username, id: user.id }, secretKey, {}, (error, token) => {
          if (error) {
            console.log(error);
            userAuthor = null;
            res.status(500).json({ message: "Internal Server Error" });
          } else {
            userAuthor = username;
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

// For profile Page
app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(401).json("Unauthorized get/profile");
    console.log("No Token Found");
  } else {
    jwt.verify(token, secretKey, {}, (error, info) => {
      if (error) {
        console.log(error);
        res.status(401).json("Unauthorized get/profile");
      } else {
        //console.log("Token: ", token);
        res.json(info);
      }
    });
  }
});

// For logout Page
app.post("/logout", async (req, res) => {
  res.cookie("token", "");
  res.status(200).json({ message: "Logged out successfully" });
});

// For create-new-post Page
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

    // Define a new path specifically for post images
    const postImageDir = "uploads/postImages";
    if (!fs.existsSync(postImageDir)) {
      fs.mkdirSync(postImageDir, { recursive: true });
    }

    const { originalname, path: tempPath } = req.file;
    const newPath = path.join(postImageDir, originalname);
    fs.renameSync(tempPath, newPath); // Move file into postImages directory

    const { title, summary, content } = req.body;

    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.username,
      });

      res.status(200).json(postDoc);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ message: "Error creating post" });
    }
  });
});

app.get("/post", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

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

// All the extra Code is below this // // // // /////////////////////
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
