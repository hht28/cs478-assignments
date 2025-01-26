import { useState, useEffect } from "react";
import axios from "axios";
import { Book, Author } from "../types.ts";
import "./BooksTable.css";

export default function BooksTable() {
  let [books, setBooks] = useState<Book[]>([]);
  let [authors, setAuthors] = useState<Author[]>([]);
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let fetchBooksAndAuthors = async () => {
      try {
        setLoading(true);
        setError(null);

        let booksResponse = await axios.get<Book[]>("http://localhost:3000/books");
        setBooks(booksResponse.data);

        let authorsResponse = await axios.get<Author[]>("http://localhost:3000/authors");
        setAuthors(authorsResponse.data);
      } catch (err) {
        setError("Failed to fetch books or authors.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooksAndAuthors();
  }, []);

  let getAuthorName = (authorId: number): string => {
    let author = authors.find((a) => a.id === Number(authorId));
    return author ? author.name : "Unknown Author";
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Books</h2>
      <div id="books-table">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author ID</th>
            <th>Author Name</th>
            <th>Publication Year</th>
            <th>Genre</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author_id}</td>
              <td>{getAuthorName(book.author_id)}</td>
              <td>{book.pub_year}</td>
              <td>{book.genre}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
