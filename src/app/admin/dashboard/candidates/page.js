"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus } from "lucide-react";

export default function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/admin/candidates");
        if (!response.ok) {
          throw new Error("Failed to fetch candidates");
        }
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this candidate?")) {
      try {
        const response = await fetch(`/api/admin/candidates/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete candidate");
        }

        // Update the candidates list
        setCandidates(candidates.filter((candidate) => candidate.id !== id));
      } catch (error) {
        console.error("Error deleting candidate:", error);
      }
    }
  };

  // Function to format percentage with 2 decimal places
  const formatPercentage = (percentage) => {
    return percentage.toFixed(2);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Candidates</h1>
        <Link href="/admin/candidates/create" className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={16} />
          Add New Candidate
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 rounded">No candidates found. Add a new candidate to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="border rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{candidate.name}</h2>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/admin/candidates/edit/${candidate.id}`)} className="text-blue-500 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(candidate.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {candidate.photoUrl && (
                <div className="mb-3">
                  <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-48 object-cover rounded" />
                </div>
              )}

              <div className="mb-3">
                <p className="text-gray-700">{candidate.description || "No description available"}</p>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${candidate.percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Votes: {candidate.voteCount}</span>
                  <span>{formatPercentage(candidate.percentage)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
