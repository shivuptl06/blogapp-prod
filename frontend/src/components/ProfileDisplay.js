import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function ProfileDisplay({
  cover,
  name,
  user,
  email,
  following,
  followers,
  blogs,
  handleFollow,
  handleUnfollow,
}) {
  console.log(followers);
  const [followingList, setFollowingList] = useState(following);
  const [currentFollowers, setCurrentFollowers] = useState(followers);
  const [blogList, setBlogList] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { username } = useContext(UserContext);
  // console.log(username);
  //console.log(blogs);
  // Effect hook to convert blogs from object to array when `blogs` prop changes
  useEffect(() => {
    if (blogs) {
      const BlogArray = Object.entries(blogs); // Convert object to array
      //console.log("BLOGLIST OBJ IN PD 13:", blogs);
      setBlogList(BlogArray);
      //   console.log("BLOGLIST Array IN PD 15:", blogList);
      //console.log("Object Entries:" ,Object.entries(blogs));
    }
  }, [blogs]); // Dependency array ensures it runs when `blogs` changes

  useEffect(() => {
    checkIfFollowing(); // Run this every time `currentFollowers` changes
  }, [currentFollowers]);

  const handleDeleteBlog = async (blogId) => {
    try {
      await axios.post(
        "https://blogapp-prod-production.up.railway.app/delete",
        { id: blogId },
        { withCredentials: true }
      );
      setBlogList(blogList.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleEditBlog = (blogId, updatedPost) => {
    axios
      .post(
        "https://blogapp-prod-production.up.railway.app/edit",
        {
          id: blogId,
          title: updatedPost.title,
          summary: updatedPost.summary,
          content: updatedPost.content,
        },
        { withCredentials: true }
      )
      .then(() => {
        setBlogList(
          blogList.map((blog) =>
            blog._id === blogId ? { ...blog, ...updatedPost } : blog
          )
        );
      })
      .catch((error) => console.error("Error updating blog:", error));
  };

  function handleFollowLogic() {
    setIsFollowing(true);
    setFollowingList((prevFollowingList) => [...prevFollowingList, user]);
    handleFollow(); // Call the parent function
  }

  const checkIfFollowing = () => {
    //console.log("Checking if following...");
    //console.log("currentFollowers (admin's followers):", currentFollowers);
    //console.log("logged-in user (username):", username);
    //console.log("User:", user);

    // Check if the logged-in user (username, e.g., "shivam") is in the currentFollowers list (admin's followers)
    const isUserFollowing = currentFollowers.includes(username);

    console.log("Is User Following (shivam following admin):", isUserFollowing);
    setIsFollowing(isUserFollowing);
  };

  function handleUnfollowLogic() {
    //alert("Inside handleUnfollow. YET TO BE REDIRECTED");
    setFollowingList(
      followingList.filter((following) => {
        return following !== username;
      })
    );
    console.log(followingList);
    setIsFollowing(false);
    handleUnfollow(); // Call the parent function
  }

  //console.log(cover);
  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 w-full overflow-hidden">
      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt="Profile"
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-gray-500">No Image</p>
          )}
        </div>
        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <p className="text-center text-xl font-semibold">{name}</p>
            <p className="text-gray-500">@{user}</p>
            <p className="text-gray-500">{email}</p>
          </div>
          <div className="">
            {/* Display Follow Button if user isnt following  */}
            {!isFollowing ? (
              <button
                className="p-1 rounded-lg bg-blue-500 hover:bg-blue-600"
                onClick={handleFollowLogic}
              >
                Follow
              </button>
            ) : (
              <>
                <button
                  className="p-1 rounded-lg bg-red-500 hover:bg-red-600"
                  onClick={handleUnfollowLogic}
                >
                  Unfollow
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Blogs Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-2/4 h-fit flex flex-col">
        <p className="font-normal text-lg text-center mb-4">
          Blogs by{" "}
          <span className="font-semibold underline italic">{user}</span>
        </p>
        <div className="overflow-y-auto flex-grow flex items-center justify-center">
          {blogList.length === 0 ? (
            <p className="text-center mt-5 font-semibold">
              No blogs posted yet
            </p>
          ) : (
            <Post
              key={blogs} // Use blog[0] or another unique identifier for the key
              post={blogs} // Access the value of the blog object
              onDelete={handleDeleteBlog}
              onEdit={handleEditBlog}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDisplay;
