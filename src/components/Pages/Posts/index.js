import { useState } from "react";


import PaginatedItems from "./Pagination/index";


import "./Posts.scss";

const Posts = () => {

  const [nmbOfPosts, setNmbOfPosts] = useState();

  return (
    <main className="Posts">
      <header>
        <div className="inner-container">
          <p>Posts found: {nmbOfPosts || "0"}</p>
        </div>
      </header>
      {/* show paginated Items and pagination nav */}
      <section className="paginated-items">
        <div className="inner-container">
          <PaginatedItems setPostsFound={(val) => setNmbOfPosts(val)} />
        </div>
      </section>
    </main>
  );
};

export default Posts;
