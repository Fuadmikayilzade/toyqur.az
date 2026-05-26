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

// If localStorage has toyqur_google_role=vendor AND user has no role yet → assign vendor
const applyPendingVendorRole = async (userId: string) => {
  const pendingRole = localStorage.getItem("toyqur_google_role");
  if (pendingRole !== "vendor") return;

  // Check if user already has a role assigned
  const { data: existing } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (!existing || existing.length === 0) {
    // First time — assign vendor role
    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "vendor" as AppRole,
    });
  }

  // Always clear the flag after processing
  localStorage.removeItem("toyqur_google_role");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const fetchUserData = async (userId: string) => {
    const [{ data: roles }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("full_name, phone, avatar_url").eq("user_id", userId).single(),
    ]);
    setRole(roles?.[0]?.role as AppRole ?? "user");
    setProfile(prof ?? null);
  };

  useEffect(() => {
    // On mount: check existing session (handles Google OAuth redirect return)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Apply pending vendor role BEFORE fetching user data
        await applyPendingVendorRole(session.user.id);
        await fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for future auth changes (email login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Also handle SIGNED_IN for non-redirect flows (e.g. email signup then Google later)
          if (event === "SIGNED_IN") {
            await applyPendingVendorRole(session.user.id);
          }
          await fetchUserData(session.user.id);
        } else {
          setRole(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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