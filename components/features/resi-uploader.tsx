'use client'

import React, { useState } from 'react'
import { extractTextFromPDF, parseResiPDF } from '@/lib/pdf-parser'
import { ParsedResiData } from '@/types/resi'
import { toast } from '@/components/ui/toast'
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

interface ResiUploaderProps {
  onParsed: (data: ParsedResiData, file: File) => void
}

export function ResiUploader({ onParsed }: ResiUploaderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const handleFileChange = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.add({
        title: 'Format File Salah',
        description: 'Harap upload file berformat PDF resi marketplace.',
        type: 'error',
      })
      return
    }

    setIsLoading(true)
    setUploadedFileName(file.name)

    try {
      const rawText = await extractTextFromPDF(file)
      const parsedData = parseResiPDF(rawText)

      onParsed(parsedData, file)

      const mktName = parsedData.marketplace.toUpperCase()
      toast.add({
        title: 'PDF Berhasil Dibaca!',
        description: `Marketplace terdeteksi: ${mktName}`,
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      toast.add({
        title: 'Gagal Membaca PDF',
        description: 'Tidak dapat mengekstrak teks dari PDF resi.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsHovered(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsHovered(true)
      }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 bg-white ${
        isHovered
          ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100 scale-[1.005]'
          : 'border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        id="pdf-upload"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
      />
      <label htmlFor="pdf-upload" className="cursor-pointer space-y-4 block">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-indigo-600" />
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {isLoading ? 'Membaca Teks PDF Resi...' : 'Klik atau Drag & Drop PDF Resi'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload file resi PDF asli dari Shopee, Tokopedia, atau TikTok Shop untuk di-parse secara otomatis.
          </p>
        </div>

        {/* Supported Marketplaces badges */}
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-[11px] font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Shopee
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Tokopedia
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            TikTok Shop
          </span>
        </div>
      </label>
    </div>
  )
}
