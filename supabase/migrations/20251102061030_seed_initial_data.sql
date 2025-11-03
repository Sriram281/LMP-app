/*
  # Seed initial data for LMS

  1. Data
    - Insert default categories
    - Insert default domains
*/

INSERT INTO categories (name, description) VALUES
  ('Web Development', 'Learn modern web development technologies'),
  ('Data Science', 'Master data analysis and machine learning'),
  ('Mobile Development', 'Build mobile applications for iOS and Android'),
  ('DevOps', 'Learn deployment and infrastructure management'),
  ('UI/UX Design', 'Create beautiful and user-friendly interfaces')
ON CONFLICT DO NOTHING;

INSERT INTO domains (name, description) VALUES
  ('Frontend Development', 'HTML, CSS, JavaScript, React, Vue, Angular'),
  ('Backend Development', 'Node.js, Python, Java, databases'),
  ('Machine Learning', 'AI, neural networks, deep learning'),
  ('Cloud Computing', 'AWS, Azure, Google Cloud'),
  ('Cybersecurity', 'Security best practices and ethical hacking'),
  ('Database Management', 'SQL, NoSQL, data modeling')
ON CONFLICT DO NOTHING;