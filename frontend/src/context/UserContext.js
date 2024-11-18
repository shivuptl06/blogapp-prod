import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";

const UserContext = createContext({});

function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Profile Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState();
  const [followers, setFollowers] = useState(["John", "Micheal"]); // Now an array
  const [following, setFollowing] = useState(["Cristine", "Angelina"]); // Now an array
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // Check if current page is the user's profile page
    setIsOwnProfile(location.pathname === `/profile`);
  }, [location, username]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "https://blogapp-prod-production.up.railway.app/profile",
          {
            withCredentials: true,
          }
        );
        if (response.data.username) {
          setUsername(response.data.username);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // setUsername(null);
          // setProfilePic(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Set loading to false after auth check is complete
      }
    };

    checkAuth();
  }, []);

  // Handle redirection after auth check
  useEffect(() => {
    if (loading) return; // Wait until loading is complete
    if (username === null) {
      setIsAuthenticated(false);
    } else if (
      (location.pathname === "/login" && username !== null) ||
      (location.pathname === "/signup" && username !== null)
    ) {
      navigate("/");
    }
  }, [loading, username, navigate, location.pathname]);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        "https://blogapp-prod-production.up.railway.app/posts"
      );
      // console.log("Fetched posts from backend:", response.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts initially
  }, [username]);

  // Optionally render a loading spinner or return null while loading
  if (loading) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        password,
        setPassword,
        isAuthenticated,
        setIsAuthenticated,
        posts,
        setPosts,
        fetchPosts,
        name,
        setName,
        email,
        setEmail,
        profilePic,
        setProfilePic,
        followers,
        setFollowers,
        following,
        setFollowing,
        isOwnProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserContextProvider };
