import { Link, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "./Layout.css";

function Header() {
  const auth = useContext(AuthContext);

  return (
    <>
      {auth?.user && (
        <div style={{ marginBottom: "10px" }}>
          Welcome, {auth.user.username}!
        </div>
      )}

      <Link to="/">Home</Link>
      {auth?.user ? (
        <>
          <Link to="/add-author">Add Author</Link>
          <Link to="/add-book">Add Book</Link>
          <Link to="/search-books">Search Books</Link>
          <button onClick={auth.logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
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