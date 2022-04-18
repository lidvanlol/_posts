import { Link } from 'react-router-dom'


import './NotFound.scss'

const NotFound = () => (
  <main className="NotFound">
    <div className="centered">
      <h1>
        404! - Page Not Found!!!! The page you are looking for does not exists!
      </h1>
      <Link to="/">Home Page</Link>
    </div>
  </main>
);

export default NotFound
