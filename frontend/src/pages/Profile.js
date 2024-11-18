import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post"; // Import Post component for editing/deleting blogs
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

function Profile() {
  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    email: "",
    cover: "",
    followers: [],
    following: [],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          "https://blogapp-prod-production.up.railway.app/profile",
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const { username, name, email, cover, followers, following } = profileData;
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  useEffect(() => {
    if (Array.isArray(following)) {
      setFollowingList(following);
    }
  }, [following]);

  useEffect(() => {
    if (Array.isArray(followers)) {
      setFollowersList(followers);
    }
  }, [followers]);

  // Retrieving Blogs of the logged-in user
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          "https://blogapp-prod-production.up.railway.app/profile/blogs",
          {
            withCredentials: true,
          }
        );

        // Ensure createdAt is properly parsed and sort blogs by newest first
        const sortedBlogs = response.data
          .map((blog) => ({
            ...blog,
            createdAt: new Date(blog.createdAt), // Convert createdAt to Date object
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt, newest first

        setBlogs(sortedBlogs);
        console.log("Blog Data Retrieved: ", sortedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const handleUnfollow = async (userToUnfollow) => {
    try {
      // Send the unfollow request
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/unfollow",
        {
          currentUsername: username,
          userToUnfollow: userToUnfollow,
        }
      );

      // Check if the response was successful
      if (response.data.success) {
        // Update the following list with the new data returned from the backend
        setFollowingList(response.data.updatedFollowingList);
      } else {
        console.error("Error unfollowing user:", response.data.message);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const removeFollower = async (followerToRemove) => {
    await axios.post(
      "https://blogapp-prod-production.up.railway.app/removefollower",
      {
        currentUsername: username,
        followerToRemove: followerToRemove,
      }
    );

    setFollowersList((prevList) =>
      prevList.filter((user) => user !== followerToRemove)
    );
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      // Send DELETE request to the /delete endpoint
      await axios.post(
        "https://blogapp-prod-production.up.railway.app/delete",
        { id: blogId },
        {
          withCredentials: true,
        }
      );
      // Remove the blog from the state
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleEditBlog = (blogId, updatedPost) => {
    // Send POST request to the /edit endpoint to update the blog
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
      .then((response) => {
        // Update the blog list in the state after editing
        setBlogs(
          blogs.map((blog) =>
            blog._id === blogId ? { ...blog, ...updatedPost } : blog
          )
        );
      })
      .catch((error) => console.error("Error updating blog:", error));
  };

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
            <FontAwesomeIcon
              icon={faUser}
              className="w-12 h-12 text-gray-500"
            />
          )}
        </div>
        <div className="flex flex-col items-center">
          <p className="text-center text-xl font-semibold">{name}</p>
          <p className="text-gray-500">@{username}</p>
          <p className="text-gray-500">{email}</p>
        </div>
      </div>

      {/* Main Content Layout: Followers, Blogs, Following */}
      <div className="flex flex-col lg:flex-row w-full justify-between space-y-6 lg:space-x-4 lg:space-y-0">
        {/* Followers Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-1/4 overflow-y-auto h-auto">
          <h3 className="font-bold text-lg mb-2">Followers</h3>
          {followersList.length === 0 ? (
            <p>No followers yet</p>
          ) : (
            <div className="overflow-x-auto overflow-y-scroll">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4">Username</th>
                    <th className="text-left py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followersList.map((follower, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4">{follower}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => removeFollower(follower)}
                          className="bg-red-500 text-white py-1 px-3 rounded-full text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Blogs Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-2/4 overflow-y-auto h-[500px]">
          <h3 className="font-bold text-lg text-center">My Blogs</h3>
          <div className="flex flex-col items-center">
            {blogs.length === 0 ? (
              <p>No blogs posted yet</p>
            ) : (
              blogs.map((blog) => (
                <Post
                  key={blog._id}
                  post={blog}
                  onDelete={handleDeleteBlog}
                  onEdit={handleEditBlog} // Passing edit handler
                  isOwnProfile={true}
                />
              ))
            )}
          </div>
        </div>

        {/* Following Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-1/4 overflow-y-auto h-auto">
          <h3 className="font-bold text-lg mb-2">Following</h3>
          {followingList.length === 0 ? (
            <p>No following yet</p>
          ) : (
            <div className="overflow-x-auto overflow-y-scroll">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4">Username</th>
                    <th className="text-left py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followingList.map((followedUser, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4">{followedUser}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleUnfollow(followedUser)}
                          className="bg-red-500 text-white py-1 px-3 rounded-full text-sm"
                        >
                          Unfollow
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
