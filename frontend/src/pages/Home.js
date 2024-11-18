import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Post from "../components/Post";

function Home() {
  const { username } = useContext(UserContext);
  const [fetchedPosts, setFetchedPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const navigate = useNavigate();

  // Redirect to login if username is not available
  useEffect(() => {
    if (!username) {
      navigate("/login");
    }
  }, [username, navigate]);

  // Fetch posts specific to the user
  useEffect(() => {
    async function fetchUserSpecificPosts() {
      if (!username) return;

      try {
        const response = await axios.post(
          "https://blogapp-prod-production.up.railway.app/getPosts",
          {
            username: username,
          }
        );
        setFetchedPosts(response.data); // Correctly access the data
      } catch (error) {
        console.error("Error fetching user-specific posts:", error);
      }
    }
    fetchUserSpecificPosts();
  }, [username]); // Only fetch when username changes

  // Sort the fetched posts by 'createdAt' (newest first)
  const sortedPosts = fetchedPosts
    .map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt), // Ensure createdAt is a Date object
    }))
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt, newest first

  // Handle edit post
  async function onEdit(postId, updatedPost) {
    try {
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/edit",
        {
          id: postId,
          ...updatedPost,
        }
      );
      console.log("Post updated successfully:", response.data);
      //fetchUserSpecificPosts(); // Refetch posts after updating
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }

  // Handle delete post
  async function handleDelete(_id, author) {
    if (username !== author) {
      setIsAuthorized(false);
      setModalMessage("You are not authorized to delete posts of other users");
      setIsModalOpen(true);
      return;
    }

    setPostToDelete(_id);
    setIsAuthorized(true);
    setModalMessage("Are you sure you want to delete this post?");
    setIsModalOpen(true);
  }

  // Confirm delete post
  async function confirmDelete() {
    setIsModalOpen(false);
    console.log("Attempting to delete post with ID:", postToDelete);

    try {
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/delete",
        {
          id: postToDelete,
        }
      );
      console.log("Post deleted successfully:", response.data);
      //fetchUserSpecificPosts(); // Refetch posts after deleting
      setPostToDelete(null); // Reset postToDelete state after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      setIsModalOpen(false);
    }
  }

  // Close modal
  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <div className="flex flex-col items-center m-2">
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <p>No posts available. Follow someone to see their posts. </p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-lg mx-auto">
            <h2 className="text-lg font-semibold text-center mb-4">
              {modalMessage}
            </h2>
            <div className="flex justify-around">
              {isAuthorized ? (
                <div className="flex items-center space-x-8">
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6"
                    onClick={confirmDelete}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="bg-gray-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6"
                  onClick={closeModal}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
