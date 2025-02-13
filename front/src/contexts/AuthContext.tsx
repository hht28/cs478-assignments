import React, { createContext, useState } from "react";
import axios from "axios";

interface AuthContextType {
  user: { id: number; username: string } | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export let AuthContext = createContext<AuthContextType | null>(null);

export let AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let [user, setUser] = useState<{ id: number; username: string } | null>(null);
  let [token, setToken] = useState<string | null>(null);

  let login = async (username: string, password: string) => {
    try {
      console.log("Calling /login endpoint with:", { username, password });
      let response = await axios.post("http://localhost:3000/login", { username, password });
      console.log("Login response:", response.data);

      let { token, user } = response.data; 
      if (!token) {
        throw new Error("Token not found in response");
      }

      setUser({ id: user.id, username: user.username }); // store user as an object
      setToken(token);
      localStorage.setItem("user", JSON.stringify({ id: user.id, username: user.username })); // store user object in localStorage
      localStorage.setItem("token", token);
      
      //update token for debugging purposes
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("Login successful, token set:", token);
      console.log("User:", user);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

let signup = async (username: string, password: string) => {
  try {
    console.log("Calling /register endpoint with:", { username, password });
    let response = await axios.post("http://localhost:3000/register", {
      username,
      password,
    });
    console.log("Signup response:", response.data);
    await login(username, password);
  } catch (error) {
    console.error("Signup failed:", error);
    throw new Error("Error signing up");
  }
};

  let logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};