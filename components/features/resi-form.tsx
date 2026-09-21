'use client'

import React, { useState } from 'react'
import { ParsedResiData, ResiFormInputs } from '@/types/resi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/client'
import { saveAs } from 'file-saver'
import { toast } from '@/components/ui/toast'
import { 
  Calendar, 
  User, 
  Hash, 
  Package, 
  Palette, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Download, 
  CloudUpload,
  Info
} from 'lucide-react'

interface ResiFormProps {
  initialData: ParsedResiData
  file: File
  onSuccess: () => void
}

export function ResiForm({ initialData, file, onSuccess }: ResiFormProps) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState<ResiFormInputs>({
    orderDate: initialData.orderDate || new Date().toISOString().split('T')[0],
    buyerName: initialData.buyerName || '',
    trackingNumber: initialData.trackingNumber || '',
    productCode: 'MR', // Default Kode Produk (misal: Meja Rias)
    variantColor: 'GREY', // Default Warna
    notes: '',
  })

  // Format tanggal YYMMDD
  const getFormattedYYMMDD = (dateStr: string) => {
    const cleanDate = dateStr.replace(/-/g, '')
    return cleanDate
  }

  // Live preview filename calculation
  const yyMMdd = getFormattedYYMMDD(form.orderDate || '')
  const cleanCode = (form.productCode || 'MR').trim().toUpperCase().replace(/\s+/g, '_')
  const cleanColor = (form.variantColor || 'GREY').trim().toUpperCase().replace(/\s+/g, '_')
  const livePreviewFilename = `${yyMMdd}-${cleanCode}-${cleanColor}-001.pdf`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Query Supabase: Hitung total resi pada tanggal ini
      const { count, error: countError } = await supabase
        .from('resi_logs')
        .select('*', { count: 'exact', head: true })
        .eq('order_date', form.orderDate)

      if (countError) throw countError

      // 2. Generate 3-digit Sequence ID (001, 002, dst)
      const nextSequence = (count || 0) + 1
      const dailySequenceId = String(nextSequence).padStart(3, '0')

      // 3. Susun Nama File Baru: YYMMDD-Kode_Produk-Warna-ID.pdf
      const generatedFilename = `${yyMMdd}-${cleanCode}-${cleanColor}-${dailySequenceId}.pdf`

      // 4. Download File PDF ke Perangkat Lokal
      const renamedFile = new File([file], generatedFilename, { type: 'application/pdf' })
      saveAs(renamedFile, generatedFilename)

      // 5. Upload File PDF ke Google Drive via Serverless API
      const driveFormData = new FormData()
      driveFormData.append('file', renamedFile)
      driveFormData.append('orderDate', form.orderDate)

      const driveRes = await fetch('/api/upload-drive', {
        method: 'POST',
        body: driveFormData,
      })

      const driveData = await driveRes.json()
      if (!driveRes.ok) throw new Error(driveData.error || 'Gagal upload ke Google Drive')

      // 6. Simpan Metadata Log ke Supabase
      const { error: insertError } = await supabase.from('resi_logs').insert({
        order_date: form.orderDate,
        buyer_name: form.buyerName,
        tracking_number: form.trackingNumber,
        product_code: cleanCode,
        variant_color: cleanColor,
        daily_sequence_id: dailySequenceId,
        generated_filename: generatedFilename,
        drive_file_id: driveData.fileId,
        drive_file_url: driveData.webViewLink,
        notes: form.notes,
      })

      if (insertError) throw insertError

      toast.add({
        title: 'Berhasil Diproses!',
        description: `File ${generatedFilename} berhasil di-download & dibackup ke Google Drive.`,
        type: 'success',
      })

      onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.add({
        title: 'Gagal Memproses Resi',
        description: err.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMarketplaceBadge = (marketplace: string) => {
    switch (marketplace) {
      case 'shopee':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5">Shopee</Badge>
      case 'tokopedia':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5">Tokopedia</Badge>
      case 'tiktok':
        return <Badge className="bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5">TikTok Shop</Badge>
      default:
        return <Badge variant="outline" className="uppercase font-bold text-[10px] px-2.5 py-0.5">{marketplace}</Badge>
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Extracted Header Info */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          {getMarketplaceBadge(initialData.marketplace)}
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
            <span className="truncate max-w-[220px] font-medium text-slate-700">{file.name}</span>
            <span className="text-slate-300">•</span>
            <span>{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Teks Ter-parse</span>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tanggal Pesanan</span>
          </label>
          <Input
            type="date"
            value={form.orderDate}
            onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Nama Pembeli</span>
          </label>
          <Input
            type="text"
            value={form.buyerName}
            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
            placeholder="Nama Penerima Resi"
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-indigo-600" />
            <span>No. Resi / AWB (Opsional)</span>
          </label>
          <Input
            type="text"
            value={form.trackingNumber}
            onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
            placeholder="No. Resi pengiriman"
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kode Produk (Baku)</span>
          </label>
          <Input
            type="text"
            value={form.productCode}
            onChange={(e) => setForm({ ...form, productCode: e.target.value })}
            placeholder="Contoh: MR, LMT, RAK"
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm uppercase font-mono"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span>Warna / Varian</span>
          </label>
          <Input
            type="text"
            value={form.variantColor}
            onChange={(e) => setForm({ ...form, variantColor: e.target.value })}
            placeholder="Contoh: GREY, WHITE, BLACK"
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm uppercase font-mono"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Catatan Opsional</span>
          </label>
          <Input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Catatan khusus kado, packing, dll..."
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Live Filename Preview Box */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Preview Nama File Baru:</span>
          </div>
          <div className="font-mono text-sm font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-200/80 inline-block shadow-xs">
            {livePreviewFilename}
          </div>
        </div>
        <div className="text-[11px] text-indigo-600/90 flex items-start gap-1 max-w-xs">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>No. urut akhir (001) akan digenerate otomatis berdasarkan total resi pada tanggal {form.orderDate}.</span>
        </div>
      </div>

      {/* Form Action */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses & Uploading...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4" />
              <span>Proses, Rename & Backup ke Drive</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
