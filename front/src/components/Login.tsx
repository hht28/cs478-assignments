import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

let Login: React.FC = () => {
  let auth = useContext(AuthContext);
  let navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth?.token) {
      //console.log("Token after login:", auth.token); 
      navigate("/"); //redirect after login
    }
  }, [auth?.token, navigate]);

  let handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth?.login(username, password);
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;