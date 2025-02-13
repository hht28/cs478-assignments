import sqlite3 from "sqlite3";
import { open } from "sqlite";
import argon2 from "argon2"; // Import argon2 for password hashing

sqlite3.verbose();

async function setupDatabase() {
  let db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  try {
    // Clear old data
    await db.exec(`
      DELETE FROM books;
      DELETE FROM authors;
      DELETE FROM users;
      VACUUM;
    `);

    console.log("Old data cleared.");

    // Hash passwords using argon2
    let password1 = await argon2.hash("password1");
    let password2 = await argon2.hash("password2");
    let password3 = await argon2.hash("password3");

    // Insert test users with hashed passwords
    await db.exec(`
      INSERT INTO users (id, username, password) VALUES
        (1, 'user1', '${password1}'),
        (2, 'user2', '${password2}'),
        (3, 'user3', '${password3}');
    `);

    console.log("Test users inserted successfully.");

    // Insert test authors with creator_id
    await db.exec(`
      INSERT INTO authors (id, name, bio, creator_id) VALUES 
        (1, 'J.K. Rowling', 'Author of the Harry Potter series.', 1), 
        (2, 'George Orwell', 'Author of 1984 and Animal Farm.', 2), 
        (3, 'J.R.R. Tolkien', 'Author of The Lord of the Rings.', 3);
    `);

    console.log("Test authors inserted successfully.");

    // Insert test books with creator_id
    await db.exec(`
      INSERT INTO books (title, author_id, pub_year, genre, creator_id) VALUES
        ('Harry Potter', 1, 1997, 'fantasy', 1),
        ('1984', 2, 1949, 'sci-fi', 2),
        ('The Hobbit', 3, 1937, 'fantasy', 3);
    `);

    console.log("Test books inserted successfully.");
  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    await db.close();
  }
}

setupDatabase();