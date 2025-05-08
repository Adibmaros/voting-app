"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { getUser } from "@/lib/auth";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("vouchers");
  const [vouchers, setVouchers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]); // Ensure this is initialized as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voucherFilter, setVoucherFilter] = useState("all"); // all, used, unused
  const [candidateFilter, setCandidateFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin, if not redirect
    // const checkAuth = async () => {
    //   const { user } = await getUser();
    //   if (!user || user.role !== "ADMIN") {
    //     router.push("/login");
    //   }
    // };

    // checkAuth();
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data for admin dashboard
      const [vouchersRes, votesRes, candidatesRes, usersRes, transactionsRes] = await Promise.all([
        fetch("/api/admin/vouchers"),
        fetch("/api/votes"),
        fetch("/api/admin/candidates"),
        fetch("/api/admin/users"),
        fetch("/api/admin/transactions"),
      ]);

      if (!vouchersRes.ok || !votesRes.ok || !candidatesRes.ok || !usersRes.ok || !transactionsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [vouchersData, votesData, candidatesData, usersData, transactionsData] = await Promise.all([vouchersRes.json(), votesRes.json(), candidatesRes.json(), usersRes.json(), transactionsRes.json()]);

      // Ensure data is always handled as arrays
      setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
      setVotes(Array.isArray(votesData) ? votesData : []);
      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      // Initialize with empty arrays to prevent errors
      setVouchers([]);
      setVotes([]);
      setCandidates([]);
      setUsers([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVouchers = () => {
    if (voucherFilter === "all") return vouchers;
    return vouchers.filter((voucher) => (voucherFilter === "used" ? voucher.status === "USED" : voucher.status === "UNUSED"));
  };

  const getFilteredVotes = () => {
    if (candidateFilter === "all") return votes;
    return votes.filter((vote) => vote.candidateId === parseInt(candidateFilter));
  };

  const getUserNameById = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const getCandidateNameById = (candidateId) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate ? candidate.name : "Unknown Candidate";
  };

  const getVoucherCodeById = (voucherId) => {
    const voucher = vouchers.find((v) => v.id === voucherId);
    return voucher ? voucher.code : "Unknown Voucher";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if transactions is an array and has slice method
  const getRecentTransactions = () => {
    if (!Array.isArray(transactions)) {
      console.error("Transactions is not an array:", transactions);
      return [];
    }
    return transactions.slice(0, 5);
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button className={`py-2 px-4 mr-2 ${activeTab === "vouchers" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`} onClick={() => setActiveTab("vouchers")}>
            Vouchers
          </button>
          <button className={`py-2 px-4 mr-2 ${activeTab === "votes" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`} onClick={() => setActiveTab("votes")}>
            Votes
          </button>
          <button className={`py-2 px-4 mr-2 ${activeTab === "summary" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`} onClick={() => setActiveTab("summary")}>
            Summary
          </button>
        </div>

        {/* Vouchers Tab */}
        {activeTab === "vouchers" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Vouchers</h2>
              <div className="flex items-center">
                <span className="mr-2">Filter:</span>
                <select className="border rounded px-3 py-1" value={voucherFilter} onChange={(e) => setVoucherFilter(e.target.value)}>
                  <option value="all">All Vouchers</option>
                  <option value="used">Used</option>
                  <option value="unused">Unused</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredVouchers().map((voucher) => (
                      <tr key={voucher.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voucher.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{voucher.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voucher.voteAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUserNameById(voucher.userId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voucher.transactionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${voucher.status === "USED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {voucher.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(voucher.createdAt)}</td>
                      </tr>
                    ))}
                    {getFilteredVouchers().length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No vouchers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Votes Tab */}
        {activeTab === "votes" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Votes</h2>
              <div className="flex items-center">
                <span className="mr-2">Filter by Candidate:</span>
                <select className="border rounded px-3 py-1" value={candidateFilter} onChange={(e) => setCandidateFilter(e.target.value)}>
                  <option value="all">All Candidates</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredVotes().map((vote) => (
                      <tr key={vote.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vote.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUserNameById(vote.userId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{getCandidateNameById(vote.candidateId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getVoucherCodeById(vote.voucherId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vote.voteAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(vote.createdAt)}</td>
                      </tr>
                    ))}
                    {getFilteredVotes().length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No votes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Voting Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Votes</h3>
                <p className="text-3xl font-bold">{votes.reduce((sum, vote) => sum + vote.voteAmount, 0)}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Vouchers</h3>
                <p className="text-3xl font-bold">{vouchers.length}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Used: <span className="font-medium">{vouchers.filter((v) => v.status === "USED").length}</span>
                  </span>
                  <span className="text-gray-500">
                    Unused: <span className="font-medium">{vouchers.filter((v) => v.status === "UNUSED").length}</span>
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Candidate Results</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {candidate.photoUrl && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img className="h-10 w-10 rounded-full" src={candidate.photoUrl} alt={candidate.name} />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.voteCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2 w-32">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${candidate.percentage}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-500">{candidate.percentage?.toFixed(1) || "0.0"}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
