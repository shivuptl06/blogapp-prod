function CreatePost() {
  return (
    <div className="new-post text-center mt-10 space-y-5">
      <h2>Create a new post</h2>
      <form>
        <input type="text" placeholder="Title" className="w-3/5 border active:border-blue-600 rounded"/>
      </form>
    </div>
  );
}
export default CreatePost;
