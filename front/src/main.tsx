import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./components/Layout";
import NotFound from "./components/NotFound";
import AddAuthorForm from "./components/AddAuthorForm";
import AddBookForm from "./components/AddBookForm";
import BooksTable from "./components/BooksTable";
import SearchBooks from "./components/SearchBooks";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <BooksTable /> },
      { path: "/add-author", element: <AddAuthorForm /> },
      { path: "/add-book", element: <AddBookForm /> },
      { path: "/search-books", element: <SearchBooks /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);