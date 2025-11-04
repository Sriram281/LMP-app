import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003; // Changed to 3003 to avoid conflicts

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

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log("Received message:", message);
    
    if (!message) {
      console.log("Error: Message is required");
      return res.status(400).json({ error: "Message is required" });
    }
    
    const lowerMessage = message.toLowerCase();
    console.log("Processing message:", lowerMessage);
    
    let responseText = "";
    
    if (
      lowerMessage.includes("course") &&
      (lowerMessage.includes("available") || lowerMessage.includes("show") || lowerMessage.includes("list"))
    ) {
      // Query courses from Supabase
      console.log("Executing courses query");
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      console.log("Courses query result:", { data, error });
      
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: "Database query failed" });
      }
      
      if (data && data.length > 0) {
        responseText = "Here are the available courses:\n\n";
        data.forEach((course, index) => {
          responseText += `${index + 1}. ${course.title}\n`;
          if (course.description) {
            responseText += `   Description: ${course.description}\n`;
          }
          if (course.course_level) {
            responseText += `   Level: ${course.course_level}\n`;
          }
          responseText += "\n";
        });
      } else {
        responseText = "I couldn't find any available courses.";
      }
    } else if (
      lowerMessage.includes("expert") ||
      lowerMessage.includes("trainer") ||
      lowerMessage.includes("instructor")
    ) {
      // Query experts from Supabase
      console.log("Executing experts query");
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .order("created_at", { ascending: false });
      
      console.log("Experts query result:", { data, error });
      
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: "Database query failed" });
      }
      
      if (data && data.length > 0) {
        responseText = "Here are our experts/trainers:\n\n";
        data.forEach((expert, index) => {
          responseText += `${index + 1}. ${
            expert.full_name || expert.email || "Expert"
          }\n`;
          if (expert.bio) {
            responseText += `   Bio: ${expert.bio}\n`;
          }
          responseText += "\n";
        });
      } else {
        responseText = "I couldn't find any experts/trainers.";
      }
    } else {
      // Fallback response for other queries
      responseText = "I can help you find information about courses and trainers. Try asking questions like 'What courses are available?' or 'Show me the trainers'.";
    }
    
    console.log("Sending response:", responseText);
    res.json({ reply: responseText });
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