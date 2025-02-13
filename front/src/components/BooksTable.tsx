import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Book, Author } from "../types.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

let GENRE_OPTIONS = ["adventure", "sci-fi", "romance", "mystery", "fantasy", "non-fiction"];

export default function BooksTable() {
  let [books, setBooks] = useState<Book[]>([]);
  let [authors, setAuthors] = useState<Author[]>([]);
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState<string | null>(null);
  let [editBook, setEditBook] = useState<Book | null>(null);
  let [snackbarMessage, setSnackbarMessage] = useState("");

  let auth = useContext(AuthContext);
  let isLoggedIn = !!auth?.user; 

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

  let handleEdit = async () => {
    if (editBook && auth?.token) {
      try {
        let updatedBook = {
          ...editBook,
          author_id: Number(editBook.author_id),
        };

        await axios.patch(
          `http://localhost:3000/books/${editBook.id}`,
          updatedBook,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        setBooks((prevBooks) =>
          prevBooks.map((b) => (b.id === editBook.id ? updatedBook : b))
        );

        setSnackbarMessage("Book updated successfully!");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          let serverErrorMessage = error.response?.data?.error || "Failed to update book.";
          setSnackbarMessage(serverErrorMessage);
        } else {
          setSnackbarMessage("Failed to update book.");
        }
      }
      setEditBook(null);
    }
  };

  let handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this book?") && auth?.token) {
      try {
        await axios.delete(`http://localhost:3000/books/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
        setSnackbarMessage("Book deleted successfully!");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          let serverErrorMessage = error.response?.data?.error || "Failed to delete book.";
          setSnackbarMessage(serverErrorMessage);
        } else {
          setSnackbarMessage("Failed to delete book.");
        }
      }
    }
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Publication Year</TableCell>
            <TableCell>Genre</TableCell>
            {isLoggedIn && <TableCell>Actions</TableCell>} {/* show actions column only if logged in */}
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{getAuthorName(book.author_id)}</TableCell>
              <TableCell>{book.pub_year}</TableCell>
              <TableCell>{book.genre}</TableCell>
              {isLoggedIn && ( 
                <TableCell>
                  <Button onClick={() => setEditBook(book)} variant="outlined">
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(book.id)}
                    variant="outlined"
                    color="error"
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* edit book */}
      {editBook && (
        <Dialog open={!!editBook} onClose={() => setEditBook(null)}>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={editBook.title}
              onChange={(e) => setEditBook({ ...editBook, title: e.target.value })}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Publication Year"
              value={editBook.pub_year}
              onChange={(e) => setEditBook({ ...editBook, pub_year: e.target.value })}
              margin="dense"
            />
            <Select
              fullWidth
              value={editBook.genre}
              onChange={(e) => setEditBook({ ...editBook, genre: e.target.value })}
              margin="dense"
            >
              {GENRE_OPTIONS.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              value={editBook.author_id}
              onChange={(e) => setEditBook({ ...editBook, author_id: Number(e.target.value) })}
              margin="dense"
            >
              {authors.map((author) => (
                <MenuItem key={author.id} value={author.id}>
                  {author.name}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEdit} variant="contained">
              Save
            </Button>
            <Button onClick={() => setEditBook(null)} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* success notif */}
      <Snackbar
        open={!!snackbarMessage}
        message={snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage("")}
      />
    </div>
  );
}