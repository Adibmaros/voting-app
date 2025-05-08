// src/app/vote/page.jsx
"use client";

import { useState, useEffect } from "react";
import CandidateCard from "@/components/CandidateCard";
import { useRouter, useSearchParams } from "next/navigation";

// Dummy data for candidates
const dummyCandidates = [
  {
    id: 1,
    name: "Adib Muhammad Maros",
    photoUrl: null,
    description: "Deskripsi singkat tentang kandidat dari duta baca lorem ipsum dolor",
    voteCount: 120,
    percentage: 40,
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    photoUrl: null,
    description: "Kandidat duta baca dengan prestasi akademik yang membanggakan",
    voteCount: 85,
    percentage: 28,
  },
  {
    id: 3,
    name: "Ahmad Dhani",
    photoUrl: null,
    description: "Kandidat yang aktif dalam kegiatan literasi kampus",
    voteCount: 65,
    percentage: 22,
  },
  {
    id: 4,
    name: "Maya Angelica",
    photoUrl: null,
    description: "Pemenang lomba penulisan esai tingkat nasional",
    voteCount: 30,
    percentage: 10,
  },
];

export default function VotePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";
  const sortOption = searchParams.get("sort") || "percentage";

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [sorting, setSorting] = useState(sortOption);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    // In a real application, this would be an API call
    // For now, we're using dummy data
    let filteredCandidates = [...dummyCandidates];

    // Apply search filter
    if (searchTerm) {
      filteredCandidates = filteredCandidates.filter((candidate) => candidate.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply sorting
    if (sorting === "name") {
      filteredCandidates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sorting === "percentage") {
      filteredCandidates.sort((a, b) => b.percentage - a.percentage);
    }

    setCandidates(filteredCandidates);
  }, [searchTerm, sorting]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (sorting) params.set("sort", sorting);

    router.push(`/vote?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSorting(value);

    // Update URL with sort parameter
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    if (searchTerm) params.set("search", searchTerm);

    router.push(`/vote?${params.toString()}`);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Voting Duta Baca UIN Raden Fatah Palembang</h1>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="flex">
              <input type="text" placeholder="Search candidate" className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700">
                Button
              </button>
            </div>
          </form>

          <div className="w-full sm:w-auto">
            <select value={sorting} onChange={handleSortChange} className="w-full sm:w-48 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="percentage">Sorting by Votes</option>
              <option value="name">Sorting by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.length > 0 ? (
          candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Tidak ada kandidat yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
