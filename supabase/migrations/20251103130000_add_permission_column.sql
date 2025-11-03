/*
  # Add permission column to profiles table

  1. Column to add:
    - permission: Array of strings for module permissions
*/

-- Add permission column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS permission TEXT[];