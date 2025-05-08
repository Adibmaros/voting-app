"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { selectedPackageAtom, checkoutStepAtom } from "@/lib/atoms";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, Award, Heart, Sparkles, ShieldCheck, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function VotePackagePage() {
  const [, setSelectedPackage] = useAtom(selectedPackageAtom);
  const [, setCheckoutStep] = useAtom(checkoutStepAtom);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        } else {
          console.error("Failed to fetch session:", response.status);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, []);

  const packages = [
    {
      title: "Paket Bronze",
      votes: "1 Vote",
      price: "Rp 10.000",
      slug: "bronze",
      amount: 10000,
      voteAmount: 1,
      popular: false,
      color: "bg-amber-700",
      textColor: "text-amber-700",
      borderColor: "border-amber-700",
      features: ["1 Vote untuk kontestan favorit", "Dukungan standar", "Masa berlaku sesuai periode kompetisi"],
    },
    {
      title: "Paket Silver",
      votes: "5 Vote",
      price: "Rp 25.000",
      slug: "silver",
      amount: 25000,
      voteAmount: 5,
      popular: false,
      color: "bg-gray-400",
      textColor: "text-gray-600",
      borderColor: "border-gray-400",
      features: ["5 Vote untuk kontestan favorit", "Diskon 50% dari harga satuan", "Masa berlaku sesuai periode kompetisi"],
    },
    {
      title: "Paket Gold",
      votes: "10 Vote",
      price: "Rp 40.000",
      slug: "gold",
      amount: 40000,
      voteAmount: 10,
      popular: true,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-500",
      features: ["10 Vote untuk kontestan favorit", "Diskon 60% dari harga satuan", "Masa berlaku sesuai periode kompetisi", "Prioritas dukungan"],
    },
    {
      title: "Paket Platinum",
      votes: "25 Vote",
      price: "Rp 90.000",
      slug: "platinum",
      amount: 90000,
      voteAmount: 25,
      popular: false,
      color: "bg-blue-700",
      textColor: "text-blue-700",
      borderColor: "border-blue-700",
      features: ["25 Vote untuk kontestan favorit", "Diskon 64% dari harga satuan", "Masa berlaku sesuai periode kompetisi", "Prioritas dukungan", "Akses fitur eksklusif"],
    },
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setCheckoutStep(2); // Move to checkout step
    router.push("/vote/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto p-5 font-sans text-gray-800 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-12 relative">
        <div className="absolute inset-0 bg-black opacity-10 pattern-dots"></div>
        <div className="relative z-10 p-8 md:p-12">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pilih Paket Voting</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">Dukung kontestan favorit Anda dengan berbagai pilihan paket voting yang tersedia</p>
          </div>
        </div>
      </div>

      {/* Login Check */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12 border-l-4 border-blue-600">
          <p className="text-lg flex items-center">
            <Clock className="mr-2 text-blue-600" size={20} />
            Memuat data sesi...
          </p>
        </div>
      ) : !session ? (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12 border-l-4 border-orange-500">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <ShieldCheck className="mr-2 text-orange-500" size={24} />
            Login Diperlukan
          </h2>
          <p className="text-lg mb-4">Untuk membeli paket voting, Anda perlu login terlebih dahulu.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">Login</button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all">Registrasi</button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Package Comparison Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Pilih Paket Sesuai Kebutuhan Anda</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.slug} className={`border-2 ${pkg.borderColor} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${pkg.popular ? "transform -translate-y-2" : ""}`}>
              {pkg.popular && (
                <div className="bg-yellow-500 text-white text-center py-1.5 font-medium flex items-center justify-center">
                  <Sparkles size={16} className="mr-1" />
                  Paling Populer
                </div>
              )}
              <div className="p-6">
                <div className={`${pkg.textColor} text-xl font-bold mb-3 flex items-center`}>
                  <Award className={`${pkg.textColor} mr-2`} size={20} />
                  {pkg.title}
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-orange-500 font-semibold text-lg flex items-center">
                    <Heart className="mr-1" size={16} /> {pkg.votes}
                  </span>
                  <span className="text-green-600 font-bold text-xl">{pkg.price}</span>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Fitur Paket:</h4>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={!session}
                  className={`inline-block ${pkg.color} text-white text-center w-full py-3 rounded-lg hover:opacity-90 font-bold transition-all ${!session ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {session ? "Pilih Paket" : "Login Dulu"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ShieldCheck className="mr-2 text-blue-600" size={24} />
          Keuntungan Membeli Paket Vote
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 border border-gray-200 rounded-xl bg-blue-50">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Heart size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Dukung Favorit Anda</h3>
            <p className="text-gray-700">Berikan dukungan nyata kepada kontestan favorit Anda untuk meningkatkan peluang kemenangan mereka dalam kompetisi.</p>
          </div>

          <div className="p-5 border border-gray-200 rounded-xl bg-purple-50">
            <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Harga Terjangkau</h3>
            <p className="text-gray-700">Tersedia berbagai pilihan paket dengan harga yang bersaing dan semakin hemat untuk pembelian paket yang lebih besar.</p>
          </div>

          <div className="p-5 border border-gray-200 rounded-xl bg-green-50">
            <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <CreditCard size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Proses Mudah</h3>
            <p className="text-gray-700">Pembelian paket voting dapat dilakukan dengan cepat dan mudah melalui berbagai metode pembayaran yang tersedia.</p>
          </div>
        </div>
      </section>

      {/* Purchase Process */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ShoppingBag className="mr-2 text-blue-600" size={24} />
          Tahapan Pembelian
        </h2>

        <div className="flex flex-col md:flex-row justify-between">
          {[
            {
              step: 1,
              title: "Pilih Paket",
              description: "Pilih paket voting yang sesuai dengan kebutuhan Anda",
              icon: <ShoppingBag className="text-white" size={20} />,
            },
            {
              step: 2,
              title: "Checkout",
              description: "Lengkapi data dan pilih metode pembayaran",
              icon: <CreditCard className="text-white" size={20} />,
            },
            {
              step: 3,
              title: "Verifikasi",
              description: "Upload bukti pembayaran untuk verifikasi",
              icon: <Clock className="text-white" size={20} />,
            },
            {
              step: 4,
              title: "Selesai",
              description: "Vote siap digunakan untuk kontestan favorit",
              icon: <CheckCircle className="text-white" size={20} />,
            },
          ].map((item) => (
            <div key={item.step} className="flex-1 flex flex-col items-center text-center p-4">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">
                Langkah {item.step}: {item.title}
              </h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-center text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Siap Mendukung Kontestan Favorit?</h2>
        <p className="mb-6 text-lg opacity-90">Beli paket vote sekarang dan bantu mereka meraih kemenangan!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/vote/guide">
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg transition-colors hover:bg-blue-50">Panduan Voting</button>
          </Link>
          {session ? (
            <Link href="/contestants">
              <button className="bg-blue-800 bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-3 px-8 rounded-lg transition-colors border border-white border-opacity-30">Lihat Kontestan</button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="bg-blue-800 bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-3 px-8 rounded-lg transition-colors border border-white border-opacity-30">Login Untuk Memilih</button>
            </Link>
          )}
        </div>
      </div>

      {/* Mini Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Voting Platform. Semua hak dilindungi.</p>
      </div>
    </div>
  );
}
