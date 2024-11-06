import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Post from "../components/Post";

function Home() {
  const navigate = useNavigate();
  const { username, posts } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true); // Track if the user is authorized

  // Handle edit button click
  async function handleEdit(id) {
    console.log("Edit button clicked for post ID:", id);
    navigate(`/edit/${id}`);
  }

  // Handle delete button click
  async function handleDelete(_id, author) {
    console.log("Delete button clicked for post ID:", _id);

    if (username !== author) {
      setIsAuthorized(false); // Set unauthorized flag
      setModalMessage("You are not authorized to delete posts of other users");
      setIsModalOpen(true); // Show the unauthorized modal
      return; // Don't proceed further if the user is not the author
    }

    // Proceed with confirmation modal if the user is the author
    setPostToDelete(_id);
    setIsAuthorized(true); // Set authorized flag
    setModalMessage("Are you sure you want to delete this post?");
    setIsModalOpen(true); // Show the confirmation modal
  }

  // Confirm delete action
  async function confirmDelete() {
    console.log("Attempting to delete post with ID:", postToDelete);

    try {
      const response = await axios.post("http://localhost:5000/delete", {
        id: postToDelete,
      });
      console.log("Delete successful:", response.data);
      
      setIsModalOpen(false); // Close the modal after successful deletion
      setPostToDelete(null); // Clear the post to delete
    } catch (error) {
      console.log("Error deleting post:", error);
      setIsModalOpen(false); // Close the modal if there is an error
    }
  }

  // Close modal without any action
  function closeModal() {
    setIsModalOpen(false); // Simply close the modal
  }

  if (!username) {
    // return <Navigate to={"/login"} />;
  } else {
    return (
      <>
        {posts &&
          posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-lg mx-auto">
              <h2 className="text-lg font-semibold text-center mb-4">
                {modalMessage}
              </h2>
              <div className="flex justify-around">
                {isAuthorized ? (
                  <>
                    <button
                      className="bg-blue-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6 mb-2 sm:mb-0"
                      onClick={confirmDelete} // Confirm delete
                    >
                      Confirm
                    </button>
                    <button
                      className="bg-gray-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6"
                      onClick={closeModal} // Close the modal without action
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-gray-500 text-white px-6 py-2 rounded w-full sm:w-auto sm:px-6"
                    onClick={closeModal} // Close the modal for unauthorized user
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Home;
