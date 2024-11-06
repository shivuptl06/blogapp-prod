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
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      await User.create({ email, username, password: hash });
      res.status(200).json({ message: "User Registration Successful" });
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]; // Get the field causing the error
      res.status(400).json({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
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

  // Verify and decode the JWT token to extract user information
  jwt.verify(token, secretKey, {}, async (error, info) => {
    if (error) {
      console.log(error);
      return res.status(401).json("Unauthorized error in post:post");
    }

    const file = req.file; // Check if multer processed the file correctly
    if (!file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    // Process the uploaded file
    const { originalname, path: tempPath } = req.file;
    const parts = originalname.split(".");
    const startName = parts.slice(0, -1).join("."); // Filename without extension
    const fileExtension = parts[parts.length - 1]; // Get the file extension
    const newPath = path.join("uploads", `${startName}.${fileExtension}`);
    fs.renameSync(tempPath, newPath); // Rename file with correct extension

    // Get post data from request body
    const { title, summary, content } = req.body;

    try {
      // Create a new post with the decoded username as the author
      const postDoc = await Post.create({
        title: title,
        summary: summary,
        content: content,
        cover: newPath,
        author: info.username, // Set the author as the username from token
      });

      res.status(200).json(postDoc); // Send back the created post document as response
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
    const id = deletePost._id
    await Post.deleteOne({_id:id});
    console.log("Post Deleted Successfully");
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
