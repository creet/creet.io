import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server-auth";

export default async function Home() {
  const user = await getUser();

  if (user) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard");
  } else {
    // User is not authenticated, redirect to login
    redirect("/login");
  }
}
