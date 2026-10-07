// 「怎麼記」聯想圖的檔名規則。純函式，不碰 window。

// 平假名區段的起訖碼位。只有落在這段裡的字才有聯想圖。
const HIRA_START = 0x3041;
const HIRA_END = 0x3096;

// 傳入一個字，回傳聯想圖的相對路徑。
// 規則：「mnemo/」＋四位小寫十六進位碼位＋「.jpg」（例：あ → mnemo/3042.jpg）。
// 不是平假名（片假名沒有聯想圖）、不是單一字、或不是字串，都回傳 null。
export function mnemoImagePathFor(char) {
  if (typeof char !== "string" || char.length !== 1) return null;
  const code = char.charCodeAt(0);
  if (code < HIRA_START || code > HIRA_END) return null;
  // 補滿四位。這個區段的碼位本來就滿四位，但補滿的寫法放著，改規則時也不會破。
  let hex = code.toString(16);
  while (hex.length < 4) hex = "0" + hex;
  return "mnemo/" + hex + ".jpg";
}
