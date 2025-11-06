import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import tableSchemas from "./src/lib/dbSchemas.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client with service role key for full database access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("Health check endpoint called");
  res.json({ status: "OK", message: "Chatbot server is running" });
});

// Helper function to format data for display
function formatDataForDisplay(data, query) {
  if (!data || data.length === 0) {
    return "No data found matching your query.";
  }

  let response = "";
  const recordCount = data.length;

  // For count queries, show the count directly
  if (
    query.toLowerCase().includes("count(") ||
    query.toLowerCase().includes("count (*)")
  ) {
    const count =
      data[0]?.count ||
      data[0]?.user_count ||
      data[0]?.total_count ||
      recordCount;
    return `I found ${count} records matching your criteria.`;
  }

  // For aggregate queries, show the results
  if (query.toLowerCase().match(/sum\(|avg\(|min\(|max\(|group by/i)) {
    response = `Query Results:\n\n`;
    data.forEach((record, index) => {
      response += `Result ${index + 1}:\n`;
      Object.entries(record).forEach(([key, value]) => {
        response += `  ${key}: ${value}\n`;
      });
      response += "\n";
    });
    return response;
  }

  // For regular data queries
  response = `I found ${recordCount} record${recordCount > 1 ? "s" : ""}:\n\n`;

  // If there are too many records, show a summary
  if (recordCount > 10) {
    response += `Showing first 10 of ${recordCount} records:\n\n`;
    data = data.slice(0, 10);
  }

  data.forEach((record, index) => {
    response += `Record ${index + 1}:\n`;
    Object.entries(record).forEach(([key, value]) => {
      // Format the value for better readability
      let displayValue = value;
      if (value === null) displayValue = "NULL";
      if (value === undefined) displayValue = "N/A";
      if (typeof value === "boolean") displayValue = value ? "Yes" : "No";
      if (value instanceof Date) displayValue = value.toLocaleString();

      response += `  ${key}: ${displayValue}\n`;
    });
    response += "\n";
  });

  if (recordCount > 10) {
    response += `... and ${recordCount - 10} more records.`;
  }

  return response;
}

const GenericResponse = async (message) => {
  console.log("Message : ", message);
  if (message) {
    console.log("No records found. Generating AI fallback response.");

    // Define the secondary AI logic
    const aiFallbackResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VITE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free", // or "minimax/minimax-m2:free" if you prefer same model
          messages: [
            {
              role: "system",
              content: `
You are a helpful, polite AI assistant for a Learning Management or Database Chatbot.

Task:
- If the user's message sounds **generic or conversational** (like "hi", "hello", "good morning", "how are you"), respond with a **friendly greeting** or short polite reply.
- If the user's message sounds like a **question or search request** (like "show me", "find", "what is", "how many", "list all", etc.), respond with a **polite clarification question** — for example:
  "Could you please tell me what exactly you would like to search for?"
  or
  "Can you clarify what kind of data or details you want me to find?"

Tone:
- Always stay polite, professional, and friendly.
- Keep responses short and natural.
`,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    if (!aiFallbackResponse.ok) {
      throw new Error(
        `OpenRouter fallback API failed with status ${aiFallbackResponse.status}`
      );
    }

    const aiFallbackData = await aiFallbackResponse.json();
    const fallbackReply =
      aiFallbackData.choices[0]?.message?.content?.trim() ||
      "I'm here to help! Could you please clarify what you’re looking for?";

    console.log("AI Fallback Reply:", fallbackReply);

    // Wrap response in basic HTML for alignment
    const formattedReply = `
      <div style="
        font-family: Arial, sans-serif;
        font-size: 15px;
        color: #222;
        line-height: 1.6;
        background-color: #f9f9f9;
        padding: 10px 14px;
        border-radius: 8px;
        max-width: 600px;
        margin: 10px auto;
      ">
        ${fallbackReply?.replace(/\n/g, "<br/>")}
      </div>
    `;

    return formattedReply;
  }
};
let inputText = "";
// Chat endpoint with dynamic query generation
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    inputText = message;

    console.log("Received message:", message);

    if (!message) {
      console.log("Error: Message is required");
      return res.status(400).json({ error: "Message is required" });
    }

    // Always use dynamic query generation for all messages
    console.log("Generating dynamic SQL query with OpenRouter AI");

    // Prepare schema information for the AI
    let schemaInfo = "Available tables and their schemas:\n";
    for (const [tableName, columns] of Object.entries(tableSchemas)) {
      schemaInfo += `\nTable: ${tableName}\n`;
      columns.forEach((column) => {
        schemaInfo += `  - ${column.column_name} (${column.data_type})${
          column.is_nullable === "NO" ? " NOT NULL" : ""
        }${column.column_default ? ` DEFAULT ${column.column_default}` : ""}\n`;
      });
    }

    // First, ask AI to determine which tables are relevant to the query
    console.log("Step 1: Identifying relevant tables for the query");
    const tableSelectionResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VITE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free",
          messages: [
            {
              role: "system",
              content: `You are a database expert. Based on the user's question and the available database schema, identify which tables are relevant to answer the question. Return only the table names as a comma-separated list. Here's the database schema:\n\n${schemaInfo}`,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    if (!tableSelectionResponse.ok) {
      throw new Error(
        `OpenRouter API request failed with status ${tableSelectionResponse.status}`
      );
    }

    const tableSelectionData = await tableSelectionResponse.json();
    const relevantTablesResponse =
      tableSelectionData.choices[0]?.message?.content?.trim() || "";

    // Parse the relevant tables
    const relevantTables = relevantTablesResponse
      .split(",")
      .map((table) => table.trim())
      .filter((table) => table.length > 0);

    console.log("Relevant tables identified:", relevantTables);

    // Create a filtered schema with only relevant tables
    let filteredSchemaInfo = "Relevant tables and their schemas:\n";
    if (relevantTables.length > 0) {
      relevantTables.forEach((tableName) => {
        if (tableSchemas[tableName]) {
          filteredSchemaInfo += `\nTable: ${tableName}\n`;
          tableSchemas[tableName].forEach((column) => {
            filteredSchemaInfo += `  - ${column.column_name} (${
              column.data_type
            })${column.is_nullable === "NO" ? " NOT NULL" : ""}${
              column.column_default ? ` DEFAULT ${column.column_default}` : ""
            }\n`;
          });
        }
      });
    } else {
      // If no tables were identified, use all schemas
      filteredSchemaInfo = schemaInfo;
    }

    // Call OpenRouter AI to generate SQL query
    console.log("Step 2: Generating SQL query with filtered schema");
    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VITE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free",
          messages: [
            {
              role: "system",
              content: `You are a PostgreSQL expert. Convert user questions into SQL SELECT queries using the provided database schema. 

IMPORTANT INSTRUCTIONS:
- Generate only SELECT queries (no INSERT, UPDATE, DELETE)
- You can use: JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, UNION, aggregate functions
- Always use table aliases for clarity in JOIN queries
- Include only necessary columns in SELECT
- Use proper WHERE conditions based on the user question
- For counting records, use COUNT(*) with appropriate grouping
- For data analysis, use appropriate aggregate functions
- Format dates properly if needed
- Handle NULL values appropriately

Database schema:\n\n${filteredSchemaInfo}

Return ONLY the SQL query without any explanations or markdown formatting. Do not include a semicolon at the end.`,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(
        `OpenRouter API request failed with status ${aiResponse.status}`
      );
    }

    const aiData = await aiResponse.json();
    const generatedQuery = aiData.choices[0]?.message?.content?.trim() || "";

    console.log("AI Generated Query:", generatedQuery);

    // Extract the SQL query from the AI response
    let sqlQuery = generatedQuery;
    const sqlMatch = generatedQuery.match(/SELECT[\s\S]*/i);
    if (sqlMatch) {
      sqlQuery = sqlMatch[0];
    }

    // Remove any trailing semicolons or non-SQL text
    sqlQuery = sqlQuery.replace(/;+$/, "").split(";")[0].trim();

    // Validate that it's a SELECT query
    if (!sqlQuery.toUpperCase().startsWith("SELECT")) {
      throw new Error("Only SELECT queries are allowed");
    }

    // Execute the generated query using the safe function
    console.log("Step 3: Executing generated query:", sqlQuery);
    const { data, error } = await supabase.rpc("execute_safe_query", {
      query_text: sqlQuery,
    });

    console.log(
      "Query execution result - Data length:",
      data?.length,
      "Error:",
      error
    );

    if (error || (data && data?.length === 0)) {
      console.error("Database query error:", error);

      // If no data is found, ask OpenRouter AI to handle generic or question-like messages

      const responseText = await GenericResponse(message);

      console.log("responseText if bock : ", responseText);

      res.json({
        reply: responseText,
        query: null,
        data: null, // Include raw data for frontend processing if needed
        recordCount: data?.length || 0,
      });

      // Try to provide a more helpful error message
      //   let errorMessage = "Database query failed";
      //   if (
      //     error.message.includes(
      //       "function execute_safe_query(text) does not exist"
      //     )
      //   ) {
      //     errorMessage =
      //       "Database function not configured. Please contact administrator.";
      //   } else if (
      //     error.message.includes("relation") &&
      //     error.message.includes("does not exist")
      //   ) {
      //     errorMessage = "Table not found in database.";
      //   } else if (
      //     error.message.includes("column") &&
      //     error.message.includes("does not exist")
      //   ) {
      //     errorMessage = "Column not found in table.";
      //   }

      //   return res.status(500).json({
      //     error: errorMessage,
      //     details: error.message,
      //   });
    } else {
      const responseText = formatDataForDisplay(data, sqlQuery);

      console.log("responseText 1 : ", responseText);
      console.log("Sending response to client");
      res.json({
        reply: responseText,
        query: sqlQuery,
        data: data, // Include raw data for frontend processing if needed
        recordCount: data?.length || 0,
      });
    }

    // Format the response based on query type and data
  } catch (error) {
    // console.error("Chat API error:", error);
    // res.status(500).json({
    //   error: "An error occurred while processing your request",
    //   details: error.message,
    // });

    console.log("inputText : ", inputText);

    const responseText = await GenericResponse(inputText);

    console.log("responseText 2 : ", responseText);
    res.json({
      reply: responseText,
      query: "",
      data: [], // Include raw data for frontend processing if needed
      recordCount: 0,
    });

    if (responseText && responseText) {
      const storedConversations =
        JSON.parse(localStorage.getItem("failedConversations")) || [];

        console.log("")
      const newConversation = {
        prevPrompt: inputText,
        previousReply: responseText,
      };

      storedConversations.push(newConversation);
      localStorage.setItem(
        "failedConversations",
        JSON.stringify(storedConversations)
      );

      console.log("Stored failed conversation:", newConversation);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/chat`);
});
