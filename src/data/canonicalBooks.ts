/**
 * Canonical book metadata (names, IDs, order, chapter counts).
 *
 * This is the single source of truth for Meno's book identity. It contains no
 * Scripture text; verse content comes from the bundled ILT3 database.
 */
export interface CanonicalBookMeta {
  id: string;
  name: string;
  canonicalOrder: number;
  chapterCount: number;
}

const RAW_BOOKS: readonly [id: string, name: string, chapterCount: number][] = [
  ["kejadian", "Kejadian", 50],
  ["keluaran", "Keluaran", 40],
  ["imamat", "Imamat", 27],
  ["bilangan", "Bilangan", 36],
  ["ulangan", "Ulangan", 34],
  ["yosua", "Yosua", 24],
  ["hakim-hakim", "Hakim-hakim", 21],
  ["rut", "Rut", 4],
  ["1-samuel", "1 Samuel", 31],
  ["2-samuel", "2 Samuel", 24],
  ["1-raja-raja", "1 Raja-raja", 22],
  ["2-raja-raja", "2 Raja-raja", 25],
  ["1-tawarikh", "1 Tawarikh", 29],
  ["2-tawarikh", "2 Tawarikh", 36],
  ["ezra", "Ezra", 10],
  ["nehemia", "Nehemia", 13],
  ["ester", "Ester", 10],
  ["ayub", "Ayub", 42],
  ["mazmur", "Mazmur", 150],
  ["amsal", "Amsal", 31],
  ["pengkhotbah", "Pengkhotbah", 12],
  ["kidung-agung", "Kidung Agung", 8],
  ["yesaya", "Yesaya", 66],
  ["yeremia", "Yeremia", 52],
  ["ratapan", "Ratapan", 5],
  ["yehezkiel", "Yehezkiel", 48],
  ["daniel", "Daniel", 12],
  ["hosea", "Hosea", 14],
  ["yoel", "Yoel", 3],
  ["amos", "Amos", 9],
  ["obaja", "Obaja", 1],
  ["yunus", "Yunus", 4],
  ["mikha", "Mikha", 7],
  ["nahum", "Nahum", 3],
  ["habakuk", "Habakuk", 3],
  ["zefanya", "Zefanya", 3],
  ["hagai", "Hagai", 2],
  ["zakharia", "Zakharia", 14],
  ["maleakhi", "Maleakhi", 4],
  ["matius", "Matius", 28],
  ["markus", "Markus", 16],
  ["lukas", "Lukas", 24],
  ["yohanes", "Yohanes", 21],
  ["kisah-para-rasul", "Kisah Para Rasul", 28],
  ["roma", "Roma", 16],
  ["1-korintus", "1 Korintus", 16],
  ["2-korintus", "2 Korintus", 13],
  ["galatia", "Galatia", 6],
  ["efesus", "Efesus", 6],
  ["filipi", "Filipi", 4],
  ["kolose", "Kolose", 4],
  ["1-tesalonika", "1 Tesalonika", 5],
  ["2-tesalonika", "2 Tesalonika", 3],
  ["1-timotius", "1 Timotius", 6],
  ["2-timotius", "2 Timotius", 4],
  ["titus", "Titus", 3],
  ["filemon", "Filemon", 1],
  ["ibrani", "Ibrani", 13],
  ["yakobus", "Yakobus", 5],
  ["1-petrus", "1 Petrus", 5],
  ["2-petrus", "2 Petrus", 3],
  ["1-yohanes", "1 Yohanes", 5],
  ["2-yohanes", "2 Yohanes", 1],
  ["3-yohanes", "3 Yohanes", 1],
  ["yudas", "Yudas", 1],
  ["wahyu", "Wahyu", 22],
];

export const CANONICAL_BOOKS: readonly CanonicalBookMeta[] = RAW_BOOKS.map(
  ([id, name, chapterCount], index) => ({
    id,
    name,
    canonicalOrder: index + 1,
    chapterCount,
  }),
);
