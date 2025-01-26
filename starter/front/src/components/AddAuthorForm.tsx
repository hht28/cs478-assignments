import { useState } from "react";
import axios from "axios";

export default function AddAuthorForm() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/authors", { name, bio });
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
      <label>
        Name:
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Bio:
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />
      </label>
      <button type="submit">Add Author</button>
      {message && <p>{message}</p>}
    </form>
  );
}
