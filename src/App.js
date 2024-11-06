import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Routes,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Post from "./components/Post";
import Home from "./pages/Home";
// eslint-disable-next-line
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllData from "./pages/AllData";
import { UserContext, UserContextProvider } from "./context/UserContext";
import CreatePost from "./pages/CreatePost";

function App() {
  return (
    <Router>
      <UserContextProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<Post />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/all-data" element={<AllData />} />
          <Route path="/create" element={<CreatePost />} />
        </Routes>
        <Footer />
      </UserContextProvider>
    </Router>
  );
}

export default App;
