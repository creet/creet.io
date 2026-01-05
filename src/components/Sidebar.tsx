"use client";

import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import ProfileModal from "./ProfileModal";
import ProjectSwitcherModal from "./ProjectSwitcherModal";

const navSections = [
  {
    title: "Testimonials",
    items: [
      { label: "All Testimonials", icon: "star", href: "/dashboard" },
      { label: "Import", icon: "upload", href: "/import" },
    ],
  },
  {
    title: "Collection",
    items: [
      { label: "Forms", icon: "form", href: "/forms" },
      { label: "Brand", icon: "sparkles", href: "/brand" },
    ],
  },
  {
    title: "Display",
    items: [
      { label: "Wall of Love", icon: "heart", href: "/wall-of-love" },
      { label: "Widgets", icon: "widget", href: "/widgets" },
    ],
  },
];

const Icon = ({ name, className }: { name: string; className?: string }) => {
  if (name === "palette") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <path d="M12 21a6 6 0 0 1-3.8-10.4 2 2 0 0 0 .8-2.6A2 2 0 0 1 11 4a2 2 0 0 1 2-2 10 10 0 0 1 10 10c0 5-2 9-9 9z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="12" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="16.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="12" cy="15" r=".5" fill="currentColor" />
      </svg>
    )
  }
  if (name === "sparkles") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="none" stroke="none" />
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === "star") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <path d="M12 3l2.9 5.88 6.5.95-4.7 4.57 1.1 6.45L12 18.6 6.2 21.85l1.1-6.45L2.6 9.83l6.5-.95L12 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "upload") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    );
  }
  if (name === "form") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 13H8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 17H8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 9H8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    );
  }
  if (name === "widget") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <rect x="3" y="3" width="8" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="3" width="8" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="13" width="8" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="13" width="8" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "video") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <rect x="3" y="5" width="14" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M17 9l4-2v10l-4-2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "gear") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm9.4 4a7.4 7.4 0 0 0-.2-1.6l2-1.5-2-3.5-2.3 1a7.7 7.7 0 0 0-2.7-1.6l-.3-2.5H10l-.3 2.5a7.7 7.7 0 0 0-2.7 1.6l-2.3-1-2 3.5 2 1.5A7.4 7.4 0 0 0 2.6 12c0 .54.07 1.07.2 1.6l-2 1.5 2 3.5 2.3-1a7.7 7.7 0 0 0 2.7 1.6l.3 2.5h4.8l.3-2.5a7.7 7.7 0 0 0 2.7-1.6l2.3 1 2-3.5-2-1.5c.13-.52.2-1.05.2-1.6z" fill="currentColor" /></svg>
    );
  }
  if (name === "chevron-down") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    );
  }
  if (name === "chevrons-vertical") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className}>
        <path d="M7 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 15l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
};

type ProfileSummary = {
  id: string;
  username?: string | null;
  full_name: string | null;
  plan: string | null;
  active_project_id: string | null;
  avatar_url?: string | null;
} | null;

type ProjectSummary = {
  id: string;
  name: string | null;
  brand_settings?: any;
};

type SidebarProps = {
  user: User;
  profile: ProfileSummary;
  projects: ProjectSummary[];
};

const getInitials = (value: string) => {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("")
    .slice(0, 2);
};

const formatProjectName = (project: ProjectSummary | undefined) => {
  if (!project) {
    return "No Project";
  }

  return project.name?.trim() || "Untitled Project";
};

const formatPlanLabel = (plan: string | null | undefined) => {
  if (!plan) {
    return "hacker";
  }

  return plan.toLowerCase();
};

