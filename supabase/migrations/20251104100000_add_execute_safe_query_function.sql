-- Function to safely execute SELECT queries
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