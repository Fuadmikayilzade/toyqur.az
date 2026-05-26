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

const resolveRole = async (user: User): Promise<AppRole> => {
  // 1. Check user_roles table first
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (roles && roles.length > 0) {
    return roles[0].role as AppRole;
  }

  // 2. Check user_metadata (set by our vendor flow)
  const metaRole = user.user_metadata?.role as AppRole | undefined;
  if (metaRole) return metaRole;

  return "user";
};

const assignVendorRole = async (userId: string): Promise<void> => {
  // Try inserting into user_roles
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role: "vendor" as AppRole });

  if (error) {
    console.warn("user_roles insert failed, falling back to metadata:", error.message);
    // Fallback: write to user_metadata
    await supabase.auth.updateUser({ data: { role: "vendor" } });
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const loadUser = async (sessionUser: User) => {
    setUser(sessionUser);

    // Check if redirected back from Google with vendor_signup flag in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isVendorSignup = urlParams.get("vendor_signup") === "1";

    if (isVendorSignup) {
      // Clean the URL param immediately
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // Check if user already has a role
      const { data: existing } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sessionUser.id);

      if (!existing || existing.length === 0) {
        await assignVendorRole(sessionUser.id);
        // Re-fetch the user to get updated metadata
        const { data: { user: refreshed } } = await supabase.auth.getUser();
        if (refreshed) setUser(refreshed);
      }
    }

    // Fetch role and profile
    const [resolvedRole, profileResult] = await Promise.all([
      resolveRole(sessionUser),
      supabase.from("profiles").select("full_name, phone, avatar_url").eq("user_id", sessionUser.id).single(),
    ]);

    setRole(resolvedRole);
    setProfile(profileResult.data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await loadUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          await loadUser(session.user);
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