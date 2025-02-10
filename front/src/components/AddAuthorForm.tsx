import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

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
      await axios.post(
        "http://localhost:3000/authors",
        { name, bio },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setMessage("Author added successfully!");
      setName("");
      setBio("");
    } catch (error) {
      setMessage("Failed to add author.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Author</h2>
      {auth?.user ? (
        <>
          <div>
            <label>
              Name:
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          </div>
          <div>
            <label>
              Bio:
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />
            </label>
          </div>
          <button type="submit">Add Author</button>
        </>
      ) : (
        <p>Please log in to add an author.</p>
      )}
      {message && <p>{message}</p>}
    </form>
  );
}
