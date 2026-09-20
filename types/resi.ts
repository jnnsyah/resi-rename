export interface ParsedResiData {
  orderDate: string;        // Format YYYY-MM-DD
  buyerName: string;        // Nama Penerima
  trackingNumber?: string;  // No Resi / AWB (Opsional)
  productName?: string;     // Nama Produk Mentah dari PDF
  variantRaw?: string;      // Variasi/Warna Mentah dari PDF
  marketplace: 'shopee' | 'tokopedia' | 'tiktok' | 'unknown';
}

export interface ResiFormInputs {
  orderDate: string;
  buyerName: string;
  trackingNumber: string;
  productCode: string;     // Kode Produk Baku (misal: MR)
  variantColor: string;    // Warna Baku (misal: GREY)
  notes: string;           // Catatan Opsional
}

export interface ResiLogRecord {
  id?: string;
  created_at?: string;
  order_date: string;
  buyer_name: string;
  tracking_number?: string;
  product_code: string;
  variant_color: string;
  daily_sequence_id: string; // 3-digit padding (001, 002, dst)
  generated_filename: string;
  drive_file_id?: string;
  drive_file_url?: string;
  notes?: string;
}
