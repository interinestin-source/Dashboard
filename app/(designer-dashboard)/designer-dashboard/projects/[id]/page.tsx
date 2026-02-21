"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
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
import { X, Loader2 } from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

export default function ProjectDetailPage() {
	const params = useParams();
	const projectId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

	const [values, setValues] = useState<ProjectFormValues>(initialValues);
	const [existingImages, setExistingImages] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const getUidFromCookie = () => {
		if (typeof document !== "undefined") {
			const match = document.cookie.match(/uid=([^;]+)/);
			return match ? match[1] : null;
		}
		return null;
	};

	useEffect(() => {
		if (!projectId) return;

		const fetchProject = async () => {
			try {
				const snap = await getDoc(doc(db, "projects", projectId));
				if (!snap.exists()) {
					toast.error("Project not found");
					setLoading(false);
					return;
				}

				const data = snap.data() as {
					uid?: string;
					title?: string;
					category?: "Interior" | "Exterior" | "Both" | "";
					budget?: string;
					duration?: string;
					location?: string;
					style?: string;
					status?: "Draft" | "Published" | "";
					description?: string;
					tags?: string[];
					imageUrls?: string[];
				};

				const uid = getUidFromCookie();
				if (!uid || (data.uid && data.uid !== uid)) {
					toast.error("You do not have access to edit this project");
					setLoading(false);
					return;
				}

				setValues({
					title: data.title || "",
					category: data.category || "",
					budget: data.budget || "",
					duration: data.duration || "",
					location: data.location || "",
					style: data.style || "",
					status: data.status || "Draft",
					description: data.description || "",
					tags: Array.isArray(data.tags) ? data.tags : [],
					images: [],
				});
				setExistingImages(Array.isArray(data.imageUrls) ? data.imageUrls : []);
			} catch (error) {
				console.error("Error loading project:", error);
				toast.error("Failed to load project");
			} finally {
				setLoading(false);
			}
		};

		void fetchProject();
	}, [projectId]);

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

	const handleRemoveExistingImage = (index: number) => {
		setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(tagInput);
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!projectId || saving) return;

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

				const totalImages = existingImages.length + values.images.length;
				if (totalImages < 3) {
					toast.error("Please keep at least 3 images");
					return;
				}

				const uploadedUrls: string[] = [];
				for (const image of values.images) {
					const imageRef = ref(
						storage,
						`projects/${uid}/${Date.now()}-${image.file.name}`
					);
					await uploadBytes(imageRef, image.file);
					const url = await getDownloadURL(imageRef);
					uploadedUrls.push(url);
				}

				const imageUrls = [...existingImages, ...uploadedUrls];

				await updateDoc(doc(db, "projects", projectId), {
					title: values.title,
					category: values.category,
					budget: values.budget,
					duration: values.duration,
					location: values.location,
					style: values.style,
					status: values.status,
					description: values.description,
					tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
					imageUrls,
					updatedAt: serverTimestamp(),
				});

				values.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
				setExistingImages(imageUrls);
				setValues((prev) => ({ ...prev, images: [] }));
				toast.success("Project updated successfully");
			} catch (error) {
				console.error("Error updating project:", error);
				toast.error("Failed to update project");
			} finally {
				setSaving(false);
			}
		};

		void runSave();
	};

	const breadcrumbs = [
		{ label: "Home", href: "/designer" },
		{ label: "Designer Dashboard" },
		{ label: "Project Details" },
	];

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header pageTitle="Project Details" breadcrumbs={breadcrumbs} />
				<div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-center min-h-[300px]">
						<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Header pageTitle="Project Details" breadcrumbs={breadcrumbs} />
			<div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Card className="border border-slate-200 shadow-sm">
					<CardHeader className="border-b bg-gradient-to-r from-blue-50 to-slate-50">
						<CardTitle className="text-lg md:text-xl">Edit Project</CardTitle>
					</CardHeader>

					<CardContent className="pt-6">
						<form onSubmit={handleSubmit} className="space-y-6 text-sm text-slate-900">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5 md:col-span-2">
									<Label htmlFor="title">Project title *</Label>
									<Input
										id="title"
										name="title"
										value={values.title}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="space-y-1.5">
									<Label>Category *</Label>
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
									<Label htmlFor="budget">Estimated budget *</Label>
									<Input
										id="budget"
										name="budget"
										value={values.budget}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="space-y-1.5">
									<Label>Duration *</Label>
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
									<Label>Location *</Label>
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
									<Label>Primary style</Label>
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

							<div className="space-y-1.5">
								<Label htmlFor="description">Project story</Label>
								<Textarea
									id="description"
									name="description"
									value={values.description}
									onChange={handleChange}
									rows={5}
								/>
							</div>

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

							<div className="space-y-2">
								<Label htmlFor="images">Project images *</Label>
								<Input
									id="images"
									type="file"
									multiple
									accept="image/*"
									onChange={handleImagesChange}
								/>
								<p className="text-xs text-slate-400">
									Minimum 3 images required.
								</p>

								{existingImages.length > 0 && (
									<div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
										{existingImages.map((url, i) => (
											<div
												key={`${url}-${i}`}
												className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
											>
												<img
													src={url}
													alt={`Existing project ${i + 1}`}
													className="h-28 w-full object-cover"
												/>
												<button
													type="button"
													onClick={() => handleRemoveExistingImage(i)}
													className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
													aria-label="Remove image"
												>
													<X className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								)}

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
													className="h-28 w-full object-cover"
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

							<div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-xs text-slate-400">
									Update your project and save changes.
								</p>
								<div className="flex gap-3">
									<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
										{saving ? "Saving..." : "Save changes"}
									</Button>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
