/*
  # Add helper functions for discussion likes

  1. Functions
    - increment_likes: Increment likes count for a discussion
    - decrement_likes: Decrement likes count for a discussion
*/

CREATE OR REPLACE FUNCTION increment_likes(discussion_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE discussions
  SET likes_count = likes_count + 1
  WHERE id = discussion_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes(discussion_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE discussions
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = discussion_id;
END;
$$ LANGUAGE plpgsql;