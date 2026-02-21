"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/firebase";
import { toast } from "sonner";

type ProjectImage = {
  file: File;
  previewUrl: string;
};

type ProjectFormValues = {
  title: string;
  category: "Interior" | "Exterior" | "Both" | "";
  budget: string;
  duration: string;
  location: string;
  style: string;
  status: "Draft" | "Published" | "";
  description: string;
  tags: string[];
  images: ProjectImage[];
};

const initialValues: ProjectFormValues = {
  title: "",
  category: "",
  budget: "",
  duration: "",
  location: "",
  style: "",
  status: "Draft",
  description: "",
  tags: [],
  images: [],
};

const DURATION_OPTIONS = [
  "2-4 weeks",
  "4-6 weeks",
  "6-8 weeks",
  "8-10 weeks",
  "10-12 weeks",
  "12+ weeks",
];

const LOCATION_OPTIONS = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Other",
];

const STYLE_OPTIONS = [
  "Modern",
  "Contemporary",
  "Minimalist",
  "Scandinavian",
  "Industrial",
  "Traditional",
  "Boho",
  "Luxury",
  "Rustic",
];

const AddProject: React.FC = () => {
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const getUidFromCookie = () => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/uid=([^;]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newImages: ProjectImage[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setValues((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    // allow re‑selecting the same files
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setValues((prev) => {
      const images = [...prev.images];
      const [removed] = images.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return { ...prev, images };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const uid = getUidFromCookie();
    if (!uid) {
      toast.error("User not logged in");
      return;
    }

    const runSave = async () => {
      setSaving(true);
      try {
        if (!values.title.trim()) {
          toast.error("Project title is required");
          return;
        }
        if (!values.category) {
          toast.error("Category is required");
          return;
        }
        if (!values.budget.trim()) {
          toast.error("Budget is required");
          return;
        }
        if (!values.duration) {
          toast.error("Duration is required");
          return;
        }
        if (!values.location) {
          toast.error("Location is required");
          return;
        }
        if (values.images.length < 3) {
          toast.error("Please upload at least 3 images");
          return;
        }

        const imageUrls: string[] = [];

        for (const image of values.images) {
          const imageRef = ref(
            storage,
            `projects/${uid}/${Date.now()}-${image.file.name}`
          );
          await uploadBytes(imageRef, image.file);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        }

        const tags = values.tags.map((tag) => tag.trim()).filter(Boolean);

        await addDoc(collection(db, "projects"), {
          uid,
          title: values.title,
          category: values.category,
          budget: values.budget,
          duration: values.duration,
          location: values.location,
          style: values.style,
          status: values.status,
          description: values.description,
          tags,
          imageUrls,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        values.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setValues(initialValues);
        setTagInput("");
        toast.success("Project saved successfully");
      } catch (error) {
        console.error("Error saving project:", error);
        toast.error("Failed to save project");
      } finally {
        setSaving(false);
      }
    };

    void runSave();
  };

  const resetForm = () => {
    values.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setValues(initialValues);
    setTagInput("");
  };

  const addTag = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    setValues((prev) => {
      if (prev.tags.includes(next)) return prev;
      return { ...prev, tags: [...prev.tags, next] };
    });
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Form */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl">
                  Add New Project
                </CardTitle>
                <p className="mt-1 text-xs md:text-sm text-slate-500">
                  Document your interior / exterior design work with rich
                  visuals, clear budgets and timelines.
                </p>
              </div>
              <span className="hidden md:inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Designer workspace
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 text-sm text-slate-900"
            >
              {/* Basic info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="title">Project title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    placeholder="Modern 3BHK apartment – warm minimal interior"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={values.category}
                    onValueChange={(val) =>
                      setValues((p) => ({
                        ...p,
                        category: val as ProjectFormValues["category"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Exterior">Exterior</SelectItem>
                      <SelectItem value="Both">Interior + Exterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budget">Estimated budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    value={values.budget}
                    onChange={handleChange}
                    placeholder="₹ 4,50,000"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={values.duration}
                    onValueChange={(val) =>
                      setValues((p) => ({
                        ...p,
                        duration: val,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={values.location}
                    onValueChange={(val) =>
                      setValues((p) => ({
                        ...p,
                        location: val,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style">Primary style</Label>
                  <Select
                    value={values.style}
                    onValueChange={(val) =>
                      setValues((p) => ({
                        ...p,
                        style: val,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={values.status}
                    onValueChange={(val) =>
                      setValues((p) => ({
                        ...p,
                        status: val as ProjectFormValues["status"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Project story</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Walk through your design intent, constraints, materials and key decisions that shaped this project."
                />
                <p className="text-xs text-slate-400">
                  This is what potential clients will read first – keep it
                  clear and visual.
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                {values.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {values.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {tag}
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-800"
                          onClick={() =>
                            setValues((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((t) => t !== tag),
                            }))
                          }
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Input
                  id="tags"
                  name="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter"
                />
                <p className="text-xs text-slate-400">
                  Press Enter or comma to add tags.
                </p>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label htmlFor="images">Project images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                />
                <p className="text-xs text-slate-400">
                  Upload hero shots, before/after and detail shots. Minimum 3 images.
                </p>

                {values.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {values.images.map((img, i) => (
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
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  You can always edit this project later from{" "}
                  <span className="font-medium text-slate-600">
                    My Projects
                  </span>
                  .
                </p>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save project"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Side panel / helper */}
        <Card className="border border-slate-200/80 bg-slate-50/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-800">
              Tips for a strong portfolio project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-600">
            <ul className="space-y-2">
              <li>• Lead with 1–2 strong hero images.</li>
              <li>• Mention area, typology and target budget clearly.</li>
              <li>• Highlight 3–4 key design decisions or constraints.</li>
              <li>• Add materials, palette and furniture notes if relevant.</li>
            </ul>
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-3">
              <p className="font-medium text-xs text-slate-800">
                Interior + Exterior?
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use the “Both” category for villas, bungalows or projects where
                facade and interiors were designed together.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AddProject;