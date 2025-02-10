import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      console.log("Calling /login endpoint with:", { username, password });
      let response = await axios.post("http://localhost:3000/login", { username, password });
      console.log("Login response:", response.data); 
      setUser(username);
      setToken(response.data.token);
      localStorage.setItem("user", username);
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

const signup = async (username: string, password: string) => {
  try {
    console.log("Calling /register endpoint with:", { username, password });
    const response = await axios.post("http://localhost:3000/register", {
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

  const logout = () => {
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