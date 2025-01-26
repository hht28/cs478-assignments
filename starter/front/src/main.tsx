import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./components/Layout";
import NotFound from "./components/NotFound";
import AddAuthorForm from "./components/AddAuthorForm";
// import AddBookForm from "./components/AddBookForm";
import BooksTable from "./components/BooksTable";
// import SearchBooks from "./components/SearchBooks";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

let router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/add-author",
        element: <AddAuthorForm />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/",
        element: <BooksTable />,
      },
      // {
      //   path: "/",
      //   element: <AddBookForm />,
      // },
      // {
      //   path: "/",
      //   element: <SearchBooks />,
      // },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

