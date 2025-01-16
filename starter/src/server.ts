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
    genre: z.string(),
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
app.post("/authors", async (req: Request, res: Response) => {
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
app.get("/authors", async (req: Request, res: Response) => {
    let authors = await db.all("SELECT * FROM authors");
    res.json(authors);
  });
  
// get an author by ID
app.get("/authors/:id", async (req: Request, res: Response) => {
    let { id } = req.params;
    let author = await db.get("SELECT * FROM authors WHERE id = ?", id);
    if (!author) return res.status(404).json({ error: "Author not found" });
    res.json(author);
  });
  
// delete an author by ID
app.delete("/authors/:id", async (req: Request, res: Response) => {
    let { id } = req.params;
    let result = await db.run("DELETE FROM authors WHERE id = ?", id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Author not found" });
    res.json({ message: "Author deleted successfully" });
  });

// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
