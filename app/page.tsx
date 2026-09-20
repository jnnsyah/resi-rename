'use client'

import { useState } from 'react'
import { ResiUploader } from '@/components/features/resi-uploader'
import { ResiForm } from '@/components/features/resi-form'
import { ParsedResiData } from '@/types/resi'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Resi Renamer & Backup</h1>
            <p className="text-sm text-slate-500 mt-0.5">Automated PDF Parsing, Renaming, & Cloud Logging</p>
          </div>
          <Link href="/history">
            <Button variant="outline" size="sm" className="bg-white">
              📋 Lihat Riwayat
            </Button>
          </Link>
        </div>

        {/* Step 1: Upload */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">1. Upload File PDF Resi</h2>
            {parsedData && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-rose-600 hover:text-rose-700">
                Reset / File Lain
              </Button>
            )}
          </div>
          <ResiUploader onParsed={handleParsed} />
        </section>

        {/* Step 2: Form Editor (Tampil jika PDF sudah di-parse) */}
        {parsedData && currentFile && (
          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-semibold text-slate-700">2. Cek & Lengkapi Data</h2>
            <ResiForm initialData={parsedData} file={currentFile} onSuccess={handleReset} />
          </section>
        )}
      </div>
    </main>
  )
}
