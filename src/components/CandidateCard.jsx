"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Ticket,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  Heart,
} from "lucide-react";

export default function CandidateCard({ candidate, session, onVote }) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showVoucherSelector, setShowVoucherSelector] = useState(false);
  const [userVouchers, setUserVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const router = useRouter();

  // Format percentage to display with 2 decimal places
  const formattedPercentage = candidate.percentage
    ? candidate.percentage.toFixed(2)
    : "0.00";

  // Fetch user's vouchers when the component mounts or session changes
  useEffect(() => {
    if (session) {
      fetchUserVouchers();
    }
  }, [session]);

  // Function to fetch vouchers owned by the user
  const fetchUserVouchers = async () => {
    if (!session) return;
    
    setLoadingVouchers(true);
    setError(null);
    
    try {
      const response = await fetch("/api/vouchers/user");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch vouchers");
      }
      
      setUserVouchers(data.vouchers || []);
    } catch (err) {
      setError(err.message || "Error fetching your vouchers");
      console.error("Error fetching vouchers:", err);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleVoucherSelect = (voucher) => {
    setSelectedVoucher(voucher);
    setShowVoucherSelector(false);
    setError(null);
    setSuccess("Voucher selected and ready to use");
  };

  const handleVote = async () => {
    if (!selectedVoucher) {
      setError("Please select a voucher first");
      return;
    }

    if (!session) {
      setError("You must be logged in to vote");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          voucherCode: selectedVoucher.code, // Changed from voucherId to voucherCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to vote");
      }

      setSelectedVoucher(null);
      setSuccess(
        `Vote successful! You gave ${data.voteAmount} votes to ${candidate.name}`
      );

      // Refresh user vouchers after voting
      fetchUserVouchers();
      
      // Call the callback to refresh data in the parent component
      if (onVote) {
        setTimeout(() => {
          onVote();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "An error occurred while voting");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle voucher selector
  const toggleVoucherSelector = () => {
    if (!session) {
      setError("You must be logged in to use vouchers");
      return;
    }
    
    setShowVoucherSelector(!showVoucherSelector);
    
    // If we're opening the selector and have no vouchers yet, fetch them
    if (!showVoucherSelector && userVouchers.length === 0) {
      fetchUserVouchers();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Candidate Photo */}
      <div className="relative bg-gradient-to-b from-indigo-100 to-white p-6 flex justify-center items-center">
        {candidate.photoUrl ? (
          <Image
            src={candidate.photoUrl}
            alt={candidate.name}
            width={160}
            height={160}
            className="rounded-full object-cover border-4 border-white shadow-sm"
          />
        ) : (
          <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <User className="h-24 w-24 text-gray-400" />
          </div>
        )}
        {/* Vote Count Badge */}
        <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full px-3 py-1 text-sm font-medium flex items-center shadow-sm">
          <Heart className="h-4 w-4 mr-1 fill-white" />
          {candidate.voteCount || 0} Votes
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Candidate Name */}
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
          {candidate.name}
        </h3>

        {/* Candidate Description */}
        <p className="text-gray-600 text-sm text-center mb-4 line-clamp-3">
          {candidate.description || "Deskripsi singkat tentang kandidat dari duta baca."}
        </p>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-3 rounded-full transition-all duration-700"
              style={{ width: `${candidate.percentage || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Persentase</span>
            <span className="font-medium">{formattedPercentage}%</span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div
            className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-md flex items-start"
            role="alert"
          >
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md flex items-start"
            role="alert"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Voucher Selector */}
        <div className="mb-4">
          <button 
            onClick={toggleVoucherSelector}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors flex items-center justify-between"
            disabled={isSubmitting || !session}
          >
            <div className="flex items-center">
              <Ticket className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">
                {selectedVoucher ? 
                  `Voucher: ${selectedVoucher.code} (${selectedVoucher.voteAmount} votes)` : 
                  "Select a voucher"}
              </span>
            </div>
            {showVoucherSelector ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </button>

          {/* Dropdown for selecting vouchers */}
          {showVoucherSelector && (
            <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto">
              {loadingVouchers ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                </div>
              ) : userVouchers.length > 0 ? (
                <ul className="space-y-1">
                  {userVouchers.map((voucher) => (
                    <li key={voucher.id}>
                      <button
                        onClick={() => handleVoucherSelect(voucher)}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-md flex justify-between items-center"
                      >
                        <span className="font-medium text-sm">{voucher.code}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
                          {voucher.voteAmount} votes
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-3 px-4 text-center text-gray-500">
                  <p className="text-sm">No unused vouchers available.</p>
                  <a href="/transaction" className="text-xs text-indigo-600 hover:underline mt-1 block">
                    Purchase vote packages
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vote Button */}
        <button
          onClick={handleVote}
          disabled={isSubmitting || !selectedVoucher || !session}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed font-medium flex items-center justify-center text-sm"
          aria-label="Vote untuk kandidat"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Heart className="mr-2 h-5 w-5" />
              <span>Vote Sekarang</span>
            </>
          )}
        </button>

        {/* Login Prompt */}
        {!session && (
          <p className="text-xs text-center text-gray-500 mt-3">
            Anda harus login terlebih dahulu untuk melakukan voting
          </p>
        )}
      </div>
    </div>
  );
}