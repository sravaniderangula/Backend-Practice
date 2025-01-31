import React, { useState } from "react";

export default function AddBookForm() {
  const [book_id, setBook_id] = useState("");
  const [book_name, setBook_name] = useState("");
  const [price, setPrice] = useState("");
  const [rented_status, setRented_status] = useState("");
  const [customer_name, setCustomer_name] = useState("");

  async function addBookDetails(newData) {
    try {
      const response = await fetch("http://localhost:20304/api/addBook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error("Error while adding the book", response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleAddBook(event) {
    event.preventDefault();

    const registerData = {
      book_id: parseInt(book_id),
      book_name,
      price: parseFloat(price),
      rented_status,
      customer_name,
    };

    const result = await addBookDetails(registerData);
    console.log(result);
  }

  return (
    <div>
      <h3>Add Book</h3>
      <form onSubmit={handleAddBook}>
        <input
          type="number"
          value={book_id}
          placeholder="Enter book ID"
          onChange={(e) => setBook_id(e.target.value)}
          required
        />
        <input
          type="text"
          value={book_name}
          placeholder="Enter book name"
          onChange={(e) => setBook_name(e.target.value)}
          required
        />
        <input
          type="number"
          value={price}
          placeholder="Enter the book price"
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select value={rented_status} onChange={(e) => setRented_status(e.target.value)}>
          <option value="">Rented Status</option>
          <option value="True">True</option>
          <option value="False">False</option>
        </select>
        <input
          type="text"
          value={customer_name}
          placeholder="Enter the customer name"
          onChange={(e) => setCustomer_name(e.target.value)}
          required
        />
        <button type="submit">Register Book</button>
      </form>
    </div>
  );
}
