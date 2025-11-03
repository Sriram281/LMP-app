/*
  # Add new fields to courses table

  1. Columns
    - subcategory: text field for course subcategory
    - course_level: text field for course difficulty level
    - language: text field for course language
*/

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS course_level TEXT,
ADD COLUMN IF NOT EXISTS language TEXT;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS course_duration TEXT;