import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

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
        const response = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
        });
        setProfileData(response.data); // Store data in state
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const { username, name, email, cover, followers, following } = profileData;
  const [followingList, setFollowingList] = useState([]);
  useEffect(() => {
    const fetchFollowingList = async () => {
      if (Array.isArray(following)) {
        setFollowingList(following); // Directly set the array as it's already in the correct format
      }
    };

    if (following) {
      fetchFollowingList(); // Only fetch if 'following' exists
    }
  }, [following]);

  // Retrieving Blogs of the logged-in user
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/profile/blogs",
          {
            withCredentials: true,
          }
        );
        setBlogs(response.data); // Store data in state
        console.log("Blog Data Retrieved: ", response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const handleUnfollow = (userToUnfollow) => {
    setFollowingList((prevList) =>
      prevList.filter((user) => user !== userToUnfollow)
    );
    // Optionally, send an API request here to unfollow on the backend
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 w-full min-h-screen overflow-hidden">
      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
          <div className="overflow-x-auto overflow-y-scroll">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Username</th>
                  <th className="text-left py-2 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {followers.map((follower, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4">{follower}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleUnfollow(follower)}
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
        </div>

        {/* Blogs Section (Fixed Height with Scroll) */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-2/4 overflow-y-auto h-[500px]">
          <h3 className="font-bold text-lg mb-4">My Blogs</h3>
          <div className="space-y-4">
            {blogs.length === 0 ? (
              <p>No blogs available</p>
            ) : (
              blogs.map((blog, index) => (
                <div key={index} className="p-4 border-b space-y-4">
                  {/* Blog Header: Title, Author, and Date */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="font-semibold text-xl">{blog.title}</div>
                    <span className="text-gray-500 text-sm">
                      by {blog.author}
                    </span>
                    <span className="text-gray-400 text-sm">
                      · {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Blog Cover Image */}
                  {blog.cover && (
                    <img
                      src={`http://localhost:5000/${blog.cover}`}
                      alt="Blog Cover"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Blog Content and Summary */}
                  <div
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  ></div>
                  <p className="mt-2 text-gray-600">{blog.summary}</p>

                  {/* Blog Footer: Updated Date */}
                  <div className="text-gray-400 text-sm mt-4">
                    Last updated on{" "}
                    {new Date(blog.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Following Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-1/4 overflow-y-auto h-auto">
          <h3 className="font-bold text-lg mb-2">Following</h3>
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
        </div>
      </div>
    </div>
  );
}

export default Profile;
