import React, { useState, useEffect } from "react"; // Import hooks
import { Link } from "react-router-dom";
import "animate.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function SignUp() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(null);
  const navigate = useNavigate();
  const {isAuthenticated, setIsAuthenticated} = {UserContext}

  useEffect(() => {
    // Trigger animation after the component mounts
    setIsAnimated(true);
  }, []);

  function signInSuccessful() {
    setIsAuthenticated(true);
    toast.success("User Registeration Successful", { autoClose: 500 });
    // navigate("/");
    return "User Registeration Succesful";
  }
  function signInFailed() {
    if (isSignedIn === false) {
      setIsAuthenticated(false);
      toast.error("User Registeration Failed", { autoClose: 500 });
      return "User Registeration Failed";
    }
  }

  async function registerUser(e) {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/register", {
        email,
        username,
        password,
      });
      console.log(response.data.message); // "User Registration Successful" or "Email already exists" / "Username already exists"
      setIsSignedIn(true);
      navigate("/");
    } catch (error) {
      setIsSignedIn(false);
      console.error("Error:", error.message); // Logs specific error message
      alert(error.message); // Display specific message to the user
    }
  }

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center bg-gray-100">
      <div
        className={`bg-white ${
          isAnimated ? "animate__animated animate__bounceInUp" : ""
        } shadow-lg rounded-lg p-10 w-96 h-3/5 flex flex-col justify-between`}
      >
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

        <form className="flex flex-col space-y-4" onSubmit={registerUser}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
