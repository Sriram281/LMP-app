/*
  # Add course_duration field to courses table

  1. Columns
    - course_duration: text field for course duration
*/

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS course_duration TEXT;