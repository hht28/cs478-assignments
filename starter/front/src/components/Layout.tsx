import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

function Header() {
  return (
    <>
      <Link to="/">Home</Link>
      <Link to="/add-author">Add Author</Link>
      <Link to="/add-book">Add Book</Link>
      <Link to="/search-books">Search Books</Link>
    </>
  );
}

function Layout() {
  return (
    <>
      <nav>
        <Header />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
