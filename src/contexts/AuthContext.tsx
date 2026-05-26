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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const loadUserData = async (sessionUser: User, assignVendor = false) => {
    setUser(sessionUser);

    if (assignVendor) {
      // Use SECURITY DEFINER RPC function — bypasses RLS
      const { error } = await supabase.rpc("assign_vendor_role", {
        p_user_id: sessionUser.id,
      });
      if (error) console.error("assign_vendor_role error:", error.message);
      // Clear URL param
      window.history.replaceState({}, "", window.location.origin);
    }

    const [dbRole, profResult] = await Promise.all([
      getDbRole(sessionUser.id),
      supabase.from("profiles").select("full_name, phone, avatar_url").eq("user_id", sessionUser.id).single(),
    ]);

    setRole(dbRole ?? "user");
    setProfile(profResult.data ?? null);
  };

  useEffect(() => {
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
          const params = new URLSearchParams(window.location.search);
          const vendorParam = params.get("google_vendor") === "1";
          if (event === "SIGNED_IN") {
            await loadUserData(session.user, vendorParam);
          } else {
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