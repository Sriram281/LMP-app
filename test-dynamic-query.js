// Test script to verify dynamic query generation with OpenRouter AI
async function testDynamicQuery() {
  console.log("Testing dynamic query generation with OpenRouter AI...");
  
  try {
    const response = await fetch('http://localhost:3003/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: "Show me all courses with their instructors" 
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Chatbot response:");
      console.log(data.reply);
    } else {
      console.log("Failed to get chatbot response. Status:", response.status);
    }
  } catch (error) {
    console.error("Error occurred while testing dynamic query:", error);
  }
}

// Test different queries
async function testMultipleQueries() {
  const testQueries = [
    "Show me all courses with their instructors",
    "List all experts and their specialties",
    "How many users are registered in the system?",
    "What are the available course categories?"
  ];
  
  for (const query of testQueries) {
    console.log(`\n--- Testing query: "${query}" ---`);
    try {
      const response = await fetch('http://localhost:3003/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: JSON.stringify({ message: query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response:", data.reply.substring(0, 200) + "...");
      } else {
        console.log("Failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

// Run the tests
testDynamicQuery();
testMultipleQueries();