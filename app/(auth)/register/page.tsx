//// filepath: m:\interinest\interinest\app\(auth)\register\page.tsx
"use client";

import React, { FormEvent, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Add: Firebase imports
import { auth, db, storage } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FirebaseError } from "firebase/app";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Project images state
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;
  const MIN_FILES = 2;
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setFileError(null);

    let next = [...projectImages];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_FILES) break;
      if (!f.type.startsWith("image/")) {
        const message = "Only image files are allowed.";
        setFileError(message);
        toast.error(message);
        continue;
      }
      if (f.size > MAX_SIZE) {
        const message = `"${f.name}" exceeds 10 MB.`;
        setFileError(message);
        toast.error(message);
        continue;
      }
      const dup = next.some(
        (e) =>
          e.name === f.name &&
          e.size === f.size &&
          e.lastModified === f.lastModified
      );
      if (!dup) next.push(f);
    }
    setProjectImages(next);
  };

  const removeFile = (idx: number) => {
    setProjectImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload images for this designer and return URLs
  const uploadImages = async (uid: string) => {
    const urls: string[] = [];
    for (const file of projectImages) {
      const path = `designers/${uid}/${crypto.randomUUID()}-${file.name}`;
      const storageRef = ref(storage, path);
      const metadata = { contentType: file.type || "image/*", cacheControl: "public,max-age=3600" };
      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  const getRegistrationErrorMessage = (error: unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/email-already-in-use":
          return "This email is already registered. Try logging in instead.";
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/weak-password":
          return "Password is too weak. Use at least 6 characters.";
        case "auth/operation-not-allowed":
          return "Email/password sign-up is currently disabled.";
        default:
          return "Registration failed. Please try again.";
      }
    }

    return "Registration failed. Please try again.";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFileError(null);
    const form = e.currentTarget;

    try {
      if (projectImages.length < MIN_FILES || projectImages.length > MAX_FILES) {
        const message = "Please upload 2–5 images (max 10 MB each).";
        setFileError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");
      const phone = String(data.get("phone") || "").trim();

      const phoneQuery = query(
        collection(db, "designers"),
        where("phone", "==", phone)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        toast.error("This phone number is already registered.");
        setLoading(false);
        return;
      }

      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Upload images
      const imageUrls = await uploadImages(uid);

      // Prepare Firestore document
      const services = data.getAll("services").map(String);
      const styles = data.getAll("styles").map(String);
      const docData = {
        email,
        fullName: (data.get("fullName") || "") as string,
        phone,
        city: (data.get("city") || "") as string,
        role: "designer",
        experience: (data.get("experience") || "") as string,
        services,
        budgetRange: (data.get("budgetRange") || "") as string,
        portfolio: (data.get("portfolio") || "") as string,
        instagram: (data.get("instagram") || "") as string,
        website: (data.get("website") || "") as string,
        styles,
        leadsPreference: (data.get("leadsPreference") || "") as string,
        notes: (data.get("notes") || "") as string,
        imageUrls,
        createdAt: serverTimestamp(),
      };

      // Save to designers collection with uid
      await setDoc(doc(db, "designers", uid), docData);

      // Auth token + role + uid cookies (3 days)
      const token = await cred.user.getIdToken();
      const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
      const secureFlag = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;
      document.cookie = `role=designer; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;
      document.cookie = `uid=${uid}; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;

      form?.reset();
      setProjectImages([]);
      setFileError(null);
      setLoading(false);
      toast.success("Registration submitted successfully.");
      router.push("/designer-dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error(getRegistrationErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ec]">
      {/* Cover image + logo */}
      <section
        className="relative h-48 w-full overflow-hidden bg-cover bg-center sm:h-56 md:h-64"
        style={{
          backgroundImage:
            "url('/login-jpeg.jpg')", // update path if needed
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/15" />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
             <Link href="/">
                  <Image
                    width={192}
                    height={64}
                    src="/logo-interinest.png"
                    alt="Interinest"
                    className="w-48 h-16 object-contain"
                  />
                </Link>
          </div>

          {/* Hero text */}
          <div className="max-w-xl rounded-2xl bg-black/45 px-4 py-3 text-[#f8f4ec] backdrop-blur-md sm:px-5 sm:py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f8f4ec]/80">
              Designer registration
            </p>
            <h1 className="mt-1 text-lg font-semibold sm:text-xl">
              Join the Interinest designer network
            </h1>
            <p className="mt-1 text-[11px] sm:text-xs text-[#f8f4ec]/85">
              Share a few details about your practice so we can match you with
              the right homeowners and projects.
            </p>
          </div>
        </div>
      </section>

      {/* Form card */}
      <div className="relative -mt-8 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#e2d6c3] bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <header className="mb-6 space-y-1 text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b8c77]">
              Join Interinest
            </p>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Tell us about your design practice
            </h2>
            <p className="text-xs text-slate-500">
              This helps us understand your studio and share relevant client
              leads. You can always update these details later.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-7 text-sm text-slate-900">
            {/* About you */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7593b4]">
                About you
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                    placeholder="you@studio-name.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone Number (WhatsApp preferred) *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City you are based in *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                  />
                </div>
              </div>

        
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                    placeholder="Enter a secure password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Are you a: *</Label>
                  <Select name="role" required>
                    <SelectTrigger className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-xs sm:text-sm">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Interior Designer</SelectItem>
                      <SelectItem value="studio">Design Studio / Firm</SelectItem>
                      <SelectItem value="student">
                        Interior Design Student / Fresher
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Experience & services */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7593b4]">
                Experience & services
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Years of Experience *</Label>
                  <Select name="experience" required>
                    <SelectTrigger className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-xs sm:text-sm">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0–1 years</SelectItem>
                      <SelectItem value="1-3">1–3 years</SelectItem>
                      <SelectItem value="3-5">3–5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Services You Offer *</Label>
                  <div className="space-y-2 rounded-2xl border border-[#e2d6c3] bg-[#fdf9f2] px-4 py-3">
                    {[
                      "Full Home Interior Design",
                      "Kitchen Design",
                      "Living Room / Bedroom Styling",
                      "Commercial / Office Interiors",
                      "Cafe / Restaurant Interiors",
                      "Consultation Only",
                    ].map((opt) => (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="services"
                          value={opt}
                          className="h-3.5 w-3.5 accent-[#7593b4]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Typical Project Budget Range *</Label>
                <Select name="budgetRange" required>
                  <SelectTrigger className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-xs sm:text-sm">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below1">Below ₹1 Lakhs</SelectItem>
                    <SelectItem value="under5">Under ₹5 Lakhs</SelectItem>
                    <SelectItem value="5-10">₹5–10 Lakhs</SelectItem>
                    <SelectItem value="10-20">₹10–20 Lakhs</SelectItem>
                    <SelectItem value="20+">₹20 Lakhs+</SelectItem>
                    <SelectItem value="depends">Depends on project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Online presence */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7593b4]">
                Online presence
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="portfolio">Portfolio Link (if any)</Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    placeholder="Website / Behance / PDF link"
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="@yourstudio"
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website (if any)</Label>
                  <Input
                    id="website"
                    name="website"
                    className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                  />
                </div>
              </div>
            </section>

            {/* Styles & leads */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7593b4]">
                Style & leads
              </h3>

              <div className="space-y-2">
                <Label>Design Styles You Specialize In *</Label>
                <div className="space-y-2 rounded-2xl border border-[#e2d6c3] bg-[#fdf9f2] px-4 py-3">
                  {[
                    "Modern",
                    "Minimalist",
                    "Contemporary",
                    "Traditional",
                    "Industrial",
                    "Budget Homes",
                    "Luxury Spaces",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="styles"
                        value={opt}
                        className="h-3.5 w-3.5 accent-[#7593b4]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Are you open to receiving client leads from Intrinest? *
                </Label>
                <Select name="leadsPreference" required>
                  <SelectTrigger className="h-10 rounded-xl border-[#e2d6c3] bg-[#fdf9f2] text-xs sm:text-sm">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="yes-selectively">
                      Yes, but selectively
                    </SelectItem>
                    <SelectItem value="not-now">Not right now</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Anything you’d like us to know?</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="rounded-2xl border-[#e2d6c3] bg-[#fdf9f2] text-sm focus-visible:ring-[#7593b4]"
                />
              </div>
            </section>

            {/* Project images upload */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7593b4]">
                Project images
              </h3>

              <div className="rounded-2xl border border-[#e2d6c3] bg-[#fdf9f2] p-4">
                <div className="flex items-baseline justify-between">
                  <Label className="text-slate-800">
                    Upload 2–5 Project Images <span className="text-rose-600">*</span>
                  </Label>
                  <span className="text-[11px] text-slate-500">
                    Upload up to 5 supported files: image. Max 10 MB per file.
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {projectImages.map((file, idx) => (
                    <div
                      key={file.name + idx}
                      className="group inline-flex items-center gap-2 rounded-xl border border-[#e2d6c3] bg-white px-3 py-1.5 text-xs shadow-sm"
                    >
                      <span className="inline-block h-4 w-4 rounded-sm bg-[#e7eef6]" />
                      <span className="max-w-[180px] truncate">{file.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeFile(idx)}
                        className="ml-1 rounded-md px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.currentTarget.files);
                      // allow re-selecting the same file(s)
                      e.currentTarget.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={projectImages.length >= MAX_FILES}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e2d6c3] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-[#f3eee6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-block h-4 w-4 rounded-sm bg-[#e7eef6]" />
                    Add file
                  </button>
                  {fileError && (
                    <p className="mt-2 text-xs text-rose-600">{fileError}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Consent */}
            <section className="space-y-3 border-t border-[#efe3d3] pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7593b4]">
                Consent
              </h3>
              <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-0.5 h-3.5 w-3.5 accent-[#7593b4]"
                />
                <span>
                  I confirm that the information shared is accurate and I agree
                  to Intrinest’s onboarding and communication process.
                </span>
              </label>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-slate-500">
                After you submit, our team will review your profile and share
                next steps over email.
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl bg-[#7593b4] px-6 text-xs font-medium text-[#f8f4ec] hover:bg-[#607da0]"
              >
                {loading ? "Submitting…" : "Submit application"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}