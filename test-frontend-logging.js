// Test script to demonstrate frontend logging
async function testChatbot() {
  console.log("Testing frontend logging for chatbot...");
  
  try {
    console.log("Sending request to chat API...");
    const response = await fetch('http://localhost:3002/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: "What courses are available?" }),
    });
    
    console.log("Received response from server:", response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", JSON.stringify(data, null, 2));
    } else {
      console.log("Request failed with status:", response.status);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

testChatbot();