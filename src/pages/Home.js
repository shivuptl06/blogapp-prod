import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";

function Home() {
  const { username } = useContext(UserContext);

 

  // If the user is not logged in, redirect to the login page
  if (!username) {
    return <Navigate to={"/login"} />;
  } else {
    return (
      // Render the home content if the user is logged in
      <div>
        <h1>Welcome, {username}!</h1>
        {/* Other home content goes here */}
      </div>
    );
  }
}

export default Home;
