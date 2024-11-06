import axios from "axios";
import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreatePost() {
  const [title, setTitle] = useState();
  const [summary, setSummary] = useState();
  const [content, setContent] = useState();
  const [file, setFile] = useState("");
  const navigate = useNavigate();

  async function createNewPost(e) {
    e.preventDefault();
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);
      // You can redirect to a new page or display a success message here
      if (response.data === "ok") {
        toast.success("Post Created Successfully", { autoClose: 400 });
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
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
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
              onChange={setContent}
              className="h-64 border-gray-300 rounded-lg"
            />
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
