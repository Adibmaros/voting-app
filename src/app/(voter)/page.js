"use client";
import { useState, useEffect, useCallback } from "react";
import CandidateCard from "@/components/CandidateCard";
import { useRouter, useSearchParams } from "next/navigation";

export default function VotePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";
  const sortOption = searchParams.get("sort") || "percentage";

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [sorting, setSorting] = useState(sortOption);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };
    fetchSession();
  }, []);

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/candidates");
      if (!response.ok) {
        throw new Error("Gagal mengambil data kandidat");
      }

      let data = await response.json();

      // Client-side filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        data = data.filter((candidate) => candidate.name.toLowerCase().includes(searchLower) || (candidate.description && candidate.description.toLowerCase().includes(searchLower)));
      }

      // Client-side sorting
      if (sorting === "name") {
        data.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sorting === "percentage") {
        data.sort((a, b) => b.voteCount - a.voteCount);
      }

      setCandidates(data || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sorting]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (sorting) params.set("sort", sorting);
    router.push(`/vote?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSorting(value);
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    if (searchTerm) params.set("search", searchTerm);
    router.push(`/vote?${params.toString()}`);
  };

  // Handle vote submission (called by CandidateCard)
  const handleVote = useCallback(() => {
    fetchCandidates(); // Refresh data after voting
  }, [fetchCandidates]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Voting Duta Baca UIN Raden Fatah Palembang</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Pilih kandidat favorit Anda untuk menjadi Duta Baca. Login untuk memberikan suara!</p>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10 bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              placeholder="Cari kandidat..."
              className="flex-1 border-gray-300 rounded-l-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Cari
            </button>
          </div>
        </form>
        <div className="w-full sm:w-auto">
          <select value={sorting} onChange={handleSortChange} className="w-full sm:w-48 border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="percentage">Urutkan berdasarkan Suara</option>
            <option value="name">Urutkan berdasarkan Nama</option>
          </select>
        </div>
      </div>

      {/* Authentication Status */}
      {!session && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md mb-8 flex items-center justify-between" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <span className="font-medium">Anda belum login! </span>
              Silakan login untuk memberikan suara.
            </p>
          </div>
          <a href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm">
            Login
          </a>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-indigo-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-8" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <span className="font-bold">Error: </span>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                session={session}
                onVote={handleVote} // Pass callback to refresh data after voting
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10m0 0v10m0-10H7m0 10h10" />
              </svg>
              <p className="mt-2 text-gray-500 text-lg">Tidak ada kandidat yang ditemukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
