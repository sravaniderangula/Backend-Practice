import React, { useState } from "react";

export default function UpdateBookForm() {
  const [book_id, setBook_id] = useState("");
  const [book_name, setBook_name] = useState("");
  const [price, setPrice] = useState("");
  const [rented_status, setRented_status] = useState("");
  const [customer_name, setCustomer_name] = useState("");

  async function updateBookDetails(updateData, bookId) {
    try {
      const response = await fetch(`http://localhost:20304/api/updateBook/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Error while updating the book", response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUpdateBook(event) {
    event.preventDefault();

    const updateData = {};
    if (book_name) updateData.book_name = book_name;
    if (price) updateData.price = parseFloat(price);
    if (rented_status) updateData.rented_status = rented_status;
    if (customer_name) updateData.customer_name = customer_name;

    if (book_id) {
      const result = await updateBookDetails(updateData, book_id);
      console.log(result);
    } else {
      console.log("Book ID is required to update a book");
    }
  }

  return (
    <div>
      <h3>Update Book</h3>
      <form onSubmit={handleUpdateBook}>
        <input
          type="number"
          value={book_id}
          placeholder="Enter book ID to update"
          onChange={(e) => setBook_id(e.target.value)}
          required
        />
        <input
          type="text"
          value={book_name}
          placeholder="Enter new book name"
          onChange={(e) => setBook_name(e.target.value)}
        />
        <input
          type="number"
          value={price}
          placeholder="Enter new price"
          onChange={(e) => setPrice(e.target.value)}
        />
        <select value={rented_status} onChange={(e) => setRented_status(e.target.value)}>
          <option value="">Update rented status</option>
          <option value="True">True</option>
          <option value="False">False</option>
        </select>
        <input
          type="text"
          value={customer_name}
          placeholder="Enter new customer name"
          onChange={(e) => setCustomer_name(e.target.value)}
        />
        <button type="submit">Update Book</button>
      </form>
    </div>
  );
}
