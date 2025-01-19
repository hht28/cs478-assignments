import axios, { AxiosError } from "axios";

let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;

    test("Creates author, get author, then deletes author", async () => {
        let newAuthor = {
        name: "Jane Doe",
        bio: "An author of modern classics.",
        };

        let { data, status } = await axios.post(`${baseUrl}/authors`, newAuthor);
        expect(status).toBe(201);
        expect(data).toHaveProperty("id");
        expect(data.name).toBe(newAuthor.name);
        expect(data.bio).toBe(newAuthor.bio);

        let authorId = data.id;
        let { data: authorData } = await axios.get(`${baseUrl}/authors/${authorId}`);
        expect(authorData).toEqual(data); 

        let deleteResult = await axios.delete(`${baseUrl}/authors/${authorId}`);
        expect(deleteResult.status).toBe(200);
        expect(deleteResult.data).toEqual({ message: "Author deleted successfully." });

    });
    
    test("POST /authors returns 400 for invalid input", async () => {
      try {
        await axios.post(`${baseUrl}/authors`, { bio: "Missing name" });
      } catch (error) {
        let err = error as AxiosError;
        expect(err.response?.status).toBe(400);
      }
    });

    test("DELETE /authors/:id returns 404 for non-existent author", async () => {
        try {
          await axios.delete(`${baseUrl}/authors/999`);
        } catch (error) {
          let err = error as AxiosError;
          expect(err.response?.status).toBe(404);
        }
      });

      test("DELETE /authors/:id fails for author with books", async () => {
        let newAuthor = { name: "Author with Books", bio: "Writes many books." };
        let authorResponse = await axios.post(`${baseUrl}/authors`, newAuthor);
        let authorId = authorResponse.data.id;
    
        let newBook = {
          author_id: authorId,
          title: "A Book",
          pub_year: "2023",
          genre: "sci-fi",
        };
    
        await axios.post(`${baseUrl}/books`, newBook);
    
        try {
          await axios.delete(`${baseUrl}/authors/${authorId}`);
        } catch (error) {
          let err = error as AxiosError;
          expect(err.response?.status).toBe(400);
        }
      });

    test("GET /books returns all books", async () => {
        let { data, status } = await axios.get(`${baseUrl}/books`);
        expect(status).toBe(200);
        expect(data).toBeInstanceOf(Array);
    });

    test("Create new author, create new book for author, delete book", async () => {
        let newAuthor = { name: "Author with Genre", bio: "Writes in many genres." };
        let authorResponse = await axios.post(`${baseUrl}/authors`, newAuthor);
        let authorId = authorResponse.data.id;
    
        let newBook = {
          author_id: authorId,
          title: "A Valid Genre Book",
          pub_year: "2023",
          genre: "sci-fi",
        };
    
        let { status, data } = await axios.post(`${baseUrl}/books`, newBook);
        expect(status).toBe(201);
        expect(data).toHaveProperty("id");

        let deleteResult = await axios.delete(`${baseUrl}/books/${data.id}`);
        expect(deleteResult.status).toBe(200);
        expect(deleteResult.data).toEqual({ message: "Book deleted successfully." });
      });
    
      test("Fails to create a book with an invalid genre", async () => {
        let newAuthor = { name: "Author with Invalid Genre", bio: "Explores invalid genres." };
        let authorResponse = await axios.post(`${baseUrl}/authors`, newAuthor);
        let authorId = authorResponse.data.id;
    
        let invalidBook = {
          author_id: authorId,
          title: "An Invalid Genre Book",
          pub_year: "2023",
          genre: "horror", // invalid genre
        };
    
        try {
          await axios.post(`${baseUrl}/books`, invalidBook);
        } catch (error) {
          let err = error as AxiosError;
          expect(err.response?.status).toBe(400);
        }
      });

    test("GET /books returns books filtered by genre", async () => {
        let { data: books } = await axios.get(`${baseUrl}/books`);
        let genre = books[0].genre;
    
        let { data: filteredBooks } = await axios.get(`${baseUrl}/books?genre=${genre}`);
        expect(filteredBooks).toEqual(books.filter((book: any) => book.genre === genre));
    });

    test("GET /books returns books filtered by pub_year", async () => {
        let { data: books } = await axios.get(`${baseUrl}/books`);
        let pubYear = books[0].pub_year;
    
        let { data: filteredBooks } = await axios.get(`${baseUrl}/books?pub_year=${pubYear}`);
        expect(filteredBooks).toEqual(books.filter((book: any) => book.pub_year === pubYear));
    });

    test("DELETE /books/:id returns 404 for non-existent book", async () => {
        try {
          await axios.delete(`${baseUrl}/books/999`);
        } catch (error) {
          let err = error as AxiosError;
          expect(err.response?.status).toBe(404);
        }
      });