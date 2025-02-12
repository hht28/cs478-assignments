import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import z from "zod";
import cors from "cors";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

type AuthenticatedRequest = Request & { user?: { id: number; username: string } };

let JWT_SECRET = process.env.JWT_SECRET || "the_secret_key"; // used to sign the JWT

let app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

// the schemas

let userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

let authorSchema = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  bio: z.string(),
  creator_id: z.number().int(),
});
  
let bookSchema = z.object({
  id: z.number().int().optional(),
  author_id: z.number().int(), // author_id gotta match an existing author's ID
  title: z.string(),
  pub_year: z.string().regex(/^\d{4}$/, "Invalid year format"),
  genre: z.enum(["adventure", "sci-fi", "romance", "mystery", "fantasy", "non-fiction"]),
  creator_id: z.number().int(),
});

function parseError(zodError: z.ZodError): string[] {
  let { formErrors, fieldErrors } = zodError.flatten();
  return [
      ...formErrors,
      ...Object.entries(fieldErrors).map(
          ([property, message]) => `"${property}": ${message}`
      ),
  ];
}

let authenticateUser = (req: AuthenticatedRequest, res: Response, next: Function) => {
  let authHeader = req.headers.authorization; 
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  let token = authHeader.split(" ")[1]; // extract the token from "Bearer <token>"
  //console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    let decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};
  
//------------------------------------------AUTHORS----------------------------------------------

// add author
app.post("/authors", authenticateUser, async (req: AuthenticatedRequest, res) => {
  console.log(req.body);
  let parseResult = authorSchema.omit({ id: true }).safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseError(parseResult.error) });
  }

  let { name, bio } = parseResult.data;
  let creator_id = req.user?.id;

  try {
    let result = await db.run(
      "INSERT INTO authors (name, bio, creator_id) VALUES (?, ?, ?)",
      [name, bio, creator_id]
    );
    let newAuthor = await db.get("SELECT * FROM authors WHERE id = ?", result.lastID);
    res.status(201).json(newAuthor);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
  

// get all authors
app.get("/authors", async (req, res) => {
    let authors = await db.all("SELECT * FROM authors");
    res.json(authors);
  });
  
// get an author by ID
app.get("/authors/:id", async (req, res) => {
    let { id } = req.params;
    let author = await db.get("SELECT * FROM authors WHERE id = ?", id);
    if (!author) return res.status(404).json({ error: "Author not found." });
    res.json(author);
  });
  
// delete an author by ID
app.delete("/authors/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
  let { id } = req.params;
  let creator_id = req.user?.id;

  try {
    let author = await db.get("SELECT * FROM authors WHERE id = ?", id);
    if (!author) {
      return res.status(404).json({ error: "Author not found." });
    }

    if (author.creator_id !== creator_id) {
      return res.status(403).json({ error: "Forbidden: You are not the creator of this author." });
    }

    let books = await db.all("SELECT * FROM books WHERE author_id = ?", id);
    if (books.length > 0) {
      return res.status(400).json({ error: "Cannot delete author with associated books." });
    }

    await db.run("DELETE FROM authors WHERE id = ?", id);
    res.status(200).json({ message: "Author deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

//------------------------------------------BOOKS----------------------------------------------

// get all books with optional query filters
app.get("/books", async (req, res) => {
    let { pub_year, genre } = req.query;
    let query = "SELECT * FROM books WHERE 1=1"; //acts like a placeholder so i can dynamically add more conditions to the query
    let params: string[] = [];
    //console.log(req.query);
  
    if (pub_year) {
      query += " AND CAST(pub_year AS INT) >= ?";
      params.push(pub_year as string);
    }
    if (genre) {
      query += " AND genre = ?";
      params.push(genre as string);
    }
  
    let books = await db.all(query, params);
    res.json(books);
  });

// get a book by id
app.get("/books/:id", async (req, res) => {
    let { id } = req.params;
    let book = await db.get("SELECT * FROM books WHERE id = ?", id);
    if (!book) return res.status(404).json({ error: "Book not found." });
    res.json(book);
  });

// delete a book by id
app.delete("/books/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
  let { id } = req.params;
  let creator_id = req.user?.id; 
  console.log(req.body);

  try {
    let book = await db.get("SELECT * FROM books WHERE id = ?", id);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    if (book.creator_id !== creator_id) {
      return res.status(403).json({ error: "Forbidden: You are not the creator of this book." });
    }

    await db.run("DELETE FROM books WHERE id = ?", id);
    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// add a book
app.post("/books", authenticateUser, async (req: AuthenticatedRequest, res) => {
  let parseResult = bookSchema.omit({ id: true }).safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseError(parseResult.error) });
  }

  let { author_id, title, pub_year, genre } = parseResult.data;
  let creator_id = req.user?.id;

  try {
    let authorExists = await db.get("SELECT * FROM authors WHERE id = ?", author_id);
    if (!authorExists) {
      return res.status(404).json({ error: "Author not found." });
    }

    let result = await db.run(
      "INSERT INTO books (author_id, title, pub_year, genre, creator_id) VALUES (?, ?, ?, ?, ?)",
      [author_id, title, pub_year, genre, creator_id]
    );
    let newBook = await db.get("SELECT * FROM books WHERE id = ?", result.lastID);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

//update book
app.patch("/books/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
  let id = parseInt(req.params.id);
  let parseResult = bookSchema.omit({ id: true }).safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseError(parseResult.error) });
  }

  let { author_id, title, pub_year, genre } = parseResult.data;
  let creator_id = req.user?.id; 

  try {
    let book = await db.get("SELECT * FROM books WHERE id = ?", id);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    if (book.creator_id !== creator_id) {
      return res.status(403).json({ error: "Forbidden: You are not the creator of this book." });
    }

    let updated = await db.run(
      "UPDATE books SET title = ?, author_id = ?, pub_year = ?, genre = ? WHERE id = ?",
      [title, author_id, pub_year, genre, id]
    );
    if (updated.changes === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//------------------------------------------AUTHENTICATION----------------------------------------------

// register a new user
app.post("/register", async (req, res) => {
  console.log("Received registration request:", req.body);
  let parseResult = userSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("Validation error:", parseResult.error);
    return res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.flatten(), 
    });
  }

  let { username, password } = parseResult.data;
  console.log("Parsed username and password:", username, password);
  let existingUser = await db.get("SELECT * FROM users WHERE username = ?", username);
  if (existingUser) {
    console.error("Username already taken:", username);
    return res.status(400).json({ error: "Username already taken" });
  }

  let hashedPassword = await argon2.hash(password);
  await db.run("INSERT INTO users (username, password) VALUES (?, ?)", username, hashedPassword);
  console.log("User registered successfully:", username);
  res.status(201).json({ message: "User registered successfully" });
});

// login user
app.post("/login", async (req, res) => {
  let { username, password } = req.body;
  console.log("Login request received:", { username, password });

  let user = await db.get("SELECT * FROM users WHERE username = ?", username);
  if (!user) {
    console.error("User not found:", username);
    return res.status(401).json({ error: "Invalid username or password" });
  }

  let passwordValid = await argon2.verify(user.password, password);
  if (!passwordValid) {
    console.error("Invalid password for user:", username);
    return res.status(401).json({ error: "Invalid username or password" });
  }

  let token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  console.log("Token generated:", token);

  res.json({ token, user: { id: user.id, username: user.username } });
});

// // logout user
// app.post("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.json({ message: "Logout successful" });
// });

// test protected route
app.get("/profile", authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: `Welcome, ${req.user?.username}!` });
});

//------------------------------------------SERVER----------------------------------------------

// reset database for testing
app.delete("/tests/reset", async (req, res) => {
  await db.run("DELETE FROM books");
  await db.run("DELETE FROM authors");
  await db.run("DELETE FROM users");
  res.send({ message: "Test database reset." });
});


// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
