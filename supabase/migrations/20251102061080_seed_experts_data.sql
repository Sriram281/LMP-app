/*
  # Seed initial data for experts

  1. Data
    - Insert sample expert profiles
*/

INSERT INTO experts (full_name, email, phone_number, expertise_domain, years_experience, designation, expertise_domains, experience_years, current_organization, linkedin_url, bio, skills, gender, profile_photo) VALUES
  (
    'Sriram K.',
    'sriram@example.com',
    '+91 98765 43210',
    'Full Stack Development',
    5,
    'Full Stack Developer',
    ARRAY['React', 'Node.js', 'Spring Boot'],
    5,
    'Google',
    'https://linkedin.com/in/sriram',
    'Passionate developer and mentor with 5 years of experience in full-stack development. Specialized in React, Node.js, and Spring Boot.',
    ARRAY['React', 'Spring Boot', 'TailwindCSS', 'PostgreSQL', 'Docker'],
    'Male',
    'https://example.com/profile1.jpg'
  ),
  (
    'Jane Smith',
    'jane.smith@example.com',
    '+1 555 123 4567',
    'Data Science',
    3,
    'Data Scientist',
    ARRAY['Python', 'Machine Learning', 'Data Analysis'],
    3,
    'Microsoft',
    'https://linkedin.com/in/janesmith',
    'Data scientist with expertise in machine learning and statistical analysis. Passionate about turning data into actionable insights.',
    ARRAY['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'SQL'],
    'Female',
    'https://example.com/profile2.jpg'
  ),
  (
    'Michael Chen',
    'michael.chen@example.com',
    '+86 138 0013 8000',
    'Mobile Development',
    4,
    'Mobile App Developer',
    ARRAY['React Native', 'Flutter', 'iOS'],
    4,
    'Apple',
    'https://linkedin.com/in/michaelchen',
    'Mobile app developer specializing in cross-platform solutions with React Native and Flutter. Published over 10 apps on App Store and Google Play.',
    ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    'Male',
    'https://example.com/profile3.jpg'
  ),
  (
    'Sarah Johnson',
    'sarah.johnson@example.com',
    '+44 20 7123 4567',
    'DevOps',
    6,
    'DevOps Engineer',
    ARRAY['AWS', 'Docker', 'Kubernetes'],
    6,
    'Amazon',
    'https://linkedin.com/in/sarahjohnson',
    'DevOps engineer with extensive experience in cloud infrastructure and CI/CD pipelines. Certified AWS Solutions Architect.',
    ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI'],
    'Female',
    'https://example.com/profile4.jpg'
  ),
  (
    'David Wilson',
    'david.wilson@example.com',
    '+61 412 345 678',
    'UI/UX Design',
    7,
    'Senior UX Designer',
    ARRAY['UI Design', 'UX Research', 'Prototyping'],
    7,
    'Adobe',
    'https://linkedin.com/in/davidwilson',
    'Senior UX designer with a passion for creating intuitive user experiences. Specializes in user research and design thinking methodologies.',
    ARRAY['Figma', 'Sketch', 'Adobe XD', 'InVision', 'User Research', 'Prototyping'],
    'Male',
    'https://example.com/profile5.jpg'
  )
ON CONFLICT DO NOTHING;