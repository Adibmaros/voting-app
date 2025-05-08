"use client";

import React, { useEffect, useState } from "react";
import { getUserVouchers } from "./libs/data";
import { Badge } from "@/components/ui/badge";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await getUserVouchers();
        setVouchers(data);
      } catch (err) {
        setError("Failed to load vouchers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading vouchers...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (vouchers.length === 0) return <div className="p-8 text-center">You don't have any vouchers yet.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Vouchers</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{voucher.code}</h3>
                <p className="text-sm text-gray-500">
                  Vote Amount: <span className="font-medium">{voucher.voteAmount}</span>
                </p>
              </div>
              <Badge className={voucher.status === "USED" ? "bg-gray-400" : "bg-green-500"}>{voucher.status}</Badge>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Created: {new Date(voucher.createdAt).toLocaleDateString()}</p>
              {voucher.status === "USED" && <p>Used on: {new Date(voucher.updatedAt).toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
