// 平假名的濁音、半濁音與拗音。格式與 hiragana.js 的 ROWS 相同。
// approx 為 true 表示注音只是接近的音（日文的濁音在注音裡沒有完全對應的音）。
// 此檔由 orchestrator 用腳本產生，請勿手改。

export const DAKUON_ROWS = [
  {
    id: "ga",
    label: "が行",
    kana: [
      { char: "が", romaji: "ga", zhuyin: "ㄍㄚ", approx: true },
      { char: "ぎ", romaji: "gi", zhuyin: "ㄍㄧ", approx: true },
      { char: "ぐ", romaji: "gu", zhuyin: "ㄍㄨ", approx: true },
      { char: "げ", romaji: "ge", zhuyin: "ㄍㄝ", approx: true },
      { char: "ご", romaji: "go", zhuyin: "ㄍㄛ", approx: true },
    ],
  },
  {
    id: "za",
    label: "ざ行",
    kana: [
      { char: "ざ", romaji: "za", zhuyin: "ㄗㄚ", approx: true },
      { char: "じ", romaji: "ji", zhuyin: "ㄐㄧ", approx: true },
      { char: "ず", romaji: "zu", zhuyin: "ㄗ", approx: true },
      { char: "ぜ", romaji: "ze", zhuyin: "ㄗㄝ", approx: true },
      { char: "ぞ", romaji: "zo", zhuyin: "ㄗㄛ", approx: true },
    ],
  },
  {
    id: "da",
    label: "だ行",
    kana: [
      { char: "だ", romaji: "da", zhuyin: "ㄉㄚ", approx: true },
      { char: "ぢ", romaji: "ji", zhuyin: "ㄐㄧ", approx: true },
      { char: "づ", romaji: "zu", zhuyin: "ㄗ", approx: true },
      { char: "で", romaji: "de", zhuyin: "ㄉㄝ", approx: true },
      { char: "ど", romaji: "do", zhuyin: "ㄉㄛ", approx: true },
    ],
  },
  {
    id: "ba",
    label: "ば行",
    kana: [
      { char: "ば", romaji: "ba", zhuyin: "ㄅㄚ", approx: true },
      { char: "び", romaji: "bi", zhuyin: "ㄅㄧ", approx: true },
      { char: "ぶ", romaji: "bu", zhuyin: "ㄅㄨ", approx: true },
      { char: "べ", romaji: "be", zhuyin: "ㄅㄝ", approx: true },
      { char: "ぼ", romaji: "bo", zhuyin: "ㄅㄛ", approx: true },
    ],
  },
  {
    id: "pa",
    label: "ぱ行",
    kana: [
      { char: "ぱ", romaji: "pa", zhuyin: "ㄆㄚ", approx: false },
      { char: "ぴ", romaji: "pi", zhuyin: "ㄆㄧ", approx: false },
      { char: "ぷ", romaji: "pu", zhuyin: "ㄆㄨ", approx: false },
      { char: "ぺ", romaji: "pe", zhuyin: "ㄆㄝ", approx: false },
      { char: "ぽ", romaji: "po", zhuyin: "ㄆㄛ", approx: false },
    ],
  },
];

