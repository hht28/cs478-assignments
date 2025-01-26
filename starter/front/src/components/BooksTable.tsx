import { useState, useEffect } from "react";
import axios from "axios";
import { Book } from "../types.ts";

export default function BooksTable() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await axios.get<Book[]>("http://localhost:3000/books");
      setBooks(data);
    };
    fetchBooks();
  }, []);

  return (
    <div>
      <h2>Books</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author ID</th>
            <th>Publication Year</th>
            <th>Genre</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author_id}</td>
              <td>{book.pub_year}</td>
              <td>{book.genre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
