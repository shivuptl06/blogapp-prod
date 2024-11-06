import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Post from "../components/Post";

function Home() {
  const { username } = useContext(UserContext);
  const navigate = useNavigate();
  const [posts,setPosts] = useState();

  

  //   useEffect(()=>{
  //     if (username){
  //         navigate("/")
  //     }
  //     else{
  //         navigate("/login")
  //     }
  //   },[username])

  useEffect(() => {
    axios.get("http://localhost:5000/post").then((res) => {
      console.log(res.data);
      setPosts(res.data);
    });
  }, []);

  // If the user is not logged in, redirect to the login page
  if (!username) {
    return <Navigate to={"/login"} />;
  } else {
    return (
      // Render the home content if the user is logged in
   <>
   {/* {posts.length>0?
   posts.map((postEl)=>{
    return <Post post={postEl}/>
   })
   :"No Post To Display"} */}
   </>
    )
  }
}

export default Home;
