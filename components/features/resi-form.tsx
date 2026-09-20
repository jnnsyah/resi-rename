'use client'

import React, { useState, useEffect } from 'react'
import { ParsedResiData, ResiFormInputs } from '@/types/resi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/client'
import { saveAs } from 'file-saver'
import { toast } from '@/components/ui/toast'

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
    return cleanDate // '20260912'
  }

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
      const yyMMdd = getFormattedYYMMDD(form.orderDate)
      const cleanCode = form.productCode.trim().toUpperCase().replace(/\s+/g, '_')
      const cleanColor = form.variantColor.trim().toUpperCase().replace(/\s+/g, '_')
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
        description: `File ${generatedFilename} di-download & tersimpan di Google Drive.`,
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

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase font-bold">
            {initialData.marketplace}
          </Badge>
          <span className="text-xs font-mono text-slate-500">{file.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Tanggal Pesanan</label>
          <Input
            type="date"
            value={form.orderDate}
            onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Pembeli</label>
          <Input
            type="text"
            value={form.buyerName}
            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
            placeholder="Nama Penerima"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Kode Produk (Baku)</label>
          <Input
            type="text"
            value={form.productCode}
            onChange={(e) => setForm({ ...form, productCode: e.target.value })}
            placeholder="Contoh: MR"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Warna / Varian</label>
          <Input
            type="text"
            value={form.variantColor}
            onChange={(e) => setForm({ ...form, variantColor: e.target.value })}
            placeholder="Contoh: GREY"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">Catatan Opsional</label>
        <Input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Catatan khusus packing / kado..."
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
          {isSubmitting ? 'Memproses & Upload...' : 'Proses, Rename & Backup'}
        </Button>
      </div>
    </form>
  )
}
