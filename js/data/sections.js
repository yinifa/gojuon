// 四個學習區（平假名清音／濁音半濁音／拗音／片假名）與查詢用的小函式。
// 純資料與純函式，不碰 window，node --test 可以直接載入。

import { ROWS } from "./hiragana.js";
import { DAKUON_ROWS, YOON_ROWS } from "./hiragana-extra.js";

// 平假名區段的起訖碼位。落在這段裡的字元才需要換成片假名。
const HIRA_START = 0x3041;
const HIRA_END = 0x3096;
// 平假名 → 片假名的固定差值。
const HIRA_TO_KATA = 0x60;

// 把字串裡的平假名字元換成片假名，其他字元（例如「が行」裡的「が」）原樣保留。
export function toKatakana(text) {
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    out += String.fromCharCode(
      code >= HIRA_START && code <= HIRA_END ? code + HIRA_TO_KATA : code
    );
  }
  return out;
}

// 把一組平假名的行換成片假名的行。
// 每個字多帶 audio（發音用的平假名）與 pair（字卡上顯示的平假名）。
function toKataRows(rows) {
  return rows.map((row) => ({
    id: "k-" + row.id,
    label: toKatakana(row.label),
    kana: row.kana.map((k) => ({
      char: toKatakana(k.char),
      romaji: k.romaji,
      zhuyin: k.zhuyin,
      approx: k.approx,
      audio: k.char,
      pair: k.char,
    })),
  }));
}

export const SECTIONS = [
  {
    id: "hira-seion",
    title: "平假名",
    subtitle: "清音",
    groups: [{ title: "", rows: ROWS }],
  },
  {
    id: "hira-dakuon",
    title: "平假名",
    subtitle: "濁音・半濁音",
    groups: [{ title: "", rows: DAKUON_ROWS }],
  },
  {
    id: "hira-yoon",
    title: "平假名",
    subtitle: "拗音",
    groups: [{ title: "", rows: YOON_ROWS }],
  },
  {
    id: "kata",
    title: "片假名",
    subtitle: "清音・濁音・拗音",
    groups: [
      { title: "清音", rows: toKataRows(ROWS) },
      { title: "濁音・半濁音", rows: toKataRows(DAKUON_ROWS) },
      { title: "拗音", rows: toKataRows(YOON_ROWS) },
    ],
  },
];

export function findSection(sectionId) {
  return SECTIONS.find((s) => s.id === sectionId) || null;
}

export function sectionRows(section) {
  // 用 reduce 展開，不要用 iOS 12.0／12.1 的 Safari 沒有的一級寫法。
  return section.groups.reduce((acc, g) => acc.concat(g.rows), []);
}

// 找一行，回傳它屬於哪一區。找不到回傳 null。
export function findRow(rowId) {
  for (const section of SECTIONS) {
    for (const group of section.groups) {
      const row = group.rows.find((r) => r.id === rowId);
      if (row) return { section, row };
    }
  }
  return null;
}
