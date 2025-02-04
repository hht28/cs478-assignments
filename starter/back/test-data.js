import sqlite3 from "sqlite3";
import { open } from "sqlite";

sqlite3.verbose();

async function setupDatabase() {
  let db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  try {
    await db.exec(`
      DELETE FROM books;
      DELETE FROM authors;
      VACUUM;
    `);

    console.log("Old data cleared.");

    await db.exec(`
      INSERT INTO authors (id, name) VALUES 
        (1, 'J.K. Rowling'), 
        (2, 'George Orwell'), 
        (3, 'J.R.R. Tolkien');

      INSERT INTO books (title, author_id, pub_year, genre) VALUES
        ('Harry Potter', 1, 1997, 'fantasy'),
        ('1984', 2, 1949, 'sci-fi'),
        ('The Hobbit', 3, 1937, 'fantasy');
    `);

    console.log("Test data inserted successfully.");
  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    await db.close();
  }
}

setupDatabase();
