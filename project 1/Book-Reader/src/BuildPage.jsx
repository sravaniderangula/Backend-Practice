export default function BuildPage({ data }) {
  console.log("BuildPage rendered with data:", data);
    return (
      <div>
        {data.length > 0 ? (
          data.map((item, index) => {
            return (
              <div key={index}>
                <h1>Book Id: {item.book_id}</h1>
                <h1>Book Name: {item.book_name}</h1>
                <h1>Price: {item.price}</h1>
                <h1>Rented Status: {item.rented_status}</h1>
                <h1>Customer Name: {item.customer_name}</h1>
              </div>
            );
          })
        ) : (
          <p>No books available</p> 
        )}
      </div>
    );
}
