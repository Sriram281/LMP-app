/*
  # Verify experts table structure and data

  1. Check table structure
  2. Verify sample data insertion
*/

-- Check if experts table exists and has the correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'experts' 
  AND column_name IN (
    'id', 
    'full_name', 
    'email', 
    'phone_number', 
    'expertise_domain', 
    'years_experience', 
    'created_at',
    'profile_photo',
    'gender',
    'date_of_birth',
    'designation',
    'expertise_domains',
    'experience_years',
    'current_organization',
    'linkedin_url',
    'skills'
  )
ORDER BY 
  ordinal_position;

-- Check if sample data was inserted
SELECT 
  COUNT(*) as total_experts,
  COUNT(full_name) as experts_with_names,
  COUNT(email) as experts_with_emails
FROM 
  experts;

-- Show first 3 experts
SELECT 
  id,
  full_name,
  email,
  expertise_domain,
  years_experience,
  created_at
FROM 
  experts 
ORDER BY 
  created_at DESC 
LIMIT 3;