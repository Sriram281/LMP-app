import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase, Profile, UserRole } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (user: User, fullName: string, role: string) => {
    try {
      // Map 'Client' role to 'student' since that's what the database expects
      const mappedRole: UserRole =
        role === "Client" ? "student" : (role as UserRole);
      console.log(mappedRole, fullName, user.email, user.id);

      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: mappedRole,
        is_active: false, // Default to active for self-signup users
      });

      if (insertError) throw insertError;
      console.log("insertError : ", insertError);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Load profile to check if user is active
    if (data.user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_active")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Check if user is active
        if (profileData && profileData.is_active === false) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          return {
            success: false,
            message:
              "Sorry, You dont have a access to login, please reach your Administrator.",
          };
        }

        // Load full profile if user is active
        await loadProfile(data.user.id);
        return { success: true };
      } catch (profileError) {
        // Sign out on profile error
        await supabase.auth.signOut();
        throw profileError;
      }
    }

    return { success: true };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;

    // Since email confirmation is disabled, create profile immediately
    if (data.user) {
      await createProfile(data.user, fullName, role);
      navigate("/login");
    }

    // Return success message
    return {
      success: true,
      message: "Account created successfully. Please login to continue.",
    };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
