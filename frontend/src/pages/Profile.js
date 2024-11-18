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

  const [blogs, setBlogs] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          "https://blogapp-prod-production.up.railway.app/profile",
          { withCredentials: true }
        );
        setProfileData(response.data);
        setFollowingList(response.data.following);
        setFollowersList(response.data.followers);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  // Fetch Blogs Data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          "https://blogapp-prod-production.up.railway.app/profile/blogs",
          { withCredentials: true }
        );
        const sortedBlogs = response.data
          .map((blog) => ({
            ...blog,
            createdAt: new Date(blog.createdAt), // Ensure correct Date object
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  // Unfollow handler
  const handleUnfollow = async (userToUnfollow) => {
    try {
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/unfollow",
        {
          currentUsername: profileData.username,
          userToUnfollow: userToUnfollow,
        }
      );
      if (response.data.success) {
        setFollowingList(response.data.updatedFollowingList);
      } else {
        console.error("Error unfollowing user:", response.data.message);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  // Remove follower handler
  const removeFollower = async (followerToRemove) => {
    try {
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/removefollower",
        {
          currentUsername: profileData.username,
          followerToRemove: followerToRemove,
        }
      );
      setFollowersList((prevList) =>
        prevList.filter((user) => user !== followerToRemove)
      );
    } catch (error) {
      console.error("Error removing follower:", error);
    }
  };

  // Delete blog handler
  const handleDeleteBlog = async (blogId) => {
    try {
      await axios.post(
        "https://blogapp-prod-production.up.railway.app/delete",
        { id: blogId },
        { withCredentials: true }
      );
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  // Edit blog handler
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
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
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
          {profileData.cover ? (
            <img
              src={profileData.cover}
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
          <p className="text-center text-xl font-semibold">{profileData.name}</p>
          <p className="text-gray-500">@{profileData.username}</p>
          <p className="text-gray-500">{profileData.email}</p>
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
