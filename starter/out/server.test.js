import axios from "axios";
let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;
describe("Authors API", () => {
    test("POST /authors creates a new author, GET /authors/id returns author, DELETE /authors/id removes author", async () => {
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
        expect(deleteResult.data).toEqual({ message: "Author deleted successfully" });
    });
    test("POST /authors returns 400 for invalid input", async () => {
        var _a;
        try {
            await axios.post(`${baseUrl}/authors`, { bio: "Missing name" });
        }
        catch (error) {
            let err = error;
            expect((_a = err.response) === null || _a === void 0 ? void 0 : _a.status).toBe(400);
        }
    });
});
