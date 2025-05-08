"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { use } from "react"; // Import React.use

export default function EditCandidatePage({ params }) {
  const router = useRouter();
  // Unwrap the params promise using React.use()
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const candidateId = id;

  const [formData, setFormData] = useState({
    name: "",
    photoUrl: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`/api/admin/candidates/${candidateId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch candidate");
        }
        const data = await response.json();
        setFormData({
          name: data.name,
          photoUrl: data.photoUrl || "",
          description: data.description || "",
        });
      } catch (error) {
        console.error("Error fetching candidate:", error);
        setError("Failed to load candidate data");
      } finally {
        setIsLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update candidate");
      }

      router.push("/admin/candidates");
    } catch (error) {
      console.error("Error updating candidate:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/candidates" className="flex items-center text-blue-500 hover:underline">
          <ArrowLeft size={16} className="mr-1" />
          Back to Candidates
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Candidate</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
            Name *
          </label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label htmlFor="photoUrl" className="block text-gray-700 font-medium mb-1">
            Photo
          </label>
          <ImageUploader value={formData.photoUrl} onChange={(url) => setFormData((prev) => ({ ...prev, photoUrl: url }))} />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-3 py-2 h-32" placeholder="Enter candidate description" />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/admin/candidates" className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
