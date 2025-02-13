import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { TextField, Button, Snackbar } from "@mui/material";

export default function AddAuthorForm() {
  let [name, setName] = useState("");
  let [bio, setBio] = useState("");
  let [message, setMessage] = useState("");
  let auth = useContext(AuthContext);

  let handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.user) {
      setMessage("You must be logged in to add an author.");
      return;
    }

    try {
      let creator_id = auth.user.id; 
      await axios.post(
        "http://localhost:3000/authors",
        { name, bio, creator_id },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setMessage("Author added successfully!");
      setName("");
      setBio("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let serverErrorMessage = error.response?.data?.error || "Failed to add book.";
        setMessage(serverErrorMessage);
      } else {
        setMessage("Failed to add book.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Author</h2>
      {auth?.user ? (
        <>
          <div>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              margin="normal"
            />
          </div>
          <div>
            <TextField
              fullWidth
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              margin="normal"
              multiline
              rows={4}
            />
          </div>
          <Button type="submit" variant="contained" color="primary">
            Add Author
          </Button>
        </>
      ) : (
        <p>Please log in to add an author.</p>
      )}
      {message && <Snackbar open={!!message} message={message} autoHideDuration={3000} onClose={() => setMessage("")} />}
    </form>
  );
}