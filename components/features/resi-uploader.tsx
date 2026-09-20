'use client'

import React, { useState } from 'react'
import { extractTextFromPDF, parseResiPDF } from '@/lib/pdf-parser'
import { ParsedResiData } from '@/types/resi'
import { toast } from '@/components/ui/toast'

interface ResiUploaderProps {
  onParsed: (data: ParsedResiData, file: File) => void
}

export function ResiUploader({ onParsed }: ResiUploaderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    try {
      const rawText = await extractTextFromPDF(file)
      const parsedData = parseResiPDF(rawText)

      onParsed(parsedData, file)

      toast.add({
        title: 'PDF Berhasil Dibaca!',
        description: `Marketplace terdeteksi: ${parsedData.marketplace.toUpperCase()}`,
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
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-white ${
        isHovered ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        id="pdf-upload"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
      />
      <label htmlFor="pdf-upload" className="cursor-pointer space-y-3 block">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          {isLoading ? '⏳' : '📄'}
        </div>
        <div>
          <p className="font-semibold text-slate-800">
            {isLoading ? 'Membaca Teks PDF...' : 'Klik atau Drag & Drop PDF Resi ke Sini'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Mendukung resi PDF Shopee, Tokopedia, & TikTok Shop</p>
        </div>
      </label>
    </div>
  )
}
