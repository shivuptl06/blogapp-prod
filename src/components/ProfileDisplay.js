import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";

function ProfileDisplay({ cover, name, username, email, followers, blogs }) {
  const [followingList, setFollowingList] = useState([]);
  const [blogList, setBlogList] = useState([]);
  console.log(blogs);
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

  const handleDeleteBlog = async (blogId) => {
    try {
      await axios.post(
        "http://localhost:5000/delete",
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
        "http://localhost:5000/edit",
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
console.log(cover);
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
        <div className="flex flex-col items-center">
          <p className="text-center text-xl font-semibold">{name}</p>
          <p className="text-gray-500">@{username}</p>
          <p className="text-gray-500">{email}</p>
        </div>
      </div>

      {/* Blogs Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-2/4 h-fit flex flex-col">
  <h3 className="font-bold text-lg text-center mb-4">My Blogs</h3>
  <div className="overflow-y-auto flex-grow flex items-center justify-center">
    {blogList.length === 0 ? (
      <p className="text-center mt-5 font-semibold">No blogs posted yet</p>
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
