export interface Book {
    id: number;
    title: string;
    author_id: number;
    pub_year: string;
    genre: "adventure" | "sci-fi" | "romance" | "mystery" | "fantasy" | "non-fiction";
  }
  
  export interface Author {
    id: number;
    name: string;
    bio: string;
  }
  