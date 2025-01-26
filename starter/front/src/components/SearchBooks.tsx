import { useState, useEffect } from "react";
import axios from "axios";
import { Book, Author } from "../types.ts";
import "./BooksTable.css";

export default function SearchBooks() {
  let [year, setYear] = useState("");
  let [books, setBooks] = useState<Book[]>([]);
  let [authors, setAuthors] = useState<Author[]>([]);
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let fetchAuthors = async () => {
      try {
        let { data } = await axios.get<Author[]>("http://localhost:3000/authors");
        setAuthors(data);
      } catch (err) {
        console.error("Error fetching authors:", err);
      }
    };

    fetchAuthors();
  }, []);

  let handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      let { data } = await axios.get<Book[]>(
        `http://localhost:3000/books?pub_year=${year}`
      );
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to fetch books.");
    } finally {
      setLoading(false);
    }
  };

  let getAuthorName = (authorId: number): string => {
    let author = authors.find((a) => a.id === Number(authorId));
    return author ? author.name : "Unknown Author";
  };

  return (
    <div>
      <h2>Search Books</h2>
      <input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Published after year"
      />
      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && books.length > 0 && (
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
      )}

      {!loading && !error && books.length === 0 && <p>No books found.</p>}
    </div>
  );
}
