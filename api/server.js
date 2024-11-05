const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const secretKey = "1234567890987654321";
const cookieParser = require("cookie-parser");
const port = 5000; // or any other safe port
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests
  })
);
//app.use(cors());

// Middleware
app.use(express.json());
app.use(cookieParser());
// app.use();

mongoose.connect(
  "mongodb+srv://Shivam:Shivam@cluster0.fb778.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

// Connection String
// mongodb+srv://Shivam:Shivam@cluster0.fb778.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

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
        //res.status(200).json("User Login Successful");

        // JWT
        jwt.sign({ username, id: user.id }, secretKey, {}, (error, token) => {
          if (error) {
            console.log(error);
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

app.get("/profile", async (req, res) => {
  //console.log(req.cookies); // Check what cookies are available
  const { token } = req.cookies;
  if (!token) {
    res.status(401).json("Unauthorized");
  } else {
    jwt.verify(token, secretKey, {}, (error, info) => {
      if (error) {
        console.log(error);
        res.status(401).json("Unauthorized");
      } else {
        res.json(info);
      }
    });
  }
  // if (req.cookies.token) {
  //   res.json({ message: "Cookie exists", cookie: req.cookies.token });
  // } else {
  //   res.json({ message: "No cookie found" });
  // }
});

app.post("/logout", async (req, res) => {
  res.cookie("token", "");
  res.status(200).json({ message: "Logged out successfully" });
});

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
