import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileDisplay from "../components/ProfileDisplay";

function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search).get("query");

  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState([]); // Ensure blogs is initialized as an empty array
  const [loading, setLoading] = useState(true);
  let data;

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
      const response = await axios.post("http://localhost:5000/search/users", {
        query: searchParams,
      });
      //console.log("Response data:", response.data[1]);
      data = response.data[1];
      //console.log("Data: ",data);
      
      setBlogs(data);
      console.log("BLOG AT 42:", blogs)

      if (response.data && response.data.length >= 2) {
        setProfileData(response.data[0]);
        // const newBlogs = Array.isArray(response.data[1])
        //   ? response.data[1]
        //   : [];
        // setBlogs(newBlogs);
        console.log("New blogs:", blogs);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
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
            username={profileData.username}
            email={profileData.email}
            followers={profileData.followers || []}
            blogs={blogs}
          />
        )
      )}
    </div>
  );
}

export default SearchResults;
