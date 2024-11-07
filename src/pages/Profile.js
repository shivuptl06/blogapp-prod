import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

function Profile() {
  const { username, name, email, profilePic, followers, following } = useContext(UserContext);
  
  const [followingList, setFollowingList] = useState(following); // Assuming 'following' is an array of users

  const handleUnfollow = (userToUnfollow) => {
    // Logic to unfollow a user
    setFollowingList((prevList) =>
      prevList.filter((user) => user !== userToUnfollow)
    );
    // Optionally, send an API request here to unfollow on the backend
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100">
      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4">
        {/* Profile Picture or Default FontAwesome Icon */}
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FontAwesomeIcon
              icon={faUser}
              className="w-12 h-12 text-gray-500"
            />
          )}
        </div>
        <div className="flex flex-col items-center">
          {/* Display username */}
          <p className="text-center text-xl font-semibold">{name}</p>
          <p className="text-gray-500">@{username}</p>
          {/* Display email below username */}
          <p className="text-gray-500">{email}</p>
        </div>
      </div>

      {/* Followers and Following Section */}
      <div className="w-full flex flex-col space-y-6">
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">Followers</h3>
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
                      Unfollow
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">Following</h3>
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
  );
}

export default Profile;
