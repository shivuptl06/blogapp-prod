import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { FaPlus } from 'react-icons/fa'; // Import an icon (you can change it to any icon you prefer)

function Navbar() {
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility
  const dropdownRef = useRef(null); // Reference to the dropdown menu

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        setUsername(res.data.username);
      } catch (error) {
        console.log(error.message, "\n", error);
      }
    };
    fetchProfile();
  }, [setUsername]); // Add setUsername as a dependency

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the dropdown is open and if the click is outside of the dropdown
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close the dropdown
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]); // Dependency array

  function logOut() {
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
        className="text-xl cursor-pointer sm:text-2xl lg:text-4xl hover:text-white"
      >
        My Blog
      </Link>
      <div className="relative mr-4 text-sm sm:text-lg lg:text-xl">
        {username ? (
          <div className="flex items-center">
            {/* Plus icon visible only on small and medium screens */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown visibility
              className="flex items-center hover:text-white sm:hidden"
            >
              <FaPlus className="text-2xl" /> {/* Plus icon */}
            </button>
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg">
                <Link to="/create" className="block px-4 py-2 hover:bg-gray-200">
                  Create New Post
                </Link>
                <button
                  onClick={logOut}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
            {/* Show buttons only on larger screens */}
            <div className="hidden sm:flex space-x-5">
              <Link to="/create" className="hover:text-white">
                Create New Post
              </Link>
              <button
                onClick={logOut}
                className="cursor-pointer hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-5">
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
            <Link to="/register" className="hover:text-white">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
