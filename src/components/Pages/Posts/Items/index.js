import { Link } from "react-router-dom";


import "./Items.scss";

const Items = ({ currentItems }) => (
  <section className="Items">
    {currentItems &&
      currentItems.map((item, i) => (
        <article className="Item" key={i}>
          <div className="Item-inner">
            <h2>{item.title}</h2>
            <p>{item.body}</p>
            <Link
              to={{
                pathname: `/posts/${item.id}`,
              }}
            >
              Read More <span>&#8594;</span>
            </Link>
          </div>
        </article>
      ))}
  </section>
);

export default Items;
