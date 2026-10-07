// 優先播放預錄的 mp3 音檔（audio/ 底下），失敗才退回瀏覽器內建的語音合成。
// 內建語音的部分不引用任何音檔或外部網址。

import { audioPathForItem } from "./audio-path.js";

export function canSpeak() {
  return (
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
  );
}

export function speak(text) {
  if (!canSpeak()) return false;
  try {
    const voices = speechSynthesis.getVoices();
    // 語音清單已經載入、但裡面一個日文語音都沒有 → 不要唸，使用者只會聽到別的語言。
    if (voices.length > 0) {
      const ja = voices.find((v) => v.lang && v.lang.startsWith("ja"));
      if (!ja) return false;
    }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = 0.8;
    // 清單是空的時候（iPhone 第一次呼叫常見），只靠 lang 讓瀏覽器自己挑。
    if (voices.length > 0) {
      const ja = voices.find((v) => v.lang && v.lang.startsWith("ja"));
      if (ja) utter.voice = ja;
    }
    speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

// ---- 預錄音檔 ----

// 整個模組共用同一個 Audio 物件。iPhone 對同一個物件只需要一次使用者點擊授權。
let sharedAudio = null;
// 目前這一次播放的狀態。連點時舊的 error 事件靠 path 判斷「不是我的」就忽略。
let currentCall = null;

function stopInnerVoice() {
  if (!canSpeak()) return;
  try {
    speechSynthesis.cancel();
  } catch {
    // 這個瀏覽器不支援取消就略過，內建語音那邊自己也有 try/catch。
  }
}

// 後備流程：先用內建語音唸；唸不出來才通知呼叫者顯示提示。
// 同一次呼叫只准走一次，用 currentCall.used 擋住。
function fallback(call, char, onFail) {
  if (call.used) return;
  call.used = true;
  if (speak(char) === false && typeof onFail === "function") onFail();
}

// 播放某個假名的預錄音檔；失敗才退回內建語音。
// item 是資料裡的字物件。音檔路徑交給 audioPathForItem 決定（純函式、可測試）。
export function playKana(item, onFail) {
  const char = item.char;
  const path = audioPathForItem(item);
  const call = { path: path, used: false, char: char, onFail: onFail };
  currentCall = call;

  stopInnerVoice();

  // 不管走哪條路，先讓上一個音檔停下來。
  if (sharedAudio) {
    try {
      sharedAudio.pause();
    } catch {
      // 停不下來就算了，後面的判斷會照常走。
    }
  }

  if (!window.Audio || path === null) {
    fallback(call, char, onFail);
    return;
  }

  if (!sharedAudio) {
    try {
      sharedAudio = new Audio();
    } catch {
      sharedAudio = null;
    }
    if (sharedAudio) {
      // 只掛一次，事件到了再看 src 的尾端是不是目前這一次的音檔。
      sharedAudio.addEventListener("error", () => {
        if (!currentCall) return;
        // 舊音檔晚到的錯誤，不理它。
        const src = String(sharedAudio.src || "");
        const tail = currentCall.path ? src.length - currentCall.path.length : -1;
        if (src.lastIndexOf(currentCall.path || "@") !== tail) return;
        fallback(currentCall, currentCall.char, currentCall.onFail);
      });
    }
  }
  if (!sharedAudio) {
    fallback(call, char, onFail);
    return;
  }

  try {
    sharedAudio.pause();
    sharedAudio.src = path;
  } catch {
    fallback(call, char, onFail);
    return;
  }

  try {
    const playing = sharedAudio.play();
    // 舊瀏覽器的 play() 可能回傳 undefined，先確認有沒有再接。
    if (playing && typeof playing.catch === "function") {
      playing.catch(() => {
        if (currentCall === call) fallback(call, char, onFail);
      });
    }
  } catch {
    fallback(call, char, onFail);
  }
}

// 離開字卡時呼叫：停掉預錄音檔與內建語音。
// 清掉 currentCall 之後，晚到的 error 事件也不會再唸出上一張的字。
export function stopKana() {
  currentCall = null;
  if (sharedAudio) {
    try {
      sharedAudio.pause();
    } catch {
      // 停不下來就算了。
    }
  }
  stopInnerVoice();
}

// 語音清單常常晚一步才載入。先叫一次，再掛一個事件，兩次都叫。
(function primeVoices() {
  if (!canSpeak()) return;
  try {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => {
      try {
        speechSynthesis.getVoices();
      } catch {
        // 拿不到就算了，speak() 裡也有 try/catch。
      }
    });
  } catch {
    // 這個瀏覽器不支援就直接略過。
  }
})();
