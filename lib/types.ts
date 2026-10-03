// Tipe data untuk Lembaran Kenangan

export type FrameType =
  | 'none'
  | 'classic'
  | 'gold'
  | 'walnut'
  | 'polaroid'
  | 'vintage_print';

export type FilterType = 'original' | 'sepia' | 'bw' | 'faded';

export type PaperType = 'ivory' | 'aged' | 'lined' | 'letter' | 'torn';

export type FontType = 'serif' | 'italic' | 'script';

export type InkType = 'brown' | 'black' | 'blue' | 'wine';

export type DecorationType = 'none' | 'tape' | 'pin';

export type NoteKind = 'poem' | 'quote' | 'note';

export interface Photo {
  id: string;
  user_id?: string;
  storage_path: string;
  public_url: string;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  memory_date?: string | null;
  frame: FrameType;
  filter: FilterType;
  rotation?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  user_id?: string;
  kind: NoteKind;
  title?: string | null;
  body: string;
  author?: string | null;
  paper: PaperType;
  font: FontType;
  ink: InkType;
  decoration: DecorationType;
  rotation?: number;
  created_at?: string;
  updated_at?: string;
}
