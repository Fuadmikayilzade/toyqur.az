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

const fetchUserData = async (
  user: User,
  setRole: (r: AppRole) => void,
  setProfile: (p: AuthContextType["profile"]) => void
) => {
  const [{ data: roles }, { data: prof }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("full_name, phone, avatar_url").eq("user_id", user.id).single(),
  ]);

  // Priority: user_roles table → user_metadata → default "user"
  const dbRole = roles?.[0]?.role as AppRole | undefined;
  const metaRole = user.user_metadata?.role as AppRole | undefined;
  setRole(dbRole ?? metaRole ?? "user");
  setProfile(prof ?? null);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  useEffect(() => {
    // Handle session on mount — this fires after Google OAuth redirect too
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const pendingRole = localStorage.getItem("toyqur_google_role");

        if (pendingRole === "vendor") {
          localStorage.removeItem("toyqur_google_role");

          // Check if user already has a role in user_roles table
          const { data: existing } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          if (!existing || existing.length === 0) {
            // Try inserting into user_roles (may fail if RLS blocks it)
            const { error: insertErr } = await supabase
              .from("user_roles")
              .insert({ user_id: session.user.id, role: "vendor" as AppRole });

            if (insertErr) {
              // Fallback: write to user_metadata — always works for authenticated user
              await supabase.auth.updateUser({
                data: { role: "vendor" },
              });
            }
          }
        }

        await fetchUserData(session.user, setRole, setProfile);
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            await fetchUserData(session.user, setRole, setProfile);
          }
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