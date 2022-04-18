import { Route, Routes } from "react-router-dom";
import { createContext, useMemo, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { Post, Posts, NotFound } from "./components/index";

const GET_IDS = gql`
  query GetIDs {
    posts {
      data {
        id
      }
    }
  }
`;

export const UserPostsContext = createContext();

function App() {
  const [postsIDs, setPostsIDs] = useState();

  let [getIDs] = useLazyQuery(GET_IDS, {
    fetchPolicy: "network-only",
    onCompleted: (resp) => {
      if (resp && resp.posts && resp.posts.data) {
        setPostsIDs(
          resp.posts.data.map((post) => {
            return post.id;
          })
        );
      } else {
        // response incorrect
        throw new Error("graphQL server bad response!");
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // set context of IDs once on load
  useMemo(() => {
    getIDs();
  }, [getIDs]);

  return (
    <UserPostsContext.Provider value={{ postsIDs, setPostsIDs }}>
      <div className="App">
        <Routes>
          <Route path="/" exact element={<Posts />} />
          <Route path="/posts/:id" element={<Post />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </UserPostsContext.Provider>
  );
}

export default App;
