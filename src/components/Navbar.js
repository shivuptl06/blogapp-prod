import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { FaPlus } from "react-icons/fa";

function Navbar() {
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isFirstLoad = useRef(true); // Track first load

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        
        if (res.data.username != null) {
          setUsername(res.data.username);

          // Only show toast on first load
          if (isFirstLoad.current) {
            toast.success(`Navbar Username: ${res.data.username}`, { autoClose: 500 });
            isFirstLoad.current = false; // Set to false after first toast
          }
        } else {
          console.log("Navbar Username not found");
        }
      } catch (error) {
        console.log(error.message, "\n", error);
      }
    };

    fetchProfile();
  }, [setUsername]); // Add setUsername as a dependency

  function logOut() {
    axios
      .post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      )
      .then(() => {
        setUsername(null);
        navigate("/login"); // Optionally navigate to login after logout
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  }

  const handleMenuItemClick = () => {
    setIsDropdownOpen(false); // Close the dropdown
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-600">
      <Link to="/" className="text-xl cursor-pointer sm:text-2xl lg:text-4xl hover:text-white">
        My Blog
      </Link>
      <div className="relative mr-4 text-sm sm:text-lg lg:text-xl">
        {username ? (
          <div className="flex items-center">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center hover:text-white sm:hidden"
            >
              <FaPlus className="text-2xl" />
            </button>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg">
                <Link to="/create" className="block px-4 py-2 hover:bg-gray-200" onClick={handleMenuItemClick}>
                  Create New Post
                </Link>
                <button
                  onClick={() => {
                    logOut();
                    handleMenuItemClick();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
            <div className="hidden sm:flex space-x-5">
              <Link to="/create" className="hover:text-white">
                Create New Post
              </Link>
              <button onClick={logOut} className="cursor-pointer hover:text-white">
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
