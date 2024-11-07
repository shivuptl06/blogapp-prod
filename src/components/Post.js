import React, { useContext, useState } from "react";
import axios from "axios";
import onEdit from "./OnEdit";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";

function Post({ post, onEdit, onDelete }) {
  const { content, cover, createdAt, summary, title, author, _id } = post;
  const { username } = useContext(UserContext);

  // State to track edit mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editSummary, setEditSummary] = useState(summary);
  const [editContent, setEditContent] = useState(content);

  // Format created date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date unavailable";

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Handle form submission for edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Prepare the updated post data
    const updatedPost = {
      id: _id,
      title: editTitle,
      summary: editSummary,
      content: editContent,
    };

    try {
      // Send updated post data to the backend
      if (username !== author) {
        setIsEditing(false);
        return alert("Forbidden From Editing Posts That Are Not Yours");
      } else {
        await onEdit(_id, updatedPost);
        setIsEditing(false);

        // Exit edit mode after successful update
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="post bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-6 max-w-2xl w-full mt-10">
      {cover && !isEditing && (
        <div className="post-cover mb-4">
          <img
            src={`/${cover}`}
            alt={title}
            className="w-full h-64 object-contain rounded-lg bg-blue-400"
          />
        </div>
      )}

      {isEditing ? (
        // Edit Form
        <form onSubmit={handleEditSubmit} className="space-y-4 p-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Post Title"
            required
          />
          <textarea
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Summary"
            required
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Content"
            required
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={toggleEditMode}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Display Mode
        <>
          <h2 className="post-title text-2xl font-bold mb-2 text-gray-800">
            {title}
          </h2>
          <p className="post-date text-sm text-gray-500 mb-2">
            {formattedDate}
          </p>
          {author && (
            <p className="post-author text-sm text-gray-600 mb-2">
              <strong>Author:</strong> {author}
            </p>
          )}
          <p className="post-summary text-gray-700 mb-4">{summary}</p>
          <div className="post-content text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          <div className="post-actions mt-4 flex space-x-4">
            <button
              onClick={toggleEditMode}
              className="edit-btn bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(_id, author)}
              className="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Post;
