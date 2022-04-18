import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { gql, useLazyQuery } from "@apollo/client";
import { UserPostsContext } from "../../../App";


import "./Post.scss";

const GET_ARTICLE = gql`
  query GetArticle($id: ID!) {
    post(id: $id) {
      id
      title
      body
      user {
        id
        name
        address {
          city
          zipcode
          street
        }
      }
      comments {
        data {
          body
          name
        }
      }
    }
  }
`;

const Post = () => {

  const [article, setArticle] = useState();
  const [prevID, setPrevID] = useState(null);
  const [nextID, setNextID] = useState(null);
  const [forcedRerendering, setforcedRerendering] = useState(0);


  let { id: postId } = useParams();


  let { postsIDs } = useContext(UserPostsContext);

 
  const [getArticle, { called, loading, data }] = useLazyQuery(GET_ARTICLE, {
    fetchPolicy: "network-only",
    onCompleted: (resp) => {
      if (resp && resp.post) {
        setArticle(resp.post);
      } else {
       
        let err = new Error("graphQL server bad response!");
        return Promise.reject(err);
      }
    },
  });

  useEffect(() => {
   
    let postIdent = parseInt(postId);
    getArticle({ variables: { id: postIdent } }).catch((err) => {
      console.log(err);
   
    });
   
    if (postsIDs) {
     
      let currentPosition = postsIDs.indexOf(postId);
      setPrevID(currentPosition === 0 ? null : postsIDs[currentPosition - 1]);
      setNextID(
        currentPosition === postsIDs.length - 1
          ? null
          : postsIDs[currentPosition + 1]
      );
    } else {
   
      setPrevID(null);
      setNextID(null);
    }
  }, [forcedRerendering, getArticle, postId, postsIDs]);


  const handlePreventDisabledLink = (event) => {
    if (event.target.className === "disabled") {
      event.preventDefault();
    } else {
      setforcedRerendering(forcedRerendering + 1);
    }
  };

  return (
    <article className="Post">
      {called && loading && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
      {data && article && (
        <div className="inner-cont">
          <div className="article">
            <header>
              <h1>{article.title}</h1>
            </header>
            <p>{article.body}</p>
          </div>
          <nav>
            <div className="link-holder">
              <Link
                className={prevID !== null ? "" : "disabled"}
                to={`${prevID === null ? "/" : `/posts/${prevID}`}`}
                onClick={handlePreventDisabledLink}
              >
                &#8592; Previous article
              </Link>
            </div>
            <div className="link-holder">
              <Link
                className={nextID !== null ? "" : "disabled"}
                to={`${nextID === null ? "/" : `/posts/${nextID}`}`}
                onClick={handlePreventDisabledLink}
              >
                Next article &#8594;
              </Link>
            </div>
          </nav>
          <div className="author">
            <div className="author-name">
              <div className="author-name-inner">
                <p className="noun">Author Name</p>
                <p className="val">{article.user.name}</p>
              </div>
            </div>
            <div className="author-address">
              <p className="noun">Address</p>
              <p className="val">{`${article.user.address.city}, ${article.user.address.zipcode}, ${article.user.address.street}`}</p>
            </div>
          </div>
          <h2>Comments</h2>
          {article.comments &&
            article.comments.data &&
            article.comments.data.length > 0 &&
            article.comments.data.map((comment, i) => (
              <div className="comment" key={i}>
                <h3>{comment.name}</h3>
                <p>{comment.body}</p>
              </div>
            ))}
        </div>
      )}
    </article>
  );
};

export default Post;
