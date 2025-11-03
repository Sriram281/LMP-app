/*
  # Recreate experts table with enhanced expert profiles

  1. Columns
    - id: UUID primary key
    - expertise_domain: text field for domain name
    - years_experience: integer for experience
    - created_at: timestamp with timezone
    - full_name: text field for expert's full name
    - email: text field for expert's email
    - phone_number: text field for contact number
    - profile_photo: text field for avatar URL
    - gender: text field for gender
    - date_of_birth: date field for DOB
    - designation: text field for current role
    - expertise_domains: text array for key subject areas
    - experience_years: integer for years of experience
    - current_organization: text field for company
    - linkedin_url: text field for professional link
    - skills: text array for technical skills
*/

-- Drop existing policies and table
DROP POLICY IF EXISTS "Experts are viewable by everyone" ON experts;
ALTER TABLE experts DISABLE ROW LEVEL SECURITY;
DROP TABLE IF EXISTS experts CASCADE;

-- Create new experts table with all fields
CREATE TABLE experts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expertise_domain TEXT,
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  profile_photo TEXT,
  gender TEXT,
  date_of_birth DATE,
  designation TEXT,
  expertise_domains TEXT[],
  experience_years INTEGER DEFAULT 0,
  current_organization TEXT,
  linkedin_url TEXT,
  skills TEXT[]
);

-- Enable RLS
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Experts are viewable by everyone" ON experts
  FOR SELECT USING (true);