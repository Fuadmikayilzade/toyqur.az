import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  profile: { full_name: string | null; phone: string | null; avatar_url: string | null } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  profile: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const getDbRole = async (userId: string): Promise<AppRole | null> => {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data?.[0]?.role as AppRole) ?? null;
};

const fetchProfile = async (userId: string) => {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("user_id", userId)
    .single();
  return data;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const loadUserData = async (sessionUser: User, isNewGoogleVendor = false) => {
    setUser(sessionUser);

    // If this is a Google vendor signup, assign vendor role now
    if (isNewGoogleVendor) {
      const existing = await getDbRole(sessionUser.id);
      if (!existing) {
        // Insert vendor role directly
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: sessionUser.id, role: "vendor" as AppRole });

        if (error) {
          console.error("Failed to insert vendor role:", error.message);
        }
      }
      // Clean URL
      window.history.replaceState({}, "", window.location.origin);
    }

    const [dbRole, prof] = await Promise.all([
      getDbRole(sessionUser.id),
      fetchProfile(sessionUser.id),
    ]);

    setRole(dbRole ?? "user");
    setProfile(prof ?? null);
  };

  useEffect(() => {
    // Check if returning from Google OAuth with vendor intent
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleVendor = urlParams.get("google_vendor") === "1";

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user, isGoogleVendor);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          if (event === "SIGNED_IN") {
            // Check URL param again for cases where onAuthStateChange fires first
            const params = new URLSearchParams(window.location.search);
            const vendorParam = params.get("google_vendor") === "1";
            await loadUserData(session.user, vendorParam);
          } else if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
            await loadUserData(session.user, false);
          }
        } else if (!session) {
          setUser(null);
          setRole(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};