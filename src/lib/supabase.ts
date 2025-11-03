import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'instructor' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Domain {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Expert {
  id: string;
  expertise_domain?: string;
  years_experience: number;
  created_at: string;
  profile?: Profile;
  domain?: Domain;
  bio?: string;
  
  // New fields for enhanced expert profile
  full_name?: string;
  email?: string;
  phone_number?: string;
  profile_photo?: string;
  gender?: string;
  date_of_birth?: string;
  designation?: string;
  expertise_domains?: string[];
  experience_years?: number;
  current_organization?: string;
  linkedin_url?: string;
  skills?: string[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  instructor_id?: string;
  category?: string;
  domain?: string; // Added domain field
  subcategory?: string;
  course_level?: string;
  language?: string;
  course_duration?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  instructor?: Profile;
  enrollments_count?: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  user?: Profile;
  course?: Course;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author_id: string;
  course_id?: string;
  created_at: string;
  likes_count: number;
  author?: Profile;
  course?: Course;
  replies_count?: number;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  content: string;
  author_id: string;
  created_at: string;
  author?: Profile;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_url?: string;
  user?: Profile;
  course?: Course;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  email_notifications: boolean;
}
