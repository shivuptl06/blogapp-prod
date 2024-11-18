import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileDisplay from "../components/ProfileDisplay";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search).get("query");

  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState([]); // Ensure blogs is initialized as an empty array
  const [loading, setLoading] = useState(true);
  let data;
  const { username } = useContext(UserContext);

  useEffect(() => {
    //console.log("Blogs updated:", blogs);
  }, [blogs]);

  useEffect(() => {
    if (searchParams) {
      getSearchedUserDetails();
    }
  }, [searchParams]);

  //  // Sync blogList with blogs prop
  //  useEffect(() => {
  //   setBlogs(blogs);
  //     console.log("Blogs updated:", blogs);

  //   console.log(blogs)
  // }, [blogs]);

  async function getSearchedUserDetails() {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://blogapp-prod-production.up.railway.app/search/users",
        {
          query: searchParams.toLocaleLowerCase(),
        }
      );
      //console.log("Response data:", response.data[1]);
      data = response.data[1];
      //console.log("Data: ",data);

      setBlogs(data);
      //console.log("Response Data at 44", response.data)

      if (response.data && response.data.length >= 2) {
        setProfileData(response.data[0]);
        // const newBlogs = Array.isArray(response.data[1])
        //   ? response.data[1]
        //   : [];
        // setBlogs(newBlogs);
        //console.log("New blogs:", blogs);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  }

 async function handleFollow() {
  console.log("Data Retrieved in SR: ", profileData.username);
  console.log("Entered handle Follow");

  try {
    const response = await axios.post("/follow", {
      currentUsername: username,
      userToFollow: profileData.username,
    });

    console.log("Response Received in handleFollow: ", response.data);
  } catch (error) {
    console.error("Error in handleFollow:", error.response || error);
  }
}


  async function handleUnfollow() {
    //alert("REACHED HANDLE REMOVE IN SD")
    try {
      await axios.post("/unfollow", {
        currentUsername: username,
        userToUnfollow: profileData.username,
      });
    } catch (error) {
      console.error("Error Unfollowing User:", error);
    }
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 w-full overflow-hidden">
      {loading ? (
        <p>No User Found</p>
      ) : (
        profileData && (
          <ProfileDisplay
            cover={profileData.cover}
            name={profileData.name}
            user={profileData.username}
            email={profileData.email}
            followers={profileData.followers || []}
            blogs={blogs}
            following={profileData.following}
            handleFollow={handleFollow}
            handleUnfollow={handleUnfollow}
          />
        )
      )}
    </div>
  );
}

export default SearchResults;
