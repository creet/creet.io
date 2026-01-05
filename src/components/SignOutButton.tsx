"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const SignOutButton = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left"
      aria-label="Sign out"
    >
      Sign out
    </button>
  );
};

