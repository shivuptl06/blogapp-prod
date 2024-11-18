import axios from "axios";

async function onEdit(postId, updatedPost) {
  try {
    const response = await axios.post(
      "https://blogapp-prod-production.up.railway.app/edit",
      {
        id: postId,
        ...updatedPost,
      }
    );
    console.log("Post updated successfully:", response.data);
    // Optionally, refresh the post list or navigate after editing
  } catch (error) {
    console.error("Error updating post:", error);
  }
}

export default onEdit;
