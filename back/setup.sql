CREATE TABLE books (
    id INTEGER PRIMARY KEY, 
    author_id INTEGER,
    title TEXT,
    pub_year TEXT,
    genre TEXT,
    creator_id INTEGER,
    FOREIGN KEY(author_id) REFERENCES authors(id),
    FOREIGN KEY(creator_id) REFERENCES users(id)
);

CREATE TABLE authors (
    id INTEGER PRIMARY KEY, 
    name TEXT,
    bio TEXT,
    creator_id INTEGER,
    FOREIGN KEY(creator_id) REFERENCES users(id)
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
);
