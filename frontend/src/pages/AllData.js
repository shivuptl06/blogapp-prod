import axios from "axios";
import { useState, useEffect } from "react";

function AllData() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data when the component mounts
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://blogapp-prod-production.up.railway.app/alldata",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setData(response.data); // Set the data received from the server
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Data from Server:</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li> // Render each data item
        ))}
      </ul>
    </div>
  );
}

export default AllData;
