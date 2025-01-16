import axios from "axios";
let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;
test("Create, fetch, and delete an author", async () => {
    let author = { id: "1", name: "Author Name", bio: "Author Bio" };
    await axios.post(`${baseUrl}/authors`, author);
    let { data } = await axios.get(`${baseUrl}/authors/1`);
    expect(data).toMatchObject(author);
    let deleteResponse = await axios.delete(`${baseUrl}/authors/1`);
    expect(deleteResponse.data).toEqual({ message: "Author deleted successfully" });
});
