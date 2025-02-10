import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Author } from "../types.ts";
import { AuthContext } from "../contexts/AuthContext";

export default function AddBookForm() {
  let [authors, setAuthors] = useState<Author[]>([]);
  let [title, setTitle] = useState("");
  let [authorId, setAuthorId] = useState("");
  let [pubYear, setPubYear] = useState("");
  let [genre, setGenre] = useState("");
  let [message, setMessage] = useState("");
  let auth = useContext(AuthContext);

  useEffect(() => {
    let fetchAuthors = async () => {
      try {
        let { data } = await axios.get<Author[]>("http://localhost:3000/authors");
        setAuthors(data);
      } catch (error) {
        setMessage("Failed to fetch authors.");
      }
    };
    fetchAuthors();
  }, []);

  let handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.user) {
      setMessage("You must be logged in to add a book.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/books",
        {
          title,
          author_id: parseInt(authorId),
          pub_year: pubYear,
          genre,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setMessage("Book added successfully!");
      setTitle("");
      setAuthorId("");
      setPubYear("");
      setGenre("");
    } catch (error) {
      setMessage("Failed to add book.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Book</h2>
      {auth?.user ? (
        <>
          <div>
            <label>
              Title:
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
          </div>
          <div>
            <label>
              Author:
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required>
                <option value="">Select an author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Publication Year:
              <input value={pubYear} onChange={(e) => setPubYear(e.target.value)} required />
            </label>
          </div>
          <div>
            <label>
              Genre:
              <select value={genre} onChange={(e) => setGenre(e.target.value)} required>
                <option value="">Select a genre</option>
                <option value="adventure">Adventure</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="romance">Romance</option>
                <option value="mystery">Mystery</option>
                <option value="fantasy">Fantasy</option>
                <option value="non-fiction">Non-Fiction</option>
              </select>
            </label>
          </div>
          <button type="submit">Add Book</button>
        </>
      ) : (
        <p>Please log in to add a book.</p>
      )}
      {message && <p>{message}</p>}
    </form>
  );
}
