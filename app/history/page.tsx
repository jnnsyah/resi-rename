'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ResiLogRecord } from '@/types/resi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  History, 
  Search, 
  ExternalLink, 
  FileText, 
  Calendar, 
  RefreshCw, 
  ArrowLeft, 
  CloudCheck, 
  Database,
  Users,
  CheckCircle2,
  Inbox
} from 'lucide-react'

export default function HistoryPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<ResiLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchHistory() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('resi_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) console.error(error)
    else setLogs(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Filter logs dynamically based on search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs
    const q = searchQuery.toLowerCase()
    return logs.filter(
      (log) =>
        log.generated_filename.toLowerCase().includes(q) ||
        log.buyer_name.toLowerCase().includes(q) ||
        log.product_code.toLowerCase().includes(q) ||
        log.variant_color.toLowerCase().includes(q) ||
        (log.tracking_number && log.tracking_number.toLowerCase().includes(q)) ||
        (log.notes && log.notes.toLowerCase().includes(q))
    )
  }, [logs, searchQuery])

  // Stat computations
  const totalCount = logs.length
  const uniqueBuyers = useMemo(() => new Set(logs.map((l) => l.buyer_name.trim().toLowerCase())).size, [logs])

  return (
    <main className="py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Riwayat Process Resi</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Catatan resi yang berhasil di-rename & tersimpan di Google Drive dan Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              disabled={isLoading}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Link href="/">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Ke Generator</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Resi Diproses</p>
              <p className="text-xl font-bold text-slate-800">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pembeli Unik</p>
              <p className="text-xl font-bold text-slate-800">{uniqueBuyers}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CloudCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Backup Google Drive</p>
              <p className="text-xl font-bold text-emerald-600">Aktif & Terhubung</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari berdasarkan nama pembeli, nama file, kode produk, atau varian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50/50 border-slate-200 text-sm focus:bg-white"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Reset Search
            </Button>
          )}
        </div>

        {/* Data Table Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/80">
              <TableRow>
                <TableHead className="w-[120px] font-semibold text-slate-700">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700">Nama File Baru</TableHead>
                <TableHead className="font-semibold text-slate-700">Pembeli</TableHead>
                <TableHead className="font-semibold text-slate-700">Kode & Warna</TableHead>
                <TableHead className="font-semibold text-slate-700">Catatan</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Google Drive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <p className="text-sm font-medium">Memuat data riwayat resi...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">
                        {searchQuery ? 'Tidak ada resi yang cocok dengan pencarian.' : 'Belum ada riwayat transaksi resi.'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {searchQuery ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Upload resi baru pada halaman Generator untuk memulai.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-600">
                      {log.order_date}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-indigo-900">
                      {log.generated_filename}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 text-sm">
                      {log.buyer_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {log.product_code}
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono text-[10px]">
                          {log.variant_color}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[180px] truncate">
                      {log.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.drive_file_url ? (
                        <a href={log.drive_file_url} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50 h-8 font-medium"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Table Footer info */}
          {!isLoading && filteredLogs.length > 0 && (
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
              <span>Menampilkan {filteredLogs.length} dari {logs.length} data resi</span>
              <span>Terurut berdasarkan tanggal terbaru</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
