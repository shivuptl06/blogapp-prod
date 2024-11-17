import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { FaPlus, FaUserCircle } from "react-icons/fa";

function Navbar() {
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isFirstLoad = useRef(true);
  const [profilePath, setProfilePath] = useState("");
  const [data, setData] = useState();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("https://blogapp-backend-vfng.onrender.com/profile", {
          withCredentials: true,
        });
        setData(res.data);
        //console.log("Response Data: ", res.data);
        setProfilePath(res.data.cover); // Set profile image path

        if (res.data.username) {
          setUsername(res.data.username);
          if (isFirstLoad.current) {
            toast.success(`Welcome back, ${res.data.username}`, {
              autoClose: 500,
            });
            isFirstLoad.current = false;
          }
        } else {
          console.log("Username not found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [setUsername, navigate]);

  function logOut() {
    axios
      .post(
        "https://blogapp-backend-vfng.onrender.com/logout",
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      )
      .then(() => {
        setUsername(null);
        navigate("/login");
        setSearchQuery(null);
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  }

  const handleSearch = (event) => {
    event.preventDefault();
    if (username === searchQuery) {
      navigate("/profile");
    } else {
      navigate(`/search/users?query=${searchQuery}`);
    }
  };

  function handleHomeClick() {
    if (username) {
      navigate("/");
      setSearchQuery("");
    }
  }

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <>
      <div className="sticky top-0 z-50 flex justify-between items-center p-4 bg-gray-600 bg-opacity-90">
        <div
          className="text-xl cursor-pointer sm:text-2xl lg:text-4xl hover:text-white"
          onClick={handleHomeClick}
          style={{ fontFamily: "Sega" }}
        >
          My Blog
        </div>

        {/* Conditionally render the search bar based on username */}
        {username && (
          <div className="hidden sm:flex flex-1 justify-center ">
            <form
              onSubmit={handleSearch}
              className="flex items-center w-full max-w-md mx-auto"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                placeholder="Search users..."
                className="p-2 w-full bg-gray-100 focus:outline-none rounded-l-xl"
              />
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-r-xl"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Profile and Post Icons */}
        <div className="flex items-center space-x-4 text-sm sm:text-lg lg:text-xl">
          {username ? (
            <div className="flex items-center space-x-6 mr-4 md:space-x-10 md:mr-8">
              <Link to="/create" className="text-white hover:text-gray-300">
                <FaPlus className="text-2xl md:text-3xl" />
              </Link>

              {/* Profile Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-white hover:text-gray-300"
                >
                  {/* Conditionally render profile image or icon */}
                  {profilePath ? (
                    <img
                      src={profilePath}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-contain"
                    />
                  ) : (
                    <FaUserCircle className="text-2xl" />
                  )}
                </button>
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg"
                  >
                    <div className="p-4 border-b">
                      <p className="font-semibold text-blue-500">
                        Welcome, {username}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-200 rounded"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logOut();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
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

      {/* Search Bar for small screens (below navbar) */}
      <div className="flex sm:hidden p-4 bg-gray-600">
        {username && (
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                placeholder="Search users..."
                className="p-2 w-full bg-gray-100 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default Navbar;
