import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { z } from "zod";

let app = express();
app.use(express.json());

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
let authorSchema = z.object({
    id: z.number().int().optional(), 
    name: z.string(),
    bio: z.string(),
  });
  
let bookSchema = z.object({
    id: z.number().int().optional(),
    author_id: z.number().int(), // `author_id` gotta match an existing author's ID
    title: z.string(),
    pub_year: z.string().regex(/^\d{4}$/, "Invalid year format"),
    genre: z.enum(["adventure", "sci-fi", "romance", "mystery", "fantasy", "non-fiction"]),
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
  
// add author
app.post("/authors", async (req, res) => {
    let parseResult = authorSchema.omit({ id: true }).safeParse(req.body); // exclude id for validation cus it's auto generated
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseError(parseResult.error) });
    }
  
    let { name, bio } = parseResult.data;
    try {
      let result = await db.run("INSERT INTO authors (id, name, bio) VALUES (?, ?, ?)", [null, name, bio]);
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
    if (!author) return res.status(404).json({ error: "Author not found" });
    res.json(author);
  });
  
// delete an author by ID
app.delete("/authors/:id", async (req, res) => {
    let { id } = req.params;
  
    try {
      // Check if there are any books associated with the author
      let books = await db.all("SELECT * FROM books WHERE author_id = ?", id);
      if (books.length > 0) {
        return res
          .status(400)
          .json({ error: "Cannot delete author with associated books." });
      }
  
      // Delete the author
      let result = await db.run("DELETE FROM authors WHERE id = ?", id);
  
      if (result.changes === 0) {
        return res.status(404).json({ error: "Author not found." });
      }
  
      return res.status(200).json({ message: "Author deleted successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  });
  


// Get all books with optional query filters
app.get("/books", async (req, res) => {
    let { pub_year, genre } = req.query;
    let query = "SELECT * FROM books WHERE 1=1";
    let params: string[] = [];
  
    if (pub_year) {
      query += " AND pub_year >= ?";
      params.push(pub_year as string);
    }
    if (genre) {
      query += " AND genre = ?";
      params.push(genre as string);
    }
  
    let books = await db.all(query, params);
    res.json(books);
  });
  
// Get a book by ID
app.get("/books/:id", async (req, res) => {
    let { id } = req.params;
    let book = await db.get("SELECT * FROM books WHERE id = ?", id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  });

// Delete a book by ID
app.delete("/books/:id", async (req, res) => {
    let { id } = req.params;
    let result = await db.run("DELETE FROM books WHERE id = ?", id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  });

app.post("/books", async (req, res) => {
    let parseResult = bookSchema.omit({ id: true }).safeParse(req.body); // exclude id for validation cus it's auto generated
    if (!parseResult.success) {
        return res.status(400).json({ errors: parseError(parseResult.error) });
    }

    let { author_id, title, pub_year, genre } = parseResult.data;

    try {
        let authorExists = await db.get("SELECT * FROM authors WHERE id = ?", author_id);
        if (!authorExists) {
            return res.status(404).json({ error: "Author not found." });
            }

        let result = await db.run(
            "INSERT INTO books (author_id, title, pub_year, genre) VALUES (?, ?, ?, ?)",
            [author_id, title, pub_year, genre]
            );
            
        let newBook = await db.get("SELECT * FROM books WHERE id = ?", result.lastID);
        res.status(201).json(newBook); 
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
