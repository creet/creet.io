"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/ui/Logo";
import { Loader2 } from "lucide-react";

// Design system shadows
const shadows = {
  level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
  level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
  level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
};

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.replace("/dashboard");
    };
    checkSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    router.replace("/dashboard");
  };

  const handleGoogle = async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090B] p-6 relative overflow-hidden">
      {/* Ambient glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(60% 40% at 50% 0%, rgba(191, 255, 0, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#18181B] border border-white/[0.08] mb-6"
            style={{ boxShadow: shadows.level2 }}
          >
            <Logo size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome back
          </h1>
          <p className="text-zinc-400 text-sm">
            Sign in to access your testimonial dashboard
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl bg-[#1C1C1F] border border-white/[0.08] p-8"
          style={{ boxShadow: shadows.level3 }}
        >
          {/* Subtle gradient warmth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-2xl" />

          <div className="relative">
            {/* Primary Google Sign In */}
            <button
              onClick={handleGoogle}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-medium transition-all duration-200 mb-6"
              style={{ boxShadow: shadows.level1 }}
              aria-label="Continue with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1C1C1F] px-3 text-zinc-500 font-medium">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-xl"
                  aria-invalid={!!errorMessage && !email}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-xl"
                  aria-invalid={!!errorMessage && !password}
                />
              </div>

              {errorMessage && (
                <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{ boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(191, 255, 0, 0.2)' }}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center mt-8">
          <p className="text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              className="font-semibold text-white hover:text-zinc-300 transition-colors"
              href="/signup"
              aria-label="Go to signup"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
