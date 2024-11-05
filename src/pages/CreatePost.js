import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function CreatePost() {
  const [file, setFile] = useState(null); // State to store the selected file
  const [fileName, setFileName] = useState(""); // State to store the name of the selected file

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name); // Set the name of the selected file
    }
  };

  return (
    <div className="new-post text-center mt-10 space-y-8 px-4 sm:px-0">
      <h2 className="text-5xl mb-5 font-semibold">Create New Post</h2>
      <form className="flex flex-col items-center">
        <div className="w-full max-w-md space-y-5">
          <input
            type="text"
            placeholder="Title"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="text"
            placeholder="Summary"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <div className="relative w-full">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-lg p-3 w-full transition hover:bg-gray-100"
            />
          </div>
          <div className="w-full mb-5">
            <ReactQuill className="h-64 border-gray-300 rounded-lg" />
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
