// 學習進度的純邏輯。完全不碰 window，storage 由外面傳進來。

export const STORAGE_KEY = "nihongo.seen.v1";

export function loadSeen(storage) {
  let raw = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return new Set();
  }
  if (typeof raw !== "string") return new Set();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new Set();
  }
  if (!Array.isArray(parsed)) return new Set();
  const seen = new Set();
  for (const item of parsed) {
    if (typeof item === "string") seen.add(item);
  }
  return seen;
}

export function markSeen(storage, char) {
  const seen = loadSeen(storage);
  seen.add(char);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {
    // 存不進去就算了，這次仍然算看過
  }
  return seen;
}

export function isRowDone(row, seen) {
  return row.kana.every((k) => seen.has(k.char));
}
