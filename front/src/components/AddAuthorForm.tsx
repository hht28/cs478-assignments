import { useState } from "react";
import axios from "axios";

export default function AddAuthorForm() {
  let [name, setName] = useState("");
  let [bio, setBio] = useState("");
  let [message, setMessage] = useState("");

  let handleSubmit = async (e: React.FormEvent) => {
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
      {message && <p>{message}</p>}
    </form>
  );
}
