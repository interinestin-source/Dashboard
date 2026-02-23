"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getLoginErrorMessage = (error: unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "Invalid email or password. Please try again.";
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/user-disabled":
          return "This account has been disabled.";
        case "auth/too-many-requests":
          return "Too many failed attempts. Please try again later.";
        default:
          return "Login failed. Please try again.";
      }
    }
    return "Login failed. Please try again.";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    try {
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");

      // Sign in with Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Check which collection the user belongs to
      let userRole: string | null = null;
      let userDoc = null;

      // Check designers collection
      const designerRef = doc(db, "interinestUsers", uid);
      const designerSnap = await getDoc(designerRef);
      if (designerSnap.exists()) {
        userRole = "designer";
        userDoc = designerSnap.data();
      }

      // Check admins collection if not found in designers
      if (!userRole) {
        const adminRef = doc(db, "interinestUsers", uid);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          userRole = "administratorrr";
          userDoc = adminSnap.data();
        }
      }

      // Check users collection if not found in admins
      if (!userRole) {
        const userRef = doc(db, "interinestUsers", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userRole = "user";
          userDoc = userSnap.data();
        }
      }

      // If no role found, user is not registered properly
      if (!userRole) {
        toast.error("Account not found. Please register first.");
        setLoading(false);
        return;
      }

      // Set cookies (3 days)
      const token = await cred.user.getIdToken();
      const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
      const secureFlag = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;
      document.cookie = `role=${userRole}; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;
      document.cookie = `uid=${uid}; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;

      form?.reset();
      toast.success("Login successful!");
      
      // Redirect based on role
      if (userRole === "designer") {
        router.push("/designer-dashboard");
      } else if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "user") {
        router.push("/user-dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(getLoginErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f4ec]">
      {/* Left brand / visual panel with image */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[#e2d6c3] text-[#f8f4ec] lg:flex"
        style={{
          backgroundImage:
            "url('https://cdn.home-designing.com/wp-content/uploads/2020/09/luxury-living-room-3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* stronger dark overlay */}
        <div className="absolute inset-0">
          <div className="h-full w-full bg-black/55" />
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />
          </div>
        </div>

        <header className="relative z-10 flex items-center gap-2 px-10 pt-9">
          {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8f4ec]/95 text-[#607da0] shadow-sm">
            <span className="text-lg font-bold leading-none">in</span>
          </div> */}
          {/* <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-[#f8f4ec]/90">
              INTERINEST
            </p>
            <p className="text-xs text-[#f8f4ec]/80">
              Interior designer workspace
            </p>
          </div> */}
          <Link href="/">
                  <Image
                    width={192}
                    height={64}
                    src="/logo-interinest.png"
                    alt="Interinest"
                    className="w-48 h-16 object-contain"
                  />
                </Link>
        </header>

        {/* text block on dark blurred card */}
        <main className="relative z-10 px-10 pb-16 pt-6">
          <div className="max-w-xl rounded-3xl bg-black/55 p-6 backdrop-blur-md sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f8f4ec]/80">
              DESIGNER LOGIN
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              A calm place to manage
              <br />
              your interior projects.
            </h1>
            <p className="mt-3 text-sm text-[#f8f4ec]/85">
              Organise client briefs, share project updates, and keep your
              studio’s work in one elegant dashboard crafted for interior
              designers.
            </p>

            <div className="mt-6 grid gap-3 text-xs text-[#f8f4ec]/90 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-[11px]">Projects, neatly tracked</p>
                <p className="mt-1 text-sm font-semibold text-[#fefbf7]">
                  Boards for every space
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-[11px]">Client‑ready visuals</p>
                <p className="mt-1 text-sm font-semibold text-[#fefbf7]">
                  Present work beautifully
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-[11px]">Built for studios</p>
                <p className="mt-1 text-sm font-semibold text-[#fefbf7]">
                  Designed with designers
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-10 pb-9 text-[11px] text-[#f8f4ec]/80">
          © {new Date().getFullYear()} Interinest Studio OS
        </footer>
      </div>

      {/* Right login panel (unchanged) */}
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-[#e2d6c3] bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="mb-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b8c77]">
              Welcome back
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Log in to your designer workspace
            </h2>
            <p className="text-xs text-slate-500">
              Use the email you registered with Interinest. New here?{" "}
              <Link
                href="/register"
                className="font-medium text-[#7593b4] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-slate-700">
                Work email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm placeholder:text-slate-400 focus-visible:ring-[#7593b4]"
                placeholder="you@studio-name.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm placeholder:text-slate-400 focus-visible:ring-[#7593b4]"
                placeholder="Enter your password"
              />
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  className="text-[11px] font-medium text-[#7593b4] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-10 w-full rounded-xl bg-[#7593b4] text-xs font-medium tracking-wide text-[#f8f4ec] shadow-sm hover:bg-[#607da0]"
            >
              {loading ? "Signing you in…" : "Continue to Interinest"}
            </Button>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <div className="h-px flex-1 bg-[#e5d9c9]" />
              <span>or</span>
              <div className="h-px flex-1 bg-[#e5d9c9]" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl border-[#e2d6c3] bg-white text-xs font-medium text-slate-700 hover:bg-[#f8f4ec]"
            >
              Don't have an account? <Link href="/register" className="font-medium text-[#7593b4] hover:underline">Register Yourself</Link>
            </Button>
          </form>

          <p className="mt-6 text-[11px] leading-relaxed text-slate-500">
            By continuing, you agree to Interinest&apos;s{" "}
            <Link
              href="#"
              className="font-medium text-[#7593b4] hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="font-medium text-[#7593b4] hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}