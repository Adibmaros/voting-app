"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { selectedPackageAtom, checkoutStepAtom, userTransactionAtom } from "@/lib/atoms";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [selectedPackage] = useAtom(selectedPackageAtom);
  const [checkoutStep] = useAtom(checkoutStepAtom);
  const [, setUserTransaction] = useAtom(userTransactionAtom);
  const router = useRouter();

  const [previewSrc, setPreviewSrc] = useState(null);
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect jika tidak ada paket yang dipilih
  useEffect(() => {
    if (!selectedPackage) {
      router.push("/vote/panduan");
    }
  }, [selectedPackage, router]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewSrc(ev.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Nomor rekening disalin!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!previewSrc) {
      setError("Silakan unggah bukti pembayaran terlebih dahulu");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Nomor telepon tidak boleh kosong");
      return;
    }

    // Simple phone number validation
    const phonePattern = /^[0-9+]{8,15}$/;
    if (!phonePattern.test(phoneNumber)) {
      setError("Format nomor telepon tidak valid");
      return;
    }

    setLoading(true);
    try {
      // Prepare form data for API call
      const formData = new FormData();
      formData.append("packageId", selectedPackage.slug);

      // Extract only numbers from price and parse as integer to avoid decimal precision issues
      const priceValue = parseInt(selectedPackage.price.replace(/[^0-9]/g, ""));
      formData.append("amount", priceValue);

      formData.append("voteAmount", selectedPackage.votes);
      formData.append("proofImage", document.querySelector("#payment-proof").files[0]);
      formData.append("notes", notes);
      formData.append("phoneNumber", phoneNumber);

      // Make API request to create transaction
      const response = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process transaction");
      }

      // Store transaction in atom and redirect
      const transaction = {
        id: result.transaction.id,
        packageName: selectedPackage.title,
        amount: result.transaction.amount,
        voteAmount: result.transaction.votePackageAmount,
        status: result.transaction.status,
        phoneNumber: result.transaction.phoneNumber,
        createdAt: result.transaction.createdAt,
      };

      setUserTransaction(transaction);
      router.push("/vote/transaction");
    } catch (err) {
      console.error("Error submitting payment:", err);
      setError(err.message || "Terjadi kesalahan saat mengirim bukti pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const bankAccounts = [
    { bank: "BANK BCA", account: "1234567890" },
    { bank: "BANK MANDIRI", account: "9876543210" },
  ];

  if (!selectedPackage) {
    return <div className="p-8 text-center">Memuat...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-gray-800 bg-gray-50 min-h-screen">
      <header className="bg-white shadow p-6 rounded-lg text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-600">Checkout Paket Voting</h1>
        <p className="text-gray-600">Selesaikan pembayaran untuk mendapatkan paket voting</p>
      </header>

      {/* Progress Steps */}
      <div className="flex mb-8 overflow-x-auto space-x-4">
        {["Pilih Paket", "Checkout", "Verifikasi", "Terima Voucher"].map((title, index) => (
          <div key={index} className="flex-1 text-center relative">
            <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center font-bold ${index < checkoutStep ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}>{index + 1}</div>
            <div className={`text-sm ${index < checkoutStep ? "text-blue-600 font-semibold" : "text-gray-500"}`}>{title}</div>
          </div>
        ))}
      </div>

      {/* Package Details */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Detail Paket</h2>
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-600 font-medium">Nama Paket</span>
          <span>{selectedPackage.title}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-600 font-medium">Jumlah Vote</span>
          <span>{selectedPackage.votes}</span>
        </div>
        <div className="flex justify-between text-blue-600 font-bold text-lg pt-4 border-t mt-4">
          <span>Total Pembayaran</span>
          <span>{selectedPackage.price}</span>
        </div>
      </section>

      {/* Payment Instructions */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Instruksi Pembayaran</h2>
        <div className="bg-blue-100 text-blue-800 border-l-4 border-blue-500 p-4 mb-4 rounded">
          <strong>Penting:</strong> Setelah melakukan pembayaran, jangan lupa unggah bukti transfer.
        </div>

        {bankAccounts.map(({ bank, account }) => (
          <div key={bank} className="bg-gray-100 p-4 mb-4 border-l-4 border-yellow-400 rounded">
            <p className="font-semibold">{bank}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white border border-dashed px-2 py-1 rounded text-sm font-mono">{account}</span>
              <button onClick={() => copyToClipboard(account)} className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">
                Salin
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">a.n. PT Example Voting</p>
          </div>
        ))}

        <div className="bg-orange-100 text-orange-800 border-l-4 border-orange-500 p-4 mt-4 rounded">
          <strong>Catatan:</strong> Transfer sesuai jumlah. Verifikasi 1x24 jam setelah unggah bukti.
        </div>
      </section>

      {/* Upload Payment Proof */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Data Pembayaran</h2>

        {error && <div className="bg-red-100 text-red-800 border-l-4 border-red-500 p-4 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phone-number" className="block font-medium text-gray-700 mb-1">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input type="text" id="phone-number" name="phoneNumber" placeholder="cth: 08123456789" className="block w-full border p-2 rounded" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <small className="text-gray-500 block mt-1">Nomor telepon aktif untuk konfirmasi pembayaran</small>
          </div>

          <div className="mb-4">
            <label htmlFor="payment-proof" className="block font-medium text-gray-700 mb-1">
              Bukti Transfer <span className="text-red-500">*</span>
            </label>
            <input type="file" id="payment-proof" name="paymentProof" accept="image/*" onChange={handleImageChange} className="block w-full border p-2 rounded" required />
            <small className="text-gray-500 block mt-1">Format: JPG, PNG, atau PDF. Maksimal 2MB.</small>
            {previewSrc && (
              <div className="mt-3">
                <img src={previewSrc} alt="Preview bukti pembayaran" className="rounded border max-h-60" />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea id="notes" name="notes" rows={3} className="block w-full border p-2 rounded" placeholder="Tambahkan catatan jika diperlukan" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
          </div>

          <button type="submit" className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white py-2 rounded font-semibold flex justify-center items-center`} disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Konfirmasi Pembayaran"
            )}
          </button>
        </form>
      </section>

      {/* Information Section */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Informasi Penting</h2>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Setelah pembayaran diverifikasi, admin akan membuat voucher vote dalam waktu 1x24 jam.</li>
          <li>Voucher vote dapat dilihat pada menu profil pengguna.</li>
          <li>Vote dapat digunakan untuk mendukung kontestan favorit.</li>
          <li>
            Jika ada pertanyaan, silakan hubungi kami di{" "}
            <a href="mailto:support@example.com" className="text-blue-600 underline">
              support@example.com
            </a>
            .
          </li>
        </ul>
      </section>

      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        <p>Terima kasih telah mendukung kontestan favorit Anda!</p>
        <a href="/vote/panduan" className="text-blue-600 hover:underline">
          Kembali ke Panduan Voting
        </a>
      </footer>
    </div>
  );
}
