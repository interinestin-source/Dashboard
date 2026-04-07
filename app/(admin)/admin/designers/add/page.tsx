"use client";

import { FormEvent, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Header } from "@/components/admin/Header";
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

const PROFILE_ROLE_OPTIONS = [
  { label: "Solo Interior Designer", value: "solo" },
  { label: "Design Studio / Firm", value: "studio" },
  { label: "Interior Design Student / Fresher", value: "student" },
];

const SERVICE_OPTIONS = [
  "Full Home Interior Design",
  "Kitchen Design",
  "Living Room / Bedroom Styling",
  "Commercial / Office Interiors",
  "Cafe / Restaurant Interiors",
  "Consultation Only",
];

const STYLE_OPTIONS = [
  "Modern",
  "Minimalist",
  "Contemporary",
  "Traditional",
  "Industrial",
  "Budget Homes",
  "Luxury Spaces",
];

const BUDGET_OPTIONS = [
  { label: "Below ₹1 Lakhs", value: "below1" },
  { label: "Under ₹5 Lakhs", value: "under5" },
  { label: "₹5–10 Lakhs", value: "5-10" },
  { label: "₹10–20 Lakhs", value: "10-20" },
  { label: "₹20 Lakhs+", value: "20+" },
  { label: "Depends on project", value: "depends" },
];

const LEAD_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "Yes, but selectively", value: "yes-selectively" },
  { label: "Not right now", value: "not-now" },
];

const INPUT_CLASSES =
  "h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-slate-400";
const SELECT_CLASSES =
  "h-10 rounded-xl border-slate-200 bg-slate-50 text-xs sm:text-sm";
const CARD_CLASSES =
  "mx-auto mt-6 max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";

export default function AddDesignerPage() {
  const [loading, setLoading] = useState(false);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const MAX_FILES = 5;
  const MIN_FILES = 2;
  const MAX_SIZE = 10 * 1024 * 1024;

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    setFileError(null);
    const nextFiles = [...projectImages];

    for (const file of Array.from(files)) {
      if (nextFiles.length >= MAX_FILES) break;
      if (!file.type.startsWith("image/")) {
        const message = "Only image files are allowed.";
        setFileError(message);
        toast.error(message);
        continue;
      }
      if (file.size > MAX_SIZE) {
        const message = `"${file.name}" exceeds 10 MB.`;
        setFileError(message);
        toast.error(message);
        continue;
      }

      const duplicate = nextFiles.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (!duplicate) {
        nextFiles.push(file);
      }
    }

    setProjectImages(nextFiles);
  };

  const removeFile = (index: number) => {
    setProjectImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  };

  const uploadImages = async (uid: string) => {
    const imageUrls: string[] = [];
    for (const file of projectImages) {
      const path = `designers/${uid}/${crypto.randomUUID()}-${file.name}`;
      const storageRef = ref(storage, path);
      const metadata = {
        contentType: file.type || "image/*",
        cacheControl: "public,max-age=3600",
      };
      await uploadBytes(storageRef, file, metadata);
      imageUrls.push(await getDownloadURL(storageRef));
    }
    return imageUrls;
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFileError(null);

    try {
      if (projectImages.length < MIN_FILES || projectImages.length > MAX_FILES) {
        const message = "Please upload 2–5 images (max 10 MB each).";
        setFileError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      const phone = String(formData.get("phone") || "").trim();

      const phoneQuery = query(
        collection(db, "interinestUsers"),
        where("phone", "==", phone)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        toast.error("This phone number is already registered.");
        setLoading(false);
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const imageUrls = await uploadImages(uid);
      const services = formData.getAll("services").map(String);
      const styles = formData.getAll("styles").map(String);

      await setDoc(doc(db, "interinestUsers", uid), {
        email,
        fullName: String(formData.get("fullName") || ""),
        phone,
        city: String(formData.get("city") || ""),
        role: "designer",
        profileRole: String(formData.get("role") || ""),
        experience: String(formData.get("experience") || ""),
        services,
        budgetRange: String(formData.get("budgetRange") || ""),
        portfolio: String(formData.get("portfolio") || ""),
        instagram: String(formData.get("instagram") || ""),
        website: String(formData.get("website") || ""),
        styles,
        leadsPreference: String(formData.get("leadsPreference") || ""),
        notes: String(formData.get("notes") || ""),
        imageUrls,
        createdAt: serverTimestamp(),
      });

      event.currentTarget.reset();
      setProjectImages([]);
      setLoading(false);
      toast.success("Designer added successfully.");
      router.push("/admin/designers");
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error(getRegistrationErrorMessage(error));
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: "Designers", href: "/admin/designers" },
    { label: "Add Designer" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header pageTitle="Add Designer" breadcrumbs={breadcrumbs} />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Add Designer</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a designer account using the same registration fields and save it to Firebase.
            </p>
          </div>
          <Link
            href="/admin/designers"
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to designers
          </Link>
        </div>

        <div className={CARD_CLASSES}>
          <form onSubmit={handleSubmit} className="space-y-7 text-sm text-slate-900">
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                About the designer
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={INPUT_CLASSES}
                    placeholder="you@studio-name.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" required className={INPUT_CLASSES} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number (WhatsApp preferred) *</Label>
                  <Input id="phone" name="phone" required className={INPUT_CLASSES} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City you are based in *</Label>
                  <Input id="city" name="city" required className={INPUT_CLASSES} />
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
                    className={INPUT_CLASSES}
                    placeholder="Enter a secure password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Are you a: *</Label>
                  <Select name="role" required>
                    <SelectTrigger className={SELECT_CLASSES}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFILE_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Experience & services
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Years of Experience *</Label>
                  <Select name="experience" required>
                    <SelectTrigger className={SELECT_CLASSES}>
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
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    {SERVICE_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="services"
                          value={option}
                          className="h-3.5 w-3.5 accent-slate-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Typical Project Budget Range *</Label>
                <Select name="budgetRange" required>
                  <SelectTrigger className={SELECT_CLASSES}>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Online presence
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="portfolio">Portfolio Link (if any)</Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    placeholder="Website / Behance / PDF link"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="@yourstudio"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website (if any)</Label>
                  <Input id="website" name="website" className={INPUT_CLASSES} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Style & leads
              </h3>
              <div className="space-y-2">
                <Label>Design Styles You Specialize In *</Label>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {STYLE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="styles"
                        value={option}
                        className="h-3.5 w-3.5 accent-slate-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Are you open to receiving client leads from Intrinest? *</Label>
                <Select name="leadsPreference" required>
                  <SelectTrigger className={SELECT_CLASSES}>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Anything you’d like us to know?</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="rounded-2xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-slate-400"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Project images
              </h3>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                      className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm"
                    >
                      <span className="inline-block h-4 w-4 rounded-sm bg-slate-200" />
                      <span className="max-w-45 truncate">{file.name}</span>
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
                    onChange={handleFileInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={projectImages.length >= MAX_FILES}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-block h-4 w-4 rounded-sm bg-slate-200" />
                    Add file
                  </button>
                  {fileError && (
                    <p className="mt-2 text-xs text-rose-600">{fileError}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Consent
              </h3>
              <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-0.5 h-3.5 w-3.5 accent-slate-600"
                />
                <span>
                  I confirm that the information shared is accurate and I agree to Intrinest’s onboarding and communication process.
                </span>
              </label>
            </section>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-slate-500">
                After you submit, our team will review this designer profile and share next steps over email.
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl bg-slate-900 px-6 text-xs font-medium text-white hover:bg-slate-800"
              >
                {loading ? "Submitting…" : "Save designer"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
