# LMS Chatbot Integration

This document explains how to set up and use the AI chatbot functionality that can query the Supabase database.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase project (for database functionality)
- An OpenRouter API key (for fallback AI responses)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**: 
   Create a `.env` file in the root directory with the following variables:
   ```
   # Supabase Configuration (required for database queries)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Server Configuration
   PORT=3001

   # OpenRouter API (optional, for fallback AI responses)
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. **Database Function** (Optional for full functionality):
   Run the Supabase migration to create the `execute_safe_query` function:
   ```bash
   supabase migration up
   ```
   
   Or manually execute this SQL in your Supabase SQL editor:
   ```sql
   CREATE OR REPLACE FUNCTION execute_safe_query(query_text TEXT)
   RETURNS JSON
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   DECLARE
       result JSON;
   BEGIN
       -- Check if the query is a SELECT statement
       IF LOWER(TRIM(query_text)) NOT LIKE 'select%' THEN
           RAISE EXCEPTION 'Only SELECT queries are allowed';
       END IF;
       
       -- Execute the query and return results as JSON
       EXECUTE 'SELECT json_agg(t) FROM (' || query_text || ') t' INTO result;
       
       RETURN COALESCE(result, '[]'::JSON);
   END;
   $$;
   ```

## Running the Application

1. **Run the frontend** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Run the backend server** (in another terminal):
   ```bash
   npm run server
   ```
   
   Or directly:
   ```bash
   node server.js
   ```

## How It Works

The chatbot has two modes of operation:

1. **Database Query Mode**: When you ask questions about courses or experts, the chatbot will:
   - Identify the intent of your question
   - Generate an appropriate SQL query
   - Execute the query against the Supabase database
   - Format the results into a readable response

2. **General AI Mode**: For other questions, it falls back to the OpenRouter API.

## Example Queries

Try these example queries with the chatbot:

- "What courses are available?"
- "List all courses"
- "Show me the trainers"
- "Who are the experts?"
- "What programming courses do you have?"

## Security Features

The implementation includes several security measures:
- Only SELECT queries are allowed to prevent data modification
- Database operations use the service role key (server-side only)
- Query validation to prevent injection attacks
- CORS protection for web requests

## API Endpoints

- `POST /chat` - Main chat endpoint
- `GET /health` - Health check endpoint

## Troubleshooting

1. **Server fails to start**: Check that all required environment variables are set in your `.env` file.

2. **Database queries not working**: Ensure the `execute_safe_query` function is created in your Supabase project.

3. **Chatbot not responding**: Make sure both the frontend and backend servers are running.

## Development

To modify the chatbot behavior:
1. Update the query detection logic in `server.js`
2. Modify the response formatting in `server.js`
3. Adjust the frontend integration in `src/components/AIChatbot.tsx`

## Testing

You can test the backend API directly using the provided test script:
```bash
node test-chatbot.js
```

Or using curl:
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What courses are available?"}'
```