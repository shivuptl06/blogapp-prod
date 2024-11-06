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
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

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
    res.status(401).json("Unauthorized");
    console.log("No Token Found");
  } else {
    jwt.verify(token, secretKey, {}, (error, info) => {
      if (error) {
        console.log(error);
        res.status(401).json("Unauthorized");
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
  const file = req.file; // Should be defined if multer processed the file correctly

  if (!file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  const { originalname, path } = req.file;
  const parts = originalname.split(".")[0];
  const fileExtension = parts[parts.length - 1];
  const newPath = parts + "." + fileExtension;
  fs.renameSync(path, newPath);

  //
  // Here you can save the file path to your database
  // and return the path to the client
  //
  if (userAuthor) {
    res.json("ok");
    const { title, summary, content, author } = req.body;
    const postDoc = await Post.create({
      title: title,
      summary: summary,
      content: content,
      cover: newPath,
      author: author,
    });
  } else {
    console.log("USERNAME NOT FOUND");
    //res.json("Username not founddd");
  }

  // res.json(req.file);
});

app.get("/post", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
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
