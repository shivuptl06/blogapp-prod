import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserContext = createContext({});

function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state
  const [posts, setPosts] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        if (response.data.username) {
          setUsername(response.data.username);
          setIsAuthenticated(true); // User is logged in
        } else {
          setIsAuthenticated(false); // User is not logged in
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

  useEffect(() => {
    if (!loading && username === null && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, username, isAuthenticated, navigate]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/post");
      console.log("Fetched posts from backend:", response.data); // Debugging line
      setPosts(response.data); // Update posts state with the fetched data
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts initially
  }, []);

  if (loading) {
    return null; // Optionally render a loading spinner or return null while loading
  }

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        isAuthenticated,
        setIsAuthenticated,
        posts,
        setPosts,
        fetchPosts,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserContextProvider };
