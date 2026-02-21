"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "sonner";

type ProfileImage = {
  file: File;
  previewUrl: string;
};

type DesignerProfileForm = {
  email: string;
  fullName: string;
  phone: string;
  city: string;
  role:
    | "Solo Interior Designer"
    | "Design Studio / Firm"
    | "Interior Design Student / Fresher"
    | "";
  experience: "0–1 years" | "1–3 years" | "3–5 years" | "5+ years" | "";
  services: string[];
  budgetRange:
    | "Below ₹1 Lakhs"
    | "Under ₹5 Lakhs"
    | "₹5–10 Lakhs"
    | "₹10–20 Lakhs"
    | "₹20 Lakhs+"
    | "Depends on project"
    | "";
  portfolio: string;
  instagram: string;
  website: string;
  styles: string[];
  leadsPreference: "Yes" | "Yes, but selectively" | "Not right now" | "";
  notes: string;
  projectImages: ProfileImage[];
};

const ROLE_OPTIONS = [
  "Solo Interior Designer",
  "Design Studio / Firm",
  "Interior Design Student / Fresher",
];

const EXPERIENCE_OPTIONS = ["0–1 years", "1–3 years", "3–5 years", "5+ years"];

const SERVICES_OPTIONS = [
  "Full Home Interior Design",
  "Kitchen Design",
  "Living Room / Bedroom Styling",
  "Commercial / Office Interiors",
  "Cafe / Restaurant Interiors",
  "Consultation Only",
];

const BUDGET_OPTIONS = [
  "Below ₹1 Lakhs",
  "Under ₹5 Lakhs",
  "₹5–10 Lakhs",
  "₹10–20 Lakhs",
  "₹20 Lakhs+",
  "Depends on project",
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

const LEADS_OPTIONS = ["Yes", "Yes, but selectively", "Not right now"];

const initialValues: DesignerProfileForm = {
  email: "",
  fullName: "",
  phone: "",
  city: "",
  role: "",
  experience: "",
  services: [],
  budgetRange: "",
  portfolio: "",
  instagram: "",
  website: "",
  styles: [],
  leadsPreference: "",
  notes: "",
  projectImages: [],
};

const DesignerProfile: React.FC = () => {
  const [values, setValues] = useState<DesignerProfileForm>(initialValues);
  const [loading, setLoading] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Get uid from cookie
  const getUidFromCookie = () => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/uid=([^;]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  useEffect(() => {
    async function fetchDesignerProfile() {
      const uid = getUidFromCookie();
      if (!uid) {
        toast.error("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const designerRef = doc(db, "designers", uid);
        const designerSnap = await getDoc(designerRef);

        if (designerSnap.exists()) {
          const data = designerSnap.data();
          
          // Map role from registration format to profile format
          let mappedRole: DesignerProfileForm["role"] = "";
          if (data.role === "solo") mappedRole = "Solo Interior Designer";
          else if (data.role === "studio") mappedRole = "Design Studio / Firm";
          else if (data.role === "student") mappedRole = "Interior Design Student / Fresher";
          
          // Map Firestore data to form values
          setValues({
            email: data.email || "",
            fullName: data.fullName || "",
            phone: data.phone || "",
            city: data.city || "",
            role: mappedRole,
            experience: data.experience || "",
            services: Array.isArray(data.services) ? data.services : [],
            budgetRange: data.budgetRange || "",
            portfolio: data.portfolio || "",
            instagram: data.instagram || "",
            website: data.website || "",
            styles: Array.isArray(data.styles) ? data.styles : [],
            leadsPreference: data.leadsPreference || "",
            notes: data.notes || "",
            projectImages: [],
          });

          // Store existing image URLs
          if (data.imageUrls && Array.isArray(data.imageUrls)) {
            setExistingImages(data.imageUrls);
          }
        } else {
          toast.error("Profile not found");
        }
      } catch (error) {
        console.error("Error fetching designer profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchDesignerProfile();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleMulti = (field: "services" | "styles", option: string) => {
    setValues((prev) => {
      const current = prev[field];
      const exists = current.includes(option);
      const next = exists
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [field]: next };
    });
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setValues((prev) => {
      const remainingSlots = Math.max(0, 5 - prev.projectImages.length);
      const limited = files.slice(0, remainingSlots);
      const newImages: ProfileImage[] = limited.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return {
        ...prev,
        projectImages: [...prev.projectImages, ...newImages],
      };
    });

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setValues((prev) => {
      const next = [...prev.projectImages];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return { ...prev, projectImages: next };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Profile data:", values);
    toast.success("Profile data ready for update");
    // TODO: Implement Firestore update logic
  };

  const handleReset = () => {
    values.projectImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setValues(initialValues);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#f8f4ec] to-slate-50">
          <h2 className="text-base font-semibold text-slate-800">
            Designer Profile
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-500">
            Tell us about your practice so we can match you with the right
            clients.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 text-sm text-slate-900"
          >
            {/* Basic info */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Basic details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone Number (WhatsApp preferred) *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City you are based in *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Role & experience */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Practice details
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Are you a: *</Label>
                  <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                    {ROLE_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="role"
                          value={opt}
                          checked={values.role === opt}
                          onChange={() =>
                            setValues((p) => ({
                              ...p,
                              role: opt as DesignerProfileForm["role"],
                            }))
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience *</Label>
                  <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="experience"
                          value={opt}
                          checked={values.experience === opt}
                          onChange={() =>
                            setValues((p) => ({
                              ...p,
                              experience:
                                opt as DesignerProfileForm["experience"],
                            }))
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Services & budget */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Services & budgets
              </h3>

              <div className="space-y-2">
                <Label>Services You Offer *</Label>
                <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                  {SERVICES_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={values.services.includes(opt)}
                        onChange={() => handleToggleMulti("services", opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Typical Project Budget Range *</Label>
                <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                  {BUDGET_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="budgetRange"
                        value={opt}
                        checked={values.budgetRange === opt}
                        onChange={() =>
                          setValues((p) => ({
                            ...p,
                            budgetRange:
                              opt as DesignerProfileForm["budgetRange"],
                          }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Online presence */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Online presence
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="portfolio">Portfolio Link (if any)</Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    value={values.portfolio}
                    onChange={handleChange}
                    placeholder="Behance, personal site, etc."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={values.instagram}
                    onChange={handleChange}
                    placeholder="@yourstudio"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website (if any)</Label>
                  <Input
                    id="website"
                    name="website"
                    value={values.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Project snapshots
              </h3>
              <p className="text-xs text-slate-500">
                Upload 2–5 project images. Max 10 MB per file.
              </p>

              {existingImages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-600">
                    Existing images
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={url}
                          alt={`Existing project ${i + 1}`}
                          className="h-28 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Input
                id="projectImages"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
              />

              {values.projectImages.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {values.projectImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={img.previewUrl}
                        alt={img.file.name}
                        className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Styles & leads */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label>Design Styles You Specialize In *</Label>
                <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                  {STYLE_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={values.styles.includes(opt)}
                        onChange={() => handleToggleMulti("styles", opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Are you open to receiving client leads from Intrinest? *
                </Label>
                <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                  {LEADS_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="leadsPreference"
                        value={opt}
                        checked={values.leadsPreference === opt}
                        onChange={() =>
                          setValues((p) => ({
                            ...p,
                            leadsPreference:
                              opt as DesignerProfileForm["leadsPreference"],
                          }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-2">
              <Label htmlFor="notes">
                Anything you’d like us to know?
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                rows={4}
              />
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Your profile is visible only after you publish it from your
                dashboard.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save profile
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignerProfile;