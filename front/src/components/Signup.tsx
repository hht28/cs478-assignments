import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

let Signup: React.FC = () => {
  let auth = useContext(AuthContext);
  let navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [error, setError] = useState<string | null>(null);

  let validateInputs = () => {
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  let handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) {
      return;
    }

    try {
      //console.log("Calling auth.signup with:", { username, password });
      await auth?.signup(username, password);
      //console.log("Signup successful, redirecting...");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err); 
      setError((err as any).message || "Signup failed"); 
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username (min 3 characters)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;