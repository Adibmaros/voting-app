import React from "react";
import { getVoucherById } from "../libs/data";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function VoucherDetailPage({ params }) {
  const voucherId = params.id;
  const voucher = await getVoucherById(voucherId);

  if (!voucher) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Link href="/dashboard/vouchers" className="inline-flex items-center text-blue-600 mb-6 hover:underline">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Vouchers
      </Link>

      <div className="bg-white rounded-lg shadow p-6 border">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Voucher Details</h1>
          <div className={`px-3 py-1 text-sm font-semibold rounded-full ${voucher.status === "USED" ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-800"}`}>{voucher.status}</div>
        </div>

        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Voucher Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Code</p>
                <p className="font-medium">{voucher.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vote Amount</p>
                <p className="font-medium">{voucher.voteAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(voucher.createdAt).toLocaleString()}</p>
              </div>
              {voucher.status === "USED" && (
                <div>
                  <p className="text-sm text-gray-500">Used At</p>
                  <p className="font-medium">{new Date(voucher.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium">{voucher.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-medium">{voucher.transaction.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Amount</p>
                <p className="font-medium">Rp {voucher.transaction.amount.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          {voucher.status === "UNUSED" && (
            <div className="border-t pt-4">
              <Link href={`/dashboard/vote?voucherId=${voucher.id}`} className="block w-full py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Use this voucher to vote
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
