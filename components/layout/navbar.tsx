'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { History, PlusCircle } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-center">
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              pathname === '/'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generator</span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              pathname === '/history'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Log</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

