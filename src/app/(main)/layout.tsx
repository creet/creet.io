import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import Sidebar from "@/components/Sidebar";
import { getUserProfileWithProjects } from "@/lib/auth/server-auth";

type DashboardLayoutProps = {
  children: ReactNode;
};

const MainLayout = async ({ children }: DashboardLayoutProps) => {
  const result = await getUserProfileWithProjects();

  if (!result?.user) {
    redirect("/login");
  }

  // Check if user needs to complete onboarding (must have at least one project)
  if (!result.projects || result.projects.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="h-screen bg-gray-950 text-gray-50 font-sans overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[16rem_1fr]">
        <Sidebar profile={result.profile} projects={result.projects} user={result.user} />
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-hide px-6 lg:px-8 pt-16 lg:pt-8 pb-0 flex flex-col">{children}</main>
      </div>
      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
};

export default MainLayout;
