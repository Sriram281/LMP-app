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

// Chat endpoint with dynamic query generation
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

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
          Authorization: `Bearer ${
            process.env.OPENROUTER_API_KEY ||
            "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"
          }`,
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
          Authorization: `Bearer ${
            process.env.OPENROUTER_API_KEY ||
            "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"
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free",
          messages: [
            {
              role: "system",
              content: `You are a PostgreSQL expert. Convert user questions into SQL SELECT queries using the provided database schema. Only generate SELECT queries, never INSERT, UPDATE, or DELETE. Always include table names in column references to avoid ambiguity. Here's the relevant database schema:\n\n${filteredSchemaInfo}\n\nGenerate only the SQL query, nothing else. Do not include a semicolon at the end.`,
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

    // Extract the SQL query from the AI response (in case it includes explanations)
    let sqlQuery = generatedQuery;
    const sqlMatch = generatedQuery.match(/SELECT[\s\S]*?[^;]$/i);
    if (sqlMatch) {
      sqlQuery = sqlMatch[0];
    }

    // Remove any trailing semicolons
    sqlQuery = sqlQuery.replace(/;+$/, "");

    // Validate that it's a SELECT query
    if (!sqlQuery.toUpperCase().startsWith("SELECT")) {
      throw new Error("Only SELECT queries are allowed");
    }

    // Execute the generated query using the safe function
    console.log("Step 3: Executing generated query");
    // const { data, error } = await supabase.rpc('execute_safe_query', {
    //   query_text: sqlQuery
    // });

    const { data, error } = await supabase.rpc("execute_safe_query", {
      query_text: "SELECT * FROM profiles",
    });

    console.log("Query execution result:", { data, error });

    if (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }

    // Format the response
    let responseText = "";
    if (data && data.length > 0) {
      responseText = `I found ${data.length} records matching your query:\n\n`;
      // Format the data in a readable way
      if (Array.isArray(data)) {
        data.forEach((record, index) => {
          responseText += `Record ${index + 1}:\n`;
          for (const [key, value] of Object.entries(record)) {
            responseText += `  ${key}: ${value}\n`;
          }
          responseText += "\n";
        });
      } else {
        responseText += JSON.stringify(data, null, 2);
      }
    } else {
      responseText = "I couldn't find any records matching your query.";
    }

    console.log("Sending response to client");
    res.json({
      reply: responseText,
      query: sqlQuery, // Include the generated query in the response
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/chat`);
});