export const YOON_ROWS = [
  {
    id: "kya",
    label: "きゃ行",
    kana: [
      { char: "きゃ", romaji: "kya", zhuyin: "ㄎㄧㄚ", approx: false },
      { char: "きゅ", romaji: "kyu", zhuyin: "ㄎㄧㄨ", approx: false },
      { char: "きょ", romaji: "kyo", zhuyin: "ㄎㄧㄛ", approx: false },
    ],
  },
  {
    id: "sha",
    label: "しゃ行",
    kana: [
      { char: "しゃ", romaji: "sha", zhuyin: "ㄒㄧㄚ", approx: false },
      { char: "しゅ", romaji: "shu", zhuyin: "ㄒㄧㄨ", approx: false },
      { char: "しょ", romaji: "sho", zhuyin: "ㄒㄧㄛ", approx: false },
    ],
  },
  {
    id: "cha",
    label: "ちゃ行",
    kana: [
      { char: "ちゃ", romaji: "cha", zhuyin: "ㄑㄧㄚ", approx: false },
      { char: "ちゅ", romaji: "chu", zhuyin: "ㄑㄧㄨ", approx: false },
      { char: "ちょ", romaji: "cho", zhuyin: "ㄑㄧㄛ", approx: false },
    ],
  },
  {
    id: "nya",
    label: "にゃ行",
    kana: [
      { char: "にゃ", romaji: "nya", zhuyin: "ㄋㄧㄚ", approx: false },
      { char: "にゅ", romaji: "nyu", zhuyin: "ㄋㄧㄨ", approx: false },
      { char: "にょ", romaji: "nyo", zhuyin: "ㄋㄧㄛ", approx: false },
    ],
  },
  {
    id: "hya",
    label: "ひゃ行",
    kana: [
      { char: "ひゃ", romaji: "hya", zhuyin: "ㄏㄧㄚ", approx: false },
      { char: "ひゅ", romaji: "hyu", zhuyin: "ㄏㄧㄨ", approx: false },
      { char: "ひょ", romaji: "hyo", zhuyin: "ㄏㄧㄛ", approx: false },
    ],
  },
  {
    id: "mya",
    label: "みゃ行",
    kana: [
      { char: "みゃ", romaji: "mya", zhuyin: "ㄇㄧㄚ", approx: false },
      { char: "みゅ", romaji: "myu", zhuyin: "ㄇㄧㄨ", approx: false },
      { char: "みょ", romaji: "myo", zhuyin: "ㄇㄧㄛ", approx: false },
    ],
  },
  {
    id: "rya",
    label: "りゃ行",
    kana: [
      { char: "りゃ", romaji: "rya", zhuyin: "ㄌㄧㄚ", approx: true },
      { char: "りゅ", romaji: "ryu", zhuyin: "ㄌㄧㄨ", approx: true },
      { char: "りょ", romaji: "ryo", zhuyin: "ㄌㄧㄛ", approx: true },
    ],
  },
  {
    id: "gya",
    label: "ぎゃ行",
    kana: [
      { char: "ぎゃ", romaji: "gya", zhuyin: "ㄍㄧㄚ", approx: true },
      { char: "ぎゅ", romaji: "gyu", zhuyin: "ㄍㄧㄨ", approx: true },
      { char: "ぎょ", romaji: "gyo", zhuyin: "ㄍㄧㄛ", approx: true },
    ],
  },
  {
    id: "ja",
    label: "じゃ行",
    kana: [
      { char: "じゃ", romaji: "ja", zhuyin: "ㄐㄧㄚ", approx: true },
      { char: "じゅ", romaji: "ju", zhuyin: "ㄐㄧㄨ", approx: true },
      { char: "じょ", romaji: "jo", zhuyin: "ㄐㄧㄛ", approx: true },
    ],
  },
  {
    id: "bya",
    label: "びゃ行",
    kana: [
      { char: "びゃ", romaji: "bya", zhuyin: "ㄅㄧㄚ", approx: true },
      { char: "びゅ", romaji: "byu", zhuyin: "ㄅㄧㄨ", approx: true },
      { char: "びょ", romaji: "byo", zhuyin: "ㄅㄧㄛ", approx: true },
    ],
  },
  {
    id: "pya",
    label: "ぴゃ行",
    kana: [
      { char: "ぴゃ", romaji: "pya", zhuyin: "ㄆㄧㄚ", approx: false },
      { char: "ぴゅ", romaji: "pyu", zhuyin: "ㄆㄧㄨ", approx: false },
      { char: "ぴょ", romaji: "pyo", zhuyin: "ㄆㄧㄛ", approx: false },
    ],
  },
];
