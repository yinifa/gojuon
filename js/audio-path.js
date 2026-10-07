// 由字算出預錄音檔的相對路徑。純函式，不碰 window，測試可以直接跑。

// 音檔命名：audio/<該字 Unicode 碼位，4 位小寫十六進位>.mp3
// 拗音是兩個字，兩段碼位用「-」相連（きゃ → audio/304d-3083.mp3）。
export function audioPathFor(text) {
  if (typeof text !== "string") return null;
  if (text.length !== 1 && text.length !== 2) return null;

  let name = "";
  for (let i = 0; i < text.length; i += 1) {
    let hex = text.charCodeAt(i).toString(16);
    // 舊手機沒有內建的補零函式，自己補零到 4 位。
    while (hex.length < 4) hex = "0" + hex;
    if (i > 0) name += "-";
    name += hex;
  }

  // 相對路徑，開頭沒有斜線，網站放在子目錄底下也找得到。
  return "audio/" + name + ".mp3";
}

// 由資料裡的字物件直接算出音檔路徑。片假名的音檔跟平假名共用，
// 所以優先用 audio（平假名），沒有才用 char。
// 純函式，不碰 window，測試可以直接跑。
export function audioPathForItem(item) {
  if (!item || typeof item !== "object") return null;
  return audioPathFor(item.audio || item.char);
}
