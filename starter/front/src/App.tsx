import './App.css'
import AddAuthorForm from "./components/AddAuthorForm.tsx";
import AddBookForm from "./components/AddBookForm.tsx";
import BooksTable from "./components/BooksTable.tsx";
import SearchBooks from "./components/SearchBooks.tsx";

function App() {
  
  return (
    <div>
      <h1>Library Management</h1>
      <AddAuthorForm />
      <AddBookForm />
      <BooksTable />
      <SearchBooks />
    </div>
  );
}

export default App
