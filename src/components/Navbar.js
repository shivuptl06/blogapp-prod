import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContextProvider, UserContext } from "../context/UserContext";

function Navbar() {
  const { username, setUsername, setIsAuthenticated } = useContext(UserContext);
  const navigate = useNavigate();
  // const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        console.log(res);
        setUsername(res.data.username);
      } catch (error) {
        console.log(error.message, "\n", error);
      }
    };
    fetchProfile();
  });

  function logOut() {
    alert("Reached Logout Function");

    axios
      .post(
        "http://localhost:5000/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        setUsername(null);
        navigate("/login"); // Optionally navigate to login after logout
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  }

  return (
    <div className="flex justify-between items-center p-4 bg-gray-600">
      <Link
        to={"/"}
        className="text-xl  cursor-pointer sm:text-2xl lg:text-4xl hover:text-white"
      >
        My Blog
      </Link>
      <div className="items-center mr-4 text-sm sm:text-lg lg:text-xl">
        {username ? (
          <div className="flex flex-row space-x-5">
            <Link to={"/newpost"} className=" hover:text-white">
              <button className="text-xl">Create New Post</button>
            </Link>
            <button
              className="cursor-pointer hover:text-white"
              onClick={logOut}
            >
              Logout
            </button>
          </div>
        ) : (
          <button className="space-x-5">
            <Link to={"/login"}>Login</Link>
            <Link to={"/register"}>Register</Link>
          </button>
        )}
      </div>
    </div>
  );
}
export default Navbar;
