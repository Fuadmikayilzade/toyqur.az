import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const email = "admin@toyqur.az";
  const password = "Admin2026!";

  // Create admin user
  const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "ToyQur Admin", role: "admin" },
  });

  if (signUpError) {
    // If user already exists, just return the info
    if (signUpError.message?.includes("already")) {
      return new Response(JSON.stringify({ message: "Admin artıq mövcuddur", email, password }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: signUpError.message }), { status: 400 });
  }

  // The handle_new_user trigger should set up profile and role automatically
  // But let's ensure admin role is set
  if (userData?.user) {
    await supabase.from("user_roles").upsert({
      user_id: userData.user.id,
      role: "admin",
    }, { onConflict: "user_id,role" });
  }

  return new Response(JSON.stringify({
    message: "Admin yaradıldı!",
    email,
    password,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
