import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";

function Post({ post, onEdit, onDelete, isOwnProfile }) {
  const { content, cover, createdAt, summary, title, author, _id } = post;
  const { username } = useContext(UserContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editSummary, setEditSummary] = useState(summary);
  const [editContent, setEditContent] = useState(content);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Date unavailable";

  const openEditModal = () => {
    if (username !== author) {
      setIsModalOpen(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedPost = {
      id: _id,
      title: editTitle,
      summary: editSummary,
      content: editContent,
    };

    try {
      await onEdit(_id, updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = () => {
    if (username !== author) {
      setIsModalOpen(true);
    } else {
      onDelete(_id, author);
    }
  };

  return (
    <div className="post bg-white p-6 rounded-lg shadow-lg border border-gray-300 mb-8 max-w-2xl w-full mx-auto sm:p-8 lg:p-10">
      {cover && !isEditing && (
        <div className="post-cover mb-4">
          <img
            src={`${cover}`}
            alt={title}
            className="w-full h-64 object-contain rounded-lg bg-gray-200 sm:h-72 md:h-80"
          />
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm md:text-base"
            placeholder="Post Title"
            required
          />
          <textarea
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm md:text-base"
            placeholder="Summary"
            required
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm md:text-base"
            placeholder="Content"
            required
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition duration-200 w-full sm:w-auto"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-200 w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="post-title text-2xl font-bold mb-2 text-gray-800 md:text-3xl">
            {title}
          </h2>

          <div className="post-info text-sm text-gray-500 mb-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="date-time flex items-center">
              <i className="material-icons text-blue-400 mr-1">&#128197;</i>
              {formattedDate}
            </span>
            {author && (
              <span className="author-info flex items-center">
                <i className="material-icons text-blue-400 mr-1">&#128100;</i>
                {author}
              </span>
            )}
          </div>

          <p className="post-summary text-gray-500 mb-4 italic">{summary}</p>
          <div className="post-content text-gray-600 leading-relaxed text-sm md:text-base">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {isOwnProfile && (
            <div className="post-actions mt-6 flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <button
                onClick={openEditModal}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 w-full sm:w-auto"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-200 w-full sm:w-auto"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-lg mx-auto">
            <h2 className="text-lg font-semibold text-center mb-4">
              You are not authorized to edit or delete posts that are not yours.
            </h2>
            <div className="flex justify-around">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
