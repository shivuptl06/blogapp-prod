import React from "react";

function Post({ post, onEdit, onDelete }) {
  const { content, cover, createdAt, summary, title, author, _id } = post;

  // Check if createdAt is valid
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date unavailable"; // Show fallback if no date is available

  return (
    <div className="post w-5/6 md:w-2/3 xl:w-1/3 mt-10 bg-white p-4 rounded-lg border border-gray-300 shadow-md mb-6 flex flex-col items-center justify-center">
      {/* Cover Image */}
      {cover && (
        <div className="post-cover mb-4">
          <img
            src={`/${cover}`} // Ensure correct path to the image
            alt={title}
            className="w-full h-64 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Title */}
      <h2 className="post-title text-2xl font-bold mb-2 text-gray-800">
        {title}
      </h2>

      {/* Created At */}
      <p className="post-date text-sm text-gray-500 mb-2">{formattedDate}</p>

      {/* Author */}
      {author && (
        <p className="post-author text-sm text-gray-600 mb-2">
          <strong>Author:</strong> {author}
        </p>
      )}

      {/* Summary */}
      <p className="post-summary text-gray-700 mb-4">{summary}</p>

      {/* Content */}
      <div className="post-content text-gray-800">
        {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
      </div>

      {/* Action buttons */}
      <div className="post-actions mt-4 flex justify-end space-x-4">
        {/* Edit Button */}
        <button
          onClick={() => onEdit(_id)}
          className="edit-btn bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
        >
          Edit
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(_id, author)}
          className="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Post;
