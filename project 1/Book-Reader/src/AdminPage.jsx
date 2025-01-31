import React, { useState, useEffect } from "react";
import AddBookForm from "./AddBookForm";
import UpdateBookForm from "./UpdateBookForm";
import BuildPage from "./BuildPage";

export default function AdminPage() {
  const [booksData, setBooksData] = useState([]);
  const [fetchTrigger, setFetchTrigger] = useState(false);

  useEffect(() => {
    async function fetchBooks() {
      try {
        console.log("Fetching books...");
        const response = await fetch("http://localhost:20304/api/getBook", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Error while fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched books data:", data);

        if (data.books ) {
          setBooksData(data.books); 
        } else {
          console.log("No books found.");
          setBooksData([]); 
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    if (fetchTrigger) {
      fetchBooks();
      setFetchTrigger(false); 
    }
  }, [fetchTrigger]);

  return (
    <div>
      <h2>Admin Page</h2>

      <AddBookForm />
      <UpdateBookForm />

      <button onClick={() => setFetchTrigger(true)}>Get Books</button>

      <h3>Books Count: {booksData.length}</h3>

      {booksData.length > 0 && <BuildPage key={Math.random()} data={booksData} />}
    </div>
  );
}
