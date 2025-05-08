"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { selectedPackageAtom, checkoutStepAtom } from "@/lib/atoms";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, Upload, Clock, CheckCircle, Award, Info, User, Mail, Phone, HelpCircle, AlertTriangle, Sparkles, ChevronDown, Heart, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function VotingGuidePage() {
  const [, setSelectedPackage] = useAtom(selectedPackageAtom);
  const [, setCheckoutStep] = useAtom(checkoutStepAtom);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data); // Debug the response
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

  // Log session changes for debugging
  useEffect(() => {
    console.log("Updated session:", session);
  }, [session]);

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
    },
  ];

  const faqItems = [
    {
      question: "Berapa lama proses verifikasi pembayaran?",
      answer: "Proses verifikasi pembayaran biasanya membutuhkan waktu maksimal 1x24 jam. Jika dalam waktu tersebut belum ada konfirmasi, silakan hubungi customer service kami.",
    },
    {
      question: "Apakah vote yang sudah dibeli bisa dikembalikan?",
      answer: "Vote yang sudah dibeli dan digunakan tidak dapat dikembalikan atau direfund sesuai dengan ketentuan layanan kami.",
    },
    {
      question: "Bagaimana cara menggunakan vote?",
      answer: "Setelah pembayaran terverifikasi, vote akan otomatis tersedia di akun Anda. Anda dapat memberikan vote kepada kontestan favorit dengan mengunjungi halaman profil kontestan dan mengklik tombol 'Vote'.",
    },
    {
      question: "Apakah vote memiliki masa berlaku?",
      answer: "Ya, vote memiliki masa berlaku selama periode kompetisi berlangsung. Vote yang tidak digunakan setelah kompetisi berakhir akan hangus.",
    },
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setCheckoutStep(2); // Pindah ke langkah checkout
    router.push("/vote/checkout");
  };

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-5 font-sans text-gray-800 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-12 relative">
        <div className="absolute inset-0 bg-black opacity-10 pattern-dots"></div>
        <div className="relative z-10 p-8 md:p-12">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Panduan Voting</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">D ELL kontestan favorit Anda dengan memberikan vote dan jadilah bagian dari kesuksesan mereka</p>
          </div>
        </div>
      </div>

      {/* Pentingnya Login/Register */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12 border-l-4 border-blue-600">
          <p className="text-lg flex items-center">
            <Clock className="mr-2 text-blue-600" size={20} />
            Memuat data sesi...
          </p>
        </div>
      ) : session ? (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Info className="mr-2 text-blue-600" size={24} />
            Selamat Datang, {session.userId || "Pengguna"}!
          </h2>
          <p className="text-lg">Anda sudah login. Silakan pilih paket voting untuk mendukung kontestan favorit Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Info className="mr-2 text-blue-600" size={24} />
            Sebelum Anda Mulai
          </h2>
          <div className="space-y-4">
            <p className="text-lg">Untuk membeli dan menggunakan paket voting, Anda harus memiliki akun terdaftar di platform kami:</p>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1 bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg text-blue-700 mb-2 flex items-center">
                  <User className="mr-2" size={20} />
                  Sudah Memiliki Akun?
                </h3>
                <p className="mb-4 text-gray-700">Silakan login untuk melanjutkan proses pembelian vote</p>
                <Link href="/login">
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">Login Sekarang</button>
                </Link>
              </div>
              <div className="flex-1 bg-purple-50 p-6 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-lg text-purple-700 mb-2 flex items-center">
                  <User className="mr-2" size={20} />
                  Belum Memiliki Akun?
                </h3>
                <p className="mb-4 text-gray-700">Daftar untuk mendapatkan akses ke fitur voting</p>
                <Link href="/register">
                  <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all">Registrasi Sekarang</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panduan Umum */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <HelpCircle className="mr-2 text-blue-600" size={24} />
          Panduan Umum Voting
        </h2>
        <div className="prose max-w-none">
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <span>Sistem voting memungkinkan Anda mendukung kontestan favorit dengan membeli paket vote.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <span>Setiap vote yang Anda berikan akan langsung ditambahkan ke perolehan vote kontestan yang Anda pilih.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <span>Pembelian vote dapat dilakukan kapan saja selama periode voting berlangsung.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <span>Vote yang sudah dibeli tidak dapat diuangkan kembali atau dipindahtangankan ke akun lain.</span>
            </li>
            <li className="flex items-start">
              <AlertTriangle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
              <span className="font-medium">Vote yang tidak digunakan sampai periode voting berakhir akan hangus secara otomatis.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Paket Voting */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ShoppingBag className="mr-2 text-blue-600" size={24} />
          Paket Voting Tersedia
        </h2>
        <p className="mb-8 text-lg text-gray-600">Pilih paket voting sesuai dengan jumlah dukungan yang ingin Anda berikan:</p>
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
                <button onClick={() => handleSelectPackage(pkg)} className={`inline-block ${pkg.color} text-white text-center w-full py-3 rounded-lg hover:opacity-90 font-bold transition-all`}>
                  Pilih Paket
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cara Melakukan Pembelian */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <CreditCard className="mr-2 text-blue-600" size={24} />
          Cara Melakukan Pembelian Paket Voting
        </h2>
        <div className="space-y-8">
          {[
            {
              number: 1,
              title: "Login atau Registrasi",
              description: "Pastikan Anda sudah login ke akun Anda. Jika belum memiliki akun, silakan registrasi terlebih dahulu.",
              icon: <User className="text-white" size={20} />,
              color: "bg-blue-600",
            },
            {
              number: 2,
              title: "Pilih Paket Voting",
              description: 'Pilih paket voting yang sesuai dengan kebutuhan Anda. Klik tombol "Pilih Paket" pada paket yang Anda inginkan.',
              icon: <ShoppingBag className="text-white" size={20} />,
              color: "bg-blue-600",
            },
            {
              number: 3,
              title: "Lakukan Pembayaran",
              description: "Setelah memilih paket, Anda akan diarahkan ke halaman checkout. Transfer sejumlah uang sesuai dengan harga paket yang Anda pilih ke rekening yang tertera.",
              alert: "Penting: Pastikan transfer tepat sesuai nominal yang tercantum untuk memudahkan verifikasi.",
              icon: <CreditCard className="text-white" size={20} />,
              color: "bg-blue-600",
            },
            {
              number: 4,
              title: "Unggah Bukti Pembayaran",
              description: "Setelah melakukan transfer, unggah bukti pembayaran Anda pada form yang tersedia di halaman checkout.",
              icon: <Upload className="text-white" size={20} />,
              color: "bg-blue-600",
            },
            {
              number: 5,
              title: "Tunggu Verifikasi",
              description: "Admin akan memverifikasi pembayaran Anda dalam waktu 1 x 24 jam.",
              icon: <Clock className="text-white" size={20} />,
              color: "bg-blue-600",
            },
          ].map((step) => (
            <div key={step.number} className="relative pl-12 md:pl-16">
              <div className={`absolute left-0 top-0 ${step.color} w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg`}>{step.icon}</div>
              <div className="border-l-2 border-blue-200 pl-6 pb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.description}</p>
                {step.alert && (
                  <div className="bg-blue-50 text-blue-800 border-l-4 border-blue-500 p-4 mt-3 rounded-md text-sm flex items-start">
                    <AlertTriangle className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <span>{step.alert}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Syarat dan Ketentuan */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ShieldCheck className="mr-2 text-blue-600" size={24} />
          Syarat & Ketentuan
        </h2>
        <div className="prose max-w-none text-gray-700">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium mb-2">Dengan membeli dan menggunakan layanan voting, Anda menyetujui syarat dan ketentuan berikut:</p>
          </div>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Pembeli vote harus memiliki akun terdaftar pada platform kami.</li>
            <li>Vote yang sudah dibeli tidak dapat dikembalikan atau diuangkan kembali dengan alasan apapun.</li>
            <li>Pembeli dilarang menggunakan vote untuk tujuan yang melanggar kebijakan platform.</li>
            <li>Satu akun hanya dapat memberikan vote kepada satu kontestan pada satu kategori.</li>
            <li>Pembeli wajib menyimpan bukti pembayaran hingga proses verifikasi selesai.</li>
            <li>Platform berhak membatalkan vote yang diperoleh dengan cara tidak sah.</li>
            <li>Vote memiliki masa berlaku sesuai dengan periode kompetisi yang sedang berlangsung.</li>
            <li>Platform berhak mengubah harga dan jumlah vote pada paket tanpa pemberitahuan terlebih dahulu.</li>
            <li>Segala bentuk perselisihan akan diselesaikan secara kekeluargaan dan keputusan pihak platform bersifat mutlak.</li>
            <li>Dengan membeli vote, pengguna dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.</li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <HelpCircle className="mr-2 text-blue-600" size={24} />
          Pertanyaan Umum (FAQ)
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggleFaq(index)} className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-gray-50 transition-colors">
                <span>{item.question}</span>
                <ChevronDown className={`transition-transform ${expandedFaq === index ? "transform rotate-180" : ""}`} size={20} />
              </button>
              {expandedFaq === index && (
                <div className="p-4 pt-0 bg-gray-50 text-gray-700">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Phone className="mr-2 text-blue-600" size={24} />
          Butuh Bantuan?
        </h2>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <p className="mb- at text-gray-700">Jika Anda memiliki pertanyaan atau membutuhkan bantuan terkait pembelian vote, silakan hubungi customer service kami:</p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Phone className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Telepon / WhatsApp</p>
                <p className="font-medium">+62 812-3456-7890</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">support@votingplatform.com</p>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Jam Operasional Customer Service</p>
            <p className="font-medium">Senin - Jumat: 08.00 - 17.00 WIB</p>
            <p className="font-medium">Sabtu: 09.00 - 15.00 WIB</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-center text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Siap Mendukung Kontestan Favorit Anda?</h2>
        <p className="mb-6 text-lg opacity-90">Beli paket vote sekarang dan bantu mereka meraih kemenangan!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="bg-blue-800 bg-opacity-30 hover:bg-opacity-50 text-white font-bold py-3 px-8 rounded-lg transition-colors border border-white border-opacity-30">Lihat Kontestan</button>
          </Link>
          <Link href="/vote/paket">
            <button className="bg-purple-700 bg-opacity-40 hover:bg-opacity-60 text-white font-bold py-3 px-8 rounded-lg transition-colors border-2 border-purple-300 border-opacity-40">Lihat Paket Voucher</button>
          </Link>
        </div>
      </div>

      {/* Mini Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Voting Platform. Semua hak dilindungi.</p>
      </div>
    </div>
  );
}
