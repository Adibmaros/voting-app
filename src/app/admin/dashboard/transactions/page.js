"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { ChevronLeft, ChevronRight, Search, RefreshCcw, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle, Ticket } from "lucide-react";

export default function TransactionsAdminPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const itemsPerPage = 10;

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/transactions?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}&search=${searchTerm}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data transaksi");
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleVerifyTransaction = async (id) => {
    try {
      const response = await fetch(`/api/admin/transactions/${id}/verify`, { method: "PUT" });

      if (!response.ok) {
        throw new Error("Gagal memverifikasi transaksi");
      }

      showAlert("Transaksi berhasil diverifikasi", "success");
      fetchTransactions();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const handleRejectTransaction = async (id) => {
    try {
      const response = await fetch(`/api/admin/transactions/${id}/reject`, { method: "PUT" });

      if (!response.ok) {
        throw new Error("Gagal menolak transaksi");
      }

      showAlert("Transaksi berhasil ditolak", "success");
      fetchTransactions();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const checkVoucherStatus = async (transactionId) => {
    try {
      setIsCheckingVoucher(true);
      const response = await fetch(`/api/admin/transactions/${transactionId}/check-voucher`);

      if (!response.ok) {
        throw new Error("Gagal memeriksa status voucher");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      showAlert(err.message, "error");
      return { hasVoucher: false };
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleSelectTransaction = async (transaction) => {
    try {
      setIsCheckingVoucher(true);
      // Check if the transaction already has a voucher
      const { hasVoucher, vouchers } = await checkVoucherStatus(transaction.id);

      // Update the transaction object with the voucher status
      const updatedTransaction = {
        ...transaction,
        hasVoucher,
        vouchers: vouchers || [],
      };

      setSelectedTransaction(updatedTransaction);
    } catch (error) {
      showAlert("Error checking voucher status", "error");
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleGenerateVoucher = async () => {
    if (!selectedTransaction) return;

    try {
      setIsGeneratingVoucher(true);
      const response = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: selectedTransaction.id,
          userId: selectedTransaction.userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal membuat voucher");
      }

      const data = await response.json();
      showAlert(`Voucher berhasil dibuat: ${data.voucher.code}`, "success");
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getPackageName = (voteAmount) => {
    const packages = [
      { title: "Paket Bronze", voteAmount: 1 },
      { title: "Paket Silver", voteAmount: 5 },
      { title: "Paket Gold", voteAmount: 10 },
      { title: "Paket Platinum", voteAmount: 25 },
    ];

    const foundPackage = packages.find((pkg) => pkg.voteAmount === voteAmount);
    return foundPackage ? foundPackage.title : `Paket Custom (${voteAmount} Vote)`;
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - Transaksi</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="py-10">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Transaksi</h1>
          </header>
          <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {alertMessage && (
              <div className={`mb-4 p-4 rounded-md ${alertType === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`} role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">{alertType === "success" ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{alertMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 bg-white p-4 shadow rounded-lg">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Cari berdasarkan User ID atau Transaksi ID
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="w-full md:w-auto self-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cari
                  </button>
                </div>
                <div className="w-full md:w-auto self-end">
                  <button
                    type="button"
                    onClick={fetchTransactions}
                    className="w-full md:w-auto bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <RefreshCcw className="h-5 w-5 mr-2" />
                    Refresh
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
                  <p>{error}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CreditCard className="h-10 w-10 mx-auto mb-4" />
                  <p>Tidak ada transaksi ditemukan</p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <li key={transaction.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <p className="text-sm font-medium text-indigo-600 truncate">Transaksi #{transaction.id}</p>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <div className="flex space-x-2">
                            {transaction.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleVerifyTransaction(transaction.id)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verifikasi
                                </button>
                                <button onClick={() => handleRejectTransaction(transaction.id)} className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Tolak
                                </button>
                              </>
                            )}
                            {transaction.status === "VERIFIED" && (
                              <button
                                onClick={() => handleSelectTransaction(transaction)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                disabled={isCheckingVoucher}
                              >
                                {isCheckingVoucher ? "Memeriksa..." : "Buat Voucher"}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex sm:flex-wrap gap-6">
                            <p className="flex items-center text-sm text-gray-500">User ID: {transaction.userId}</p>
                            <p className="flex items-center text-sm text-gray-500">No Hp: {transaction.phoneNumber}</p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">Jumlah: Rp {transaction.amount?.toLocaleString("id-ID")}</p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              Paket: {getPackageName(transaction.votePackageAmount)} ({transaction.votePackageAmount} Vote)
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>Dibuat pada {new Date(transaction.createdAt).toLocaleDateString("id-ID")}</p>
                          </div>
                        </div>
                        {transaction.paymentProofUrl && (
                          <div className="mt-2">
                            <a href={transaction.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-500">
                              Lihat Bukti Pembayaran
                            </a>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {totalPages > 1 && (
                <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" aria-label="Pagination">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{" "}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, transactions.length + (currentPage - 1) * itemsPerPage)}</span> hasil
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Sebelumnya</span>
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages).keys()].map((i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1 ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Selanjutnya</span>
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </nav>
              )}
            </div>
          </main>
        </div>

        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75" onClick={() => setSelectedTransaction(null)} role="dialog" aria-modal="true" aria-labelledby="voucher-modal-title">
            <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6" onClick={(e) => e.stopPropagation()} tabIndex={-1}>
              <div>
                <h3 id="voucher-modal-title" className="text-lg leading-6 font-medium text-gray-900 text-center">
                  Buat Voucher
                </h3>
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-500">Anda akan membuat voucher untuk Transaksi #{selectedTransaction.id}</p>
                  {selectedTransaction.hasVoucher && (
                    <p className="text-sm text-blue-600 mt-2">
                      <Ticket className="inline h-4 w-4 mr-1" />
                      Voucher sudah dibuat untuk transaksi ini.
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900">Detail Paket</h4>
                    <p className="text-sm text-gray-700 mt-1">{getPackageName(selectedTransaction.votePackageAmount)}</p>
                    <p className="text-sm text-gray-700 mt-1">Jumlah Vote: {selectedTransaction.votePackageAmount}</p>
                    <p className="text-sm text-gray-700 mt-1">Harga: Rp {selectedTransaction.amount?.toLocaleString("id-ID")}</p>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">Voucher akan dibuat dengan jumlah vote sesuai paket yang dibeli.</p>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleGenerateVoucher}
                  disabled={isGeneratingVoucher || selectedTransaction.hasVoucher}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:col-start-2 sm:text-sm ${
                    isGeneratingVoucher || selectedTransaction.hasVoucher ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {isGeneratingVoucher ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Membuat...
                    </>
                  ) : selectedTransaction.hasVoucher ? (
                    "Voucher Sudah Dibuat"
                  ) : (
                    "Buat Voucher"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTransaction(null)}
                  disabled={isGeneratingVoucher}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 sm:mt-0 sm:col-start-1 sm:text-sm ${
                    isGeneratingVoucher ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
