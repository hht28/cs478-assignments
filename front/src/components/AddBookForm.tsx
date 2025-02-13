import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Author } from "../types.ts";
import { AuthContext } from "../contexts/AuthContext";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Snackbar,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";

export default function AddBookForm() {
  let [authors, setAuthors] = useState<Author[]>([]);
  let [title, setTitle] = useState("");
  let [authorId, setAuthorId] = useState<number | "">("");
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
      let creator_id = auth.user.id;
      await axios.post(
        "http://localhost:3000/books",
        {
          title,
          author_id: authorId,
          pub_year: pubYear,
          genre,
          creator_id,
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
      if (axios.isAxiosError(error)) {
        let serverErrorMessage = error.response?.data?.error || "Failed to add author.";
        setMessage(serverErrorMessage);
      } else {
        setMessage("Failed to add author.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h4" gutterBottom>
        Add Book
      </Typography>
      {auth?.user ? (
        <>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="author-label">Author</InputLabel>
            <Select
              labelId="author-label"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value as number)}
              required
            >
              <MenuItem value="">Select an author</MenuItem>
              {authors.map((author) => (
                <MenuItem key={author.id} value={author.id}>
                  {author.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Publication Year"
              value={pubYear}
              onChange={(e) => setPubYear(e.target.value)}
              required
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="genre-label">Genre</InputLabel>
            <Select
              labelId="genre-label"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
            >
              <MenuItem value="">Select a genre</MenuItem>
              <MenuItem value="adventure">Adventure</MenuItem>
              <MenuItem value="sci-fi">Sci-Fi</MenuItem>
              <MenuItem value="romance">Romance</MenuItem>
              <MenuItem value="mystery">Mystery</MenuItem>
              <MenuItem value="fantasy">Fantasy</MenuItem>
              <MenuItem value="non-fiction">Non-Fiction</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Add Book
          </Button>
        </>
      ) : (
        <Typography variant="body1">Please log in to add a book.</Typography>
      )}
      {message && (
        <Snackbar
          open={!!message}
          autoHideDuration={3000}
          onClose={() => setMessage("")}
          message={message}
        />
      )}
    </form>
  );
}