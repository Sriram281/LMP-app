/*
  # Add new fields to profiles table

  1. Fields to add:
    - phone_number: Contact phone number
    - industry_type: Type of industry
    - address: Street address
    - city: City
    - state: State
    - country: Country
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS industry_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN profiles.phone_number IS 'Contact phone number';
COMMENT ON COLUMN profiles.industry_type IS 'Type of industry';
COMMENT ON COLUMN profiles.address IS 'Street address';
COMMENT ON COLUMN profiles.city IS 'City';
COMMENT ON COLUMN profiles.state IS 'State';
COMMENT ON COLUMN profiles.country IS 'Country';