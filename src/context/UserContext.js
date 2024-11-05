import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // Make sure you have axios imported

const UserContext = createContext({});

function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated on initial load
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        if (response.data.username) {
          setUsername(response.data.username);
          setIsAuthenticated(true); // User is logged in
        //   navigate("/")

        } else {
          setIsAuthenticated(false); // User is not logged in
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false); // Assume not authenticated if there's an error
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
        //alert("Login To Continue")
      //toast.error("Please log in to access this website", { autoClose: 400 });
      //navigate("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, navigate]);

  return (
    <UserContext.Provider
      value={{ username, setUsername, isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserContextProvider };
