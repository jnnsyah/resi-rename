'use client'

import { useState } from 'react'
import { ResiUploader } from '@/components/features/resi-uploader'
import { ResiForm } from '@/components/features/resi-form'
import { ParsedResiData } from '@/types/resi'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CloudCheck 
} from 'lucide-react'

export default function HomePage() {
  const [parsedData, setParsedData] = useState<ParsedResiData | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  const handleParsed = (data: ParsedResiData, file: File) => {
    setParsedData(data)
    setCurrentFile(file)
  }

  const handleReset = () => {
    setParsedData(null)
    setCurrentFile(null)
  }

  return (
    <main className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/10 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Otomatisasi Resi Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rename & Backup Resi PDF Marketplace
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Upload PDF resi marketplace (Shopee, Tokopedia, TikTok Shop). Sistem secara otomatis membaca teks, mengurutkan nomor penamaan file, mendownload file baru, dan mem-backup ke Google Drive.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="mt-6 pt-6 border-t border-indigo-700/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-indigo-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Parsing Resi Otomatis</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudCheck className="w-4 h-4 text-emerald-400" />
              <span>Auto Backup Drive</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Log Database Supabase</span>
            </div>
          </div>
        </div>

        {/* Workflow steps container */}
        <div className="space-y-6">
          {/* Step 1: Upload */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Upload PDF Resi Marketplace
                </h2>
              </div>
              {parsedData && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Upload Lain</span>
                </Button>
              )}
            </div>

            <ResiUploader onParsed={handleParsed} />
          </section>

          {/* Step 2: Form Editor (Tampil jika PDF sudah di-parse) */}
          {parsedData && currentFile && (
            <section className="space-y-3 pt-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Periksa & Lengkapi Data
                </h2>
              </div>

              <ResiForm initialData={parsedData} file={currentFile} onSuccess={handleReset} />
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
