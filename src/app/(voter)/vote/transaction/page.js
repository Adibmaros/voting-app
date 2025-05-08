"use client";

import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { selectedPackageAtom, checkoutStepAtom, userTransactionAtom } from "@/lib/atoms";
import { useRouter } from "next/navigation";

export default function TransactionStatusPage() {
  const [transaction] = useAtom(userTransactionAtom);
  const [, setCheckoutStep] = useAtom(checkoutStepAtom);
  const router = useRouter();

  useEffect(() => {
    if (!transaction) {
      router.push("/vote/panduan");
    } else {
      setCheckoutStep(3); // Set step to verification
    }
  }, [transaction, router, setCheckoutStep]);

  if (!transaction) {
    return <div className="p-8 text-center">Memuat...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-gray-800 bg-gray-50 min-h-screen">
      <header className="bg-white shadow p-6 rounded-lg text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-600">Status Transaksi</h1>
        <p className="text-gray-600">Pantau status transaksi pembelian paket voting Anda</p>
      </header>

      {/* Progress Steps */}
      <div className="flex mb-8 overflow-x-auto space-x-4">
        {["Pilih Paket", "Checkout", "Verifikasi", "Terima Voucher"].map((title, index) => (
          <div key={index} className="flex-1 text-center relative">
            <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center font-bold ${index < 3 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}>{index + 1}</div>
            <div className={`text-sm ${index < 3 ? "text-blue-600 font-semibold" : "text-gray-500"}`}>{title}</div>
          </div>
        ))}
      </div>

      {/* Transaction Status */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="text-center bg-yellow-100 p-4 rounded-lg mb-6">
          <div className="inline-block p-2 bg-yellow-200 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-yellow-800">Menunggu Verifikasi</h3>
          <p className="text-yellow-700">Pembayaran Anda sedang dalam proses verifikasi</p>
        </div>

        <h2 className="text-lg font-semibold mb-4">Detail Transaksi</h2>
        <div className="space-y-3">
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-600 font-medium">ID Transaksi</span>
            <span>#{transaction.id.toString().padStart(6, "0")}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-600 font-medium">Paket</span>
            <span>{transaction.packageName}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-600 font-medium">Jumlah Vote</span>
            <span>{transaction.voteAmount} Vote</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-600 font-medium">Pembayaran</span>
            <span>Rp {transaction.amount.toLocaleString("id-ID")}</span>
          </div>
          {transaction.phoneNumber && (
            <div className="flex justify-between border-b py-2">
              <span className="text-gray-600 font-medium">Nomor Telepon</span>
              <span>{transaction.phoneNumber}</span>
            </div>
          )}
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-600 font-medium">Tanggal</span>
            <span>{new Date(transaction.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 font-medium">Status</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">PENDING</span>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Proses Verifikasi</h2>

        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 w-8">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
              <div className="w-0.5 h-full bg-gray-300 mx-auto"></div>
            </div>
            <div className="flex-grow pl-2 pb-6">
              <h3 className="font-medium">Pembayaran Terkirim</h3>
              <p className="text-sm text-gray-500">Bukti pembayaran berhasil dikirim</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 w-8">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto"></div>
              <div className="w-0.5 h-full bg-gray-300 mx-auto"></div>
            </div>
            <div className="flex-grow pl-2 pb-6">
              <h3 className="font-medium">Sedang Diverifikasi</h3>
              <p className="text-sm text-gray-500">Admin sedang memeriksa bukti pembayaran Anda</p>
              <div className="mt-1 flex items-center text-yellow-600 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Dalam proses
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 w-8">
              <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto"></div>
            </div>
            <div className="flex-grow pl-2">
              <h3 className="font-medium text-gray-400">Paket Vote Diterima</h3>
              <p className="text-sm text-gray-400">Voucher vote akan muncul di akun Anda</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Informasi</h2>
        <div className="bg-blue-100 text-blue-800 border-l-4 border-blue-500 p-4 rounded">
          <p>Admin akan memverifikasi pembayaran dalam waktu 1x24 jam. Harap bersabar.</p>
          <p className="mt-2">Jika transaksi tidak diverifikasi dalam 24 jam, silakan hubungi tim dukungan kami.</p>
        </div>

        <div className="mt-4">
          <a href="/vote/panduan" className="text-blue-600 hover:underline">
            ← Kembali ke Panduan Voting
          </a>
        </div>
      </section>
    </div>
  );
}
