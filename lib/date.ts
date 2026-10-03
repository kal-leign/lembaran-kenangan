// Helper pemformat tanggal dalam Bahasa Indonesia bernuansa puitis/hangat

const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr) return '';

  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return `${day} ${BULAN_INDONESIA[month]} ${year}`;
      }
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr || '';
  }
}

export function formatTahun(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length > 0 && parts[0].length === 4) {
      return parts[0];
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.getFullYear().toString();
  } catch {
    return '';
  }
}
