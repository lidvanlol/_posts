import { useState, useEffect, useContext } from "react";
import Pagination from "@material-ui/lab/Pagination";
import { gql, useLazyQuery } from "@apollo/client";
import { UserPostsContext } from "../../../../App";


import "./Pagination.scss";


import Items from "../Items";

const GET_POSTS = gql`
  query GetPosts($options: PageQueryOptions) {
    posts(options: $options) {
      data {
        id
        title
        body
        user {
          id
          name
        }
      }
      meta {
        totalCount
      }
    }
  }
`;
const GET_POSTS_IDS = gql`
  query GetPostsIDs($options: PageQueryOptions) {
    posts(options: $options) {
      data {
        id
      }
    }
  }
`;
const GET_USERS = gql`
  query GetUsers {
    users {
      data {
        id
        name
      }
    }
  }
`;
const GET_AUTHORS_POSTS = gql`
  query GetAuthPosts($id: ID!) {
    user(id: $id) {
      id
      name
      posts {
        data {
          id
          title
          body
        }
      }
    }
  }
`;
const GET_AUTHORS_POSTS_IDS = gql`
  query GetAuthPosts($id: ID!) {
    user(id: $id) {
      id
      posts {
        data {
          id
        }
      }
    }
  }
`;

let responseSearchTimeout;

