'use client'

import { useState } from 'react'
import { ResiUploader } from '@/components/features/resi-uploader'
import { ResiForm } from '@/components/features/resi-form'
import { ParsedResiData } from '@/types/resi'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Box Container */}
        <div className="space-y-3">
          {parsedData && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset / Upload Lain</span>
              </Button>
            </div>
          )}

          <ResiUploader onParsed={handleParsed} />
        </div>

        {/* Form Editor (Tampil jika PDF sudah di-parse) */}
        {parsedData && currentFile && (
          <div className="pt-2 animate-in fade-in-50 duration-300">
            <ResiForm initialData={parsedData} file={currentFile} onSuccess={handleReset} />
          </div>
        )}
      </div>
    </main>
  )
}

