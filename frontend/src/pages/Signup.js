import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "animate.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"; // Import default icon

function SignUp() {
  const [isAnimated, setIsAnimated] = useState(false);
  const navigate = useNavigate();

  const {
    username,
    setUsername,
    password,
    setPassword,
    email,
    setEmail,
    profilePic,
    setProfilePic,
    name,
    setName,
    setIsAuthenticated,
  } = useContext(UserContext);

  useEffect(() => {
    setProfilePic(null);
  }, [setProfilePic]);

  const [tempUsername, setTempUsername] = useState(""); // Local state for username input
  const [isSignedIn, setIsSignedIn] = useState(null);

  useEffect(() => {
    setIsAnimated(true); // Trigger animation after the component mounts
  }, []);

  function signInSuccessful() {
    setIsAuthenticated(true);
    toast.success("User Registration Successful", { autoClose: 500 });
    return "User Registration Successful";
  }

  function signInFailed() {
    if (isSignedIn === false) {
      setIsAuthenticated(false);
      toast.error("User Registration Failed", { autoClose: 500 });
      return "User Registration Failed";
    }
  }

  async function registerUser(e) {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !tempUsername || !password) {
      toast.error("All fields are required!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format!");
      return;
    }

    // Validate username (e.g., alphanumeric and non-empty)
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // At least 3 characters, alphanumeric, underscores allowed
    if (!usernameRegex.test(tempUsername)) {
      toast.error(
        "Username must be at least 3 characters long and contain only letters, numbers, or underscores."
      );
      return;
    }

    // Validate password (e.g., minimum 6 characters)
    // if (password.length < 6) {
    //   toast.error("Password must be at least 6 characters long.");
    //   return;
    // }

    // Create FormData to handle file upload
    const formData = new FormData();

    // Add the user information
    formData.append("name", name);
    formData.append("email", email);
    formData.append("username", tempUsername.toLowerCase());
    formData.append("password", password);
    formData.append("followers", []);
    formData.append("following", []);

    // Add profile picture if provided
    if (profilePic) {
      formData.append("file", profilePic); // Append the profile picture to the FormData
      console.log("Profile picture added:", profilePic.name);
    } else {
      toast.error("Profile image is required.");
      return; // Prevent form submission if no image is provided
    }

    // Debugging: Log all formData entries (remove in production)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Send data to the server
    try {
      const response = await axios.post("/register", formData);
      toast.success("Registration successful!");

      // Success handling
      console.log(response.data.message);
      toast.success(response.data.message);
      setIsSignedIn(true);
      setUsername(tempUsername);
      navigate("/"); // Navigate after successful signup
    } catch (error) {
      // Error handling
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.error); // Displays: "The following already exists: email"
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  }

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center bg-gray-100 px-4 sm:px-8">
      <div
        className={`bg-white ${
          isAnimated ? "animate__animated animate__bounceInUp" : ""
        } shadow-lg rounded-lg p-10 w-full max-w-md flex flex-col justify-between`}
      >
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

        <form className="flex flex-col space-y-4" onSubmit={registerUser}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Profile Picture Upload */}
          <div>
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={(e) => {
                setProfilePic(e.target.files[0]);
              }}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 text-sm text-gray-500">
              Upload a profile picture (optional)
            </div>
            {profilePic && (
              <img
                src={profilePic}
                alt="Profile Preview"
                className="mt-2 w-24 h-24 rounded-full object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        {isSignedIn ? (
          <div className="text-center text-green-500">{signInSuccessful()}</div>
        ) : (
          <div className="text-center text-red-500">{signInFailed()}</div>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