const PaginatedItems = (props) => {
 
  const itemsPerPage = 14;


  const [page, setPage] = useState(1);
  const [count, setCount] = useState(10);
  const [currentItems, setCurrentItems] = useState(null);
  const [searchTitleInput, setSearchTitleInput] = useState();
  const [searchTitle, setSearchTitle] = useState();
  const [authors, setAuthors] = useState();
  const [author, setAuthor] = useState("");

 
  let { setPostsIDs } = useContext(UserPostsContext);

  // define get posts lazyQuery
  const [getPosts, { called, loading, data }] = useLazyQuery(GET_POSTS, {
    fetchPolicy: "network-only",
    onCompleted: (resp) => {
      if (resp && resp.posts && resp.posts.meta) {
        // set data
        let obtainedData = resp.posts.data;
        if (obtainedData.length > 0) {
          // found something
          // limit body length
          let limitedData = obtainedData.map((d) => {
            if (d.body.length > 10) {
              d.body = d.body.slice(0, 250) + "...";
            }
            return d;
          });
          setCurrentItems(limitedData);
          // set number of posts
          let nmb = resp.posts.meta.totalCount;
          setCount(Math.ceil(nmb / itemsPerPage));
          // send number of post to parent component - to set header
          props.setPostsFound(nmb);
        } else {
          // found nothing
          setCurrentItems(null);
          setCount(1);
          props.setPostsFound(0);
        }
      } else {
        // response incorrect
        throw new Error("graphQL server bad response!");
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
  // define get IDs from filter/non filter posts
  const [getPostsIDs] = useLazyQuery(GET_POSTS_IDS, {
    fetchPolicy: "network-only",
    onCompleted: (resp) => {
      if (resp && resp.posts && resp.posts.data && resp.posts.data.length > 0) {
        setPostsIDs(resp.posts.data.map((entry) => entry.id));
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
  // define get posts by author
  const [
    getAuthorPosts,
    { called: calledAuth, loading: loadingAuth, data: dataAuth },
  ] = useLazyQuery(GET_AUTHORS_POSTS, {
    fetchPolicy: "network-only",
    onCompleted: (resp) => {
      if (resp && resp.user && resp.user.posts && resp.user.posts.data) {
        // set data
        let obtainedData = resp.user.posts.data;
        if (obtainedData.length > 0) {
          // found something
          // limit body length
          let limitedData = obtainedData.map((d) => {
            if (d.body.length > 10) {
              d.body = d.body.slice(0, 250) + "...";
            }
            return d;
          });
          setCurrentItems(limitedData);
          // set number of posts
          let nmb = resp.user.posts.data.length;
          setCount(Math.ceil(nmb / itemsPerPage));
          // send number of post to parent component - to set header
          props.setPostsFound(nmb);
        } else {
          // found nothing
          setCurrentItems(null);
          setCount(1);
          props.setPostsFound(0);
        }
      } else {
        // response incorrect
        throw new Error("graphQL server bad response!");
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
  // define get IDs from author filter posts
  const [getAuthorPostsIDs] = useLazyQuery(GET_AUTHORS_POSTS_IDS, {
    fetchPolicy: "network-only",
    onCompleted: (resp) => {
      if (
        resp &&
        resp.user &&
        resp.user.posts &&
        resp.user.posts.data &&
        resp.user.posts.data.length > 0
      ) {
        setPostsIDs(resp.user.posts.data.map((entry) => entry.id));
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  // Fetch items graphQL
  useEffect(() => {
    if (author === "") {
      // fetch all / filter by title
      let options = {
        paginate: {
          page,
          limit: itemsPerPage,
        },
      };
      let idsOptions = {
        paginate: {
          page: 1,
          limit: 10000 * 10000,
        },
      };
      if (searchTitle) {
        options.operators = [
          {
            kind: "LIKE",
            field: "title",
            value: searchTitle,
          },
        ];
        options.paginate = { page: 1 };
        idsOptions.operators = options.operators;
      }
      getPosts({ variables: { options } });
      getPostsIDs({ variables: { options: idsOptions } });
    } else {
      // fetch by author
      getAuthorPosts({ variables: { id: parseInt(author) } });
      getAuthorPostsIDs({ variables: { id: parseInt(author) } });
    }
  }, [page, searchTitle, author, getPosts, getPostsIDs, getAuthorPosts, getAuthorPostsIDs]);

  // paginate/page change
  const handleChange = (event, value) => {
    setPage(value);
  };

  // search by title
  const handleSearchByTitle = (event) => {
    let { value } = event.target;
    // set input value
    setSearchTitleInput(value);
    // reset response timeout
    clearTimeout(responseSearchTimeout);
    // do search
    responseSearchTimeout = setTimeout(() => {
      // set search start
      setSearchTitle(value);
      // reset search by author
      setAuthor("");
    }, 1000);
  };

  // search by user
  const [getUsers] = useLazyQuery(GET_USERS, { fetchPolicy: "network-only" });
  useEffect(() => {
    // get all users on mount
    getUsers()
      .then((resp) => {
        if (resp && resp.data && resp.data.users && resp.data.users.data) {
          let users = resp.data.users.data;
          setAuthors(users);
        } else {
          let err = new Error("graphQL server bad response!");
          return Promise.reject(err);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [getUsers]);

  const handleChangeAuthor = (event) => {
    let val = event.target.value;
    setAuthor(val);
    // reset search by title
    setSearchTitleInput();
  };

  return (
    <div className="PaginatedItems">
      {/* search inputs */}
      <section className="search-area">
        <div className="input-area">
          <input
            type="search"
            placeholder="Search"
            value={searchTitleInput || ""}
            onChange={handleSearchByTitle}
          />
        </div>
        <div className="input-area">
          <select value={author} onChange={handleChangeAuthor}>
            <option disabled value="">
              Filter by author name
            </option>
            {authors &&
              authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
          </select>
        </div>
      </section>
      {/* display items */}
      {((called && loading) || (calledAuth && loadingAuth)) && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
      {!loading && !loadingAuth && (data || dataAuth) && (
        <Items currentItems={currentItems} />
      )}
      {!loading &&
        !loadingAuth &&
        ((data &&
          data.posts &&
          data.posts.data &&
          data.posts.data.length === 0) ||
          (dataAuth &&
            dataAuth.user &&
            dataAuth.user.posts &&
            dataAuth.user.posts.data &&
            dataAuth.user.posts.data.length === 0)) && (
          <div className="no-results">
            <p>No results!</p>
          </div>
        )}
      {/* display paginate bar */}
      {count && count > 1 && (
        <div className="pagination-container">
          <Pagination count={count} page={page} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default PaginatedItems;
