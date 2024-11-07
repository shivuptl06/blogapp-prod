import axios from "axios";
import React, { useState, useRef, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
// import defaultImage from "../../api/default/defaultImage.jpg";

function CreatePost() {
  const [title, setTitle] = useState();
  const [summary, setSummary] = useState();
  const [content, setContent] = useState();
  const [file, setFile] = useState("");
  const [author, setAuthor] = useState();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const { username, setUsername, fetchPosts } = useContext(UserContext);

  function handleContentChange(value) {
    setContent(value);
    if (value === "" || value === "<p><br></p>") {
      setError("Content is required.");
    } else {
      setError("");
    }
  }

  async function createNewPost(e) {
    e.preventDefault();

    // FIrst CHeck if content is empty
    // Check if content is empty
    if (content === "" || content === "<p><br></p>") {
      setError("Content is required.");
      return;
    }

    // Process the form if content is not empty
    console.log("Form submitted with content:", content);
    // Proceed with form submission (e.g., send to backend)

    const data = new FormData();

    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (file) {
      data.append("file", file); // Appending file to FormData
    } else {
      console.error("No file selected.");
    }

    // Here you can call your API to create a new post
    try {
      const response = await axios.post("http://localhost:5000/post", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);
      // You can redirect to a new page or display a success message here
      if (response.status === 200) {
        toast.success("Post Created Successfully", { autoClose: 400 });
        fetchPosts();
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  return (
    <div className="new-post text-center mt-10 space-y-8 px-4 sm:px-0">
      <h2 className="text-5xl mb-5 font-semibold">Create New Post</h2>
      <form className="flex flex-col items-center" onSubmit={createNewPost}>
        <div className="w-full max-w-md space-y-5">
          <input
            required
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            required
            type="text"
            placeholder="Summary"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
            }}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <div className="relative w-full">
            <input
              required
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              className="border border-gray-300 rounded-lg p-3 w-full transition hover:bg-gray-100"
            />
          </div>
          <div className="w-full mb-5">
            <ReactQuill
              value={content}
              onChange={handleContentChange}
              className="h-64 border-gray-300 rounded-lg"
            />
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
        <button
          type="submit"
          className="mt-20 bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition duration-200 w-full max-w-md"
        >
          Submit Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
