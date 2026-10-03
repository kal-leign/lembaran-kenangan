import { Photo, Note } from '@/lib/types';

export const INITIAL_SAMPLE_PHOTOS: Photo[] = [
  {
    id: 'sample-1',
    storage_path: 'samples/library.jpg',
    public_url: 'https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    caption: 'Di antara deretan buku tua yang menyimpan debu dan rahasia waktu',
    memory_date: '2024-05-18',
    frame: 'walnut',
    filter: 'sepia',
    rotation: -0.8,
    created_at: '2024-05-18T10:00:00Z',
  },
  {
    id: 'sample-2',
    storage_path: 'samples/window.jpg',
    public_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 900,
    caption: 'Cahaya pagi merayap pelan di jendela kamar tidur',
    memory_date: '2024-06-22',
    frame: 'classic',
    filter: 'faded',
    rotation: 0.6,
    created_at: '2024-06-22T08:30:00Z',
  },
  {
    id: 'sample-3',
    storage_path: 'samples/coffee.jpg',
    public_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    caption: 'Secangkir kopi hangat saat senja mulai dingin',
    memory_date: '2024-08-10',
    frame: 'polaroid',
    filter: 'sepia',
    rotation: -1.2,
    created_at: '2024-08-10T17:15:00Z',
  },
  {
    id: 'sample-4',
    storage_path: 'samples/vintage-camera.jpg',
    public_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    caption: 'Kamera mekanik tua peninggalan kakek',
    memory_date: '2024-09-03',
    frame: 'gold',
    filter: 'bw',
    rotation: 0.9,
    created_at: '2024-09-03T14:20:00Z',
  },
  {
    id: 'sample-5',
    storage_path: 'samples/typewriter.jpg',
    public_url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    caption: 'Ketukan tuts mesin tik di tengah malam sunyi',
    memory_date: '2024-11-15',
    frame: 'vintage_print',
    filter: 'original',
    rotation: -0.5,
    created_at: '2024-11-15T23:05:00Z',
  },
  {
    id: 'sample-6',
    storage_path: 'samples/dry-flowers.jpg',
    public_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    caption: 'Kuntum bunga kering yang diselipkan dalam buku catatan',
    memory_date: '2025-01-04',
    frame: 'none',
    filter: 'faded',
    rotation: 0.4,
    created_at: '2025-01-04T11:45:00Z',
  },
];

export const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: 'note-sample-1',
    kind: 'poem',
    title: 'Hujan Bulan Juni',
    body: `tak ada yang lebih tabah
dari hujan bulan juni
dirahasiakannya rintik rindunya
kepada pohon berbunga itu

tak ada yang lebih bijak
dari hujan bulan juni
dihapuskannya jejak-jejak kakinya
yang ragu-ragu di jalan itu

tak ada yang lebih arif
dari hujan bulan juni
dibiarkannya yang tak terucapkan
diserap akar pohon bunga itu`,
    author: 'Sapardi Djoko Damono',
    paper: 'aged',
    font: 'serif',
    ink: 'brown',
    decoration: 'tape',
    rotation: -0.9,
    created_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'note-sample-2',
    kind: 'quote',
    title: null,
    body: `Aku ingin mencintaimu dengan sederhana; dengan kata yang tak sempat diucapkan kayu kepada api yang menjadikannya abu.`,
    author: 'Sapardi Djoko Damono',
    paper: 'letter',
    font: 'script',
    ink: 'wine',
    decoration: 'pin',
    rotation: 1.1,
    created_at: '2024-07-14T09:00:00Z',
  },
  {
    id: 'note-sample-3',
    kind: 'poem',
    title: 'Derai-Derai Cemara',
    body: `Cemara menderai sampai jauh
terasa hari akan jadi malam
ada beberapa dahan di tingkap merapuh
dipukul angin yang terpendam

Aku sekarang orangnya tenang
ada juga kelepak elang
menyinggung muram, desir hari lari berenang
menemu bujuk pangkal akanan`,
    author: 'Chairil Anwar',
    paper: 'lined',
    font: 'italic',
    ink: 'blue',
    decoration: 'tape',
    rotation: 0.7,
    created_at: '2024-08-20T16:00:00Z',
  },
  {
    id: 'note-sample-4',
    kind: 'note',
    title: 'Sebuah Ingatan Kecil',
    body: `Membuka kembali lembar demi lembar album lama terasa seperti melangkah tanpa alas kaki di atas lantai kayu tua. Ada kehangatan yang tak terdefinisikan, aroma kertas usang, dan detak jarum jam dinding yang setia menemani lamunan.`,
    author: 'Catatan Pribadi',
    paper: 'torn',
    font: 'serif',
    ink: 'black',
    decoration: 'none',
    rotation: -0.6,
    created_at: '2024-10-05T20:30:00Z',
  },
];
