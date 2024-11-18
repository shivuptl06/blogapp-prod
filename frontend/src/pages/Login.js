import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "animate.css";
import { UserContext } from "../context/UserContext";

function Auth() {
  const { setUsername, isAuthenticated, setIsAuthenticated } =
    useContext(UserContext);
  const [username, setLocalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);
  const [loginError, setLoginError] = useState(""); // New state for login error message
  const navigate = useNavigate();

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  async function login(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/login",
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setUsername(username); // Update UserContext with username
      setIsAuthenticated(true);
      toast.success("User Login Successful", { autoClose: 500 });
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError(
        "User Login Failed. Please check your username and password."
      ); // Set the error message
      toast.error("User Login Failed", { autoClose: 500 });
    }
  }

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center bg-gray-100">
      <ToastContainer />
      <div
        className={`bg-white ${
          isAnimated ? "animate__animated animate__bounceInUp" : ""
        } shadow-lg rounded-lg p-8 md:p-10 w-11/12 md:w-96 h-3/5 flex flex-col justify-between`}
      >
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <form className="flex flex-col space-y-4" onSubmit={login}>
          {loginError && (
            <div className="text-red-500 text-center mb-4">{loginError}</div>
          )}
          <div>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setLocalUsername(e.target.value.toLowerCase())}
              placeholder="Username"
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to={"/register"} className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
