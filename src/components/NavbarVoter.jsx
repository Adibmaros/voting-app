'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import FormLogout from './form-logout'

export default function Navbar({ user = null, role = "VOTER" }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Dynamic menu items based on role
  const getNavItems = () => {
    // Default items for all users
    const items = [
      { label: 'Dashboard', href: role === "ADMIN" ? '/admin/dashboard' : '/' },
    ]
    
    // Items for authenticated users based on role
    if (user) {
      if (role === "ADMIN") {
        items.push(
          { label: 'Candidates', href: '/admin/dashboard/candidates' },
          // { label: 'Users', href: '/admin/dashboard/users' },
          { label: 'Transactions', href: '/admin/dashboard/transactions' },
          // { label: 'Vouchers', href: '/admin/dashboard/vouchers' },
          // { label: 'Vote Data', href: '/admin/dashboard/votes' }
        )
      } else { // VOTER or other roles
        items.push({ label: 'My Voucher', href: '/vote/voucher' },
      { label: 'Cara Voting', href: '/vote/panduan' },
      { label: 'Paket', href: '/vote/paket' },

        )
      }
    } else {
      // Items for unauthenticated users
      items.push({ label: 'Login', href: role === "ADMIN" ? '/admin/login' : '/login' })
      // Uncomment if registration is needed
      // items.push({ label: 'Daftar', href: '/register' })
    }
    
    return items
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={role === "ADMIN" ? "/admin/dashboard" : "/"} className="text-xl font-bold text-blue-600">
          {role === "ADMIN" ? "Admin Panel" : "VotingApp"}
        </Link>
        
        {/* Tombol menu mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
          {menuOpen ? <X /> : <Menu />}
        </button>
        
        {/* Menu desktop */}
        <ul className="hidden md:flex gap-6 items-center">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 ${
                  pathname === item.href ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          
          {user && (
            <>
              <span className="text-gray-600">
                Hi, {user.name} 
                {role === "ADMIN" && <span className="ml-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Admin</span>}
              </span>
              <FormLogout />
            </>
          )}
        </ul>
      </div>
      
      {/* Menu mobile */}
      {menuOpen && (
        <ul className="md:hidden px-4 pb-4 space-y-2 bg-white">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`block text-gray-700 hover:text-blue-600 ${
                  pathname === item.href ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {user && (
            <li className="flex flex-col gap-2">
              <span className="text-gray-600">
                Hi, {user.name}
                {role === "ADMIN" && <span className="ml-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Admin</span>}
              </span>
              <FormLogout />
            </li>
          )}
        </ul>
      )}
    </nav>
  )
}