import * as pdfjsLib from 'pdfjs-dist';
import { ParsedResiData } from '@/types/resi';

// Set worker src dari CDN untuk client-side parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export function parseResiPDF(rawText: string): ParsedResiData {
  // 1. Parser Shopee
  if (rawText.includes('Shopee') || rawText.includes('No. Pesanan:')) {
    const trackingNumber = rawText.match(/No\. Resi:\s*([A-Za-z0-9]+)/)?.[1] || '';
    const buyerName = rawText.match(/Penerima:\s*([^\n]+)/)?.[1]?.trim() || '';
    const orderNo = rawText.match(/No\. Pesanan:\s*([A-Za-z0-9]+)/)?.[1] || '';
    
    // Ekstrak Tanggal YYMMDD dari awal No Pesanan (misal: 260912...)
    let orderDate = new Date().toISOString().split('T')[0];
    if (orderNo.length >= 6) {
      const yy = '20' + orderNo.substring(0, 2);
      const mm = orderNo.substring(2, 4);
      const dd = orderNo.substring(4, 6);
      orderDate = `${yy}-${mm}-${dd}`;
    }

    const variantRaw = rawText.match(/Variasi\s*\n?\s*([^\n]+)/)?.[1]?.trim() || '';

    return {
      orderDate,
      buyerName,
      trackingNumber,
      variantRaw,
      marketplace: 'shopee',
    };
  }

  // 2. Parser TikTok Shop / Tokopedia
  if (rawText.includes('TT Order ID:') || rawText.includes('tokopedia')) {
    const trackingNumber = rawText.match(/(\d{12,15})/)?.[1] || '';
    const buyerName = rawText.match(/Penerima\s*\n?\s*([^\n]+)/)?.[1]?.trim() || '';
    
    // Cek pattern tanggal in transit (misal: 18/09/2026)
    const rawDate = rawText.match(/In transit by:\s*(\d{2}\/\d{2}\/\d{4})/)?.[1];
    let orderDate = new Date().toISOString().split('T')[0];
    if (rawDate) {
      const [dd, mm, yyyy] = rawDate.split('/');
      orderDate = `${yyyy}-${mm}-${dd}`;
    }

    return {
      orderDate,
      buyerName,
      trackingNumber,
      marketplace: rawText.includes('TT Order ID:') ? 'tiktok' : 'tokopedia',
    };
  }

  // Fallback jika format tidak terdeteksi
  return {
    orderDate: new Date().toISOString().split('T')[0],
    buyerName: '',
    trackingNumber: '',
    marketplace: 'unknown',
  };
}