const Sidebar = ({ user, profile, projects }: SidebarProps) => {
  const pathname = usePathname();

  const displayName = useMemo(() => {
    if (profile?.full_name?.trim()) {
      return profile.full_name.trim();
    }

    if (user.user_metadata?.full_name) {
      return String(user.user_metadata.full_name).trim();
    }

    if (profile?.username?.trim()) {
      return profile.username.trim();
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "New User";
  }, [profile?.full_name, profile?.username, user.email, user.user_metadata?.full_name]);

  const emailAddress = user.email ?? "";

  const activeProject = useMemo(() => {
    if (!projects.length) {
      return undefined;
    }

    if (profile?.active_project_id) {
      const matched = projects.find((project) => project.id === profile.active_project_id);
      if (matched) {
        return matched;
      }
    }

    return projects[0];
  }, [profile?.active_project_id, projects]);

  const otherProjects = useMemo(() => {
    return projects.filter((project) => project.id !== activeProject?.id);
  }, [activeProject?.id, projects]);

  const projectInitials = getInitials(formatProjectName(activeProject));
  const userInitials = getInitials(displayName);
  const planLabel = formatPlanLabel(profile?.plan);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isPaidPlan = planLabel !== 'hacker' && planLabel !== 'free';

  const UpgradeCard = () => {
    // Don't show upgrade card if user is already on a paid plan
    if (isPaidPlan) {
      return null;
    }

    return (
      <div className="mb-6 px-1">
        <Link href="/pricing" className="group block">
          <div className="flex items-center justify-between rounded-lg border border-[#BFFF00]/20 bg-[#BFFF00]/5 p-2.5 transition-colors hover:bg-[#BFFF00]/10 hover:border-[#BFFF00]/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#BFFF00]/20 text-[#BFFF00]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-200 group-hover:text-white">Upgrade to Pro</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3 text-[#BFFF00]/70 group-hover:translate-x-0.5 transition-transform group-hover:text-[#BFFF00]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F0F11]/95 backdrop-blur-sm border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-bold text-white text-lg">Creet</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        aria-label="Mobile navigation"
        className={`lg:hidden fixed top-0 left-0 h-full w-72 z-50 bg-[#0F0F11] border-r border-white/[0.04] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col pt-16">
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            aria-label="Close menu"
          >
            <svg className="size-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            {/* Project Selector */}
            <button
              onClick={() => {
                setIsProjectModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between rounded-xl p-3 mb-6 bg-[#18181B] border border-white/[0.06] hover:bg-zinc-800 hover:border-white/[0.08] transition-all group"
            >
              <div className="flex items-center gap-3">
                {activeProject?.brand_settings?.logoUrl ? (
                  <div className="size-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={activeProject.brand_settings.logoUrl}
                      alt={formatProjectName(activeProject)}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="size-8 rounded-lg bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-white text-sm font-bold">
                    {projectInitials}
                  </div>
                )}
                <span className="text-white font-medium truncate max-w-[140px]">{formatProjectName(activeProject)}</span>
              </div>
              <ChevronsUpDown className="size-4 text-gray-500" />
            </button>

            {/* Mobile Upgrade Banner */}
            <UpgradeCard />

            {/* Nav Sections */}
            {navSections.map((section) => (
              <div key={section.title} className="mb-6">
                <span className="block px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {section.title}
                </span>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                          ? "bg-white/[0.06] text-white"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                      >
                        <Icon name={item.icon} className="size-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}


          </div>

          {/* User Profile */}
          <div className="flex-shrink-0 p-4 border-t border-white/[0.04]">
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Avatar className="size-9 border-2 border-zinc-700">
                <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined} alt={displayName} />
                <AvatarFallback className="bg-zinc-800 text-white text-sm font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        aria-label="Primary navigation"
        className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex-col bg-[#0F0F11] border-r border-white/[0.04]"
      >
        <div className="flex h-full flex-col">
          {/* 1. Creet Logo Section - Top */}
          <div className="flex-shrink-0 p-6">
            <div className="flex items-center gap-3">
              <div className="size-9 flex items-center justify-center">
                <Logo size={36} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Creet</h1>
              </div>
            </div>
          </div>

          {/* 2. Navigation & Project Section - Middle (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
            {/* Project Selector */}
            {/* Project Selector - Switcher */}
            <div className="mb-8">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="w-full flex items-center justify-between rounded-xl p-3 mb-6 bg-[#18181B] border border-white/[0.06] hover:bg-zinc-800 hover:border-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {activeProject?.brand_settings?.logoUrl ? (
                    <div className="size-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={activeProject.brand_settings.logoUrl}
                        alt={formatProjectName(activeProject)}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="size-8 rounded-lg bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {projectInitials}
                    </div>
                  )}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-semibold text-white truncate w-full text-left">
                      {formatProjectName(activeProject)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {planLabel} Plan
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="size-4 text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0" />
              </button>
            </div>

            {/* Upgrade Banner */}
            <UpgradeCard />

            {/* Navigation Links */}
            <nav className="space-y-8" role="navigation">
              {navSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title && (
                    <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const href = item.href || "#";
                      const isActive = item.href ? pathname === item.href : false;
                      return (
                        <Link
                          key={item.label}
                          href={href}
                          aria-current={isActive ? "page" : undefined}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isActive
                            ? "bg-white/[0.06] text-white"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                            }`}
                        >
                          <Icon
                            name={item.icon}
                            className={`size-4 transition-colors ${isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                              }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div >

          {/* 3. User Profile Section - Bottom */}
          <div className="flex-shrink-0 p-6 pt-4 border-t border-white/[0.04]">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="group w-full flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <Avatar className="size-9 ring-2 ring-zinc-700 group-hover:ring-zinc-600 transition-all">
                <AvatarImage alt={displayName} src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || ""} />
                <AvatarFallback className="bg-zinc-800 text-sm font-semibold text-zinc-200">
                  {userInitials || "PG"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-gray-50" title={displayName}>
                  {displayName}
                </p>
                <p className="truncate text-xs text-gray-400" title={emailAddress}>
                  {emailAddress || "No email"}
                </p>
              </div>
              <div className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-all ${planLabel === 'hacker' || planLabel === 'free'
                  ? 'border border-white/[0.08] bg-white/[0.04] text-zinc-400'
                  : planLabel === 'lifetime'
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border border-[#BFFF00]/20 bg-[#BFFF00]/10 text-[#BFFF00]'
                }`}>
                {planLabel}
              </div>
            </button>
          </div>
        </div>
      </aside>

      <ProjectSwitcherModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        activeProjectId={activeProject?.id ?? null}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        profile={profile}
      />
    </>
  );
};

export default Sidebar;


