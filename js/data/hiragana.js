// 平假名 46 音資料。內容照 T-01 工單第 2 節的表格逐字填入。
// approx: true 表示注音只是接近的音，聽到的才算準。

export const ROWS = [
  {
    id: "a",
    label: "あ行",
    kana: [
      { char: "あ", romaji: "a", zhuyin: "ㄚ", approx: false },
      { char: "い", romaji: "i", zhuyin: "ㄧ", approx: false },
      { char: "う", romaji: "u", zhuyin: "ㄨ", approx: true },
      { char: "え", romaji: "e", zhuyin: "ㄝ", approx: false },
      { char: "お", romaji: "o", zhuyin: "ㄛ", approx: false },
    ],
  },
  {
    id: "ka",
    label: "か行",
    kana: [
      { char: "か", romaji: "ka", zhuyin: "ㄎㄚ", approx: false },
      { char: "き", romaji: "ki", zhuyin: "ㄎㄧ", approx: false },
      { char: "く", romaji: "ku", zhuyin: "ㄎㄨ", approx: false },
      { char: "け", romaji: "ke", zhuyin: "ㄎㄝ", approx: false },
      { char: "こ", romaji: "ko", zhuyin: "ㄎㄛ", approx: false },
    ],
  },
  {
    id: "sa",
    label: "さ行",
    kana: [
      { char: "さ", romaji: "sa", zhuyin: "ㄙㄚ", approx: false },
      { char: "し", romaji: "shi", zhuyin: "ㄒㄧ", approx: false },
      { char: "す", romaji: "su", zhuyin: "ㄙ", approx: true },
      { char: "せ", romaji: "se", zhuyin: "ㄙㄝ", approx: false },
      { char: "そ", romaji: "so", zhuyin: "ㄙㄛ", approx: false },
    ],
  },
  {
    id: "ta",
    label: "た行",
    kana: [
      { char: "た", romaji: "ta", zhuyin: "ㄊㄚ", approx: false },
      { char: "ち", romaji: "chi", zhuyin: "ㄑㄧ", approx: false },
      { char: "つ", romaji: "tsu", zhuyin: "ㄘ", approx: true },
      { char: "て", romaji: "te", zhuyin: "ㄊㄝ", approx: false },
      { char: "と", romaji: "to", zhuyin: "ㄊㄛ", approx: false },
    ],
  },
  {
    id: "na",
    label: "な行",
    kana: [
      { char: "な", romaji: "na", zhuyin: "ㄋㄚ", approx: false },
      { char: "に", romaji: "ni", zhuyin: "ㄋㄧ", approx: false },
      { char: "ぬ", romaji: "nu", zhuyin: "ㄋㄨ", approx: false },
      { char: "ね", romaji: "ne", zhuyin: "ㄋㄝ", approx: false },
      { char: "の", romaji: "no", zhuyin: "ㄋㄛ", approx: false },
    ],
  },
  {
    id: "ha",
    label: "は行",
    kana: [
      { char: "は", romaji: "ha", zhuyin: "ㄏㄚ", approx: false },
      { char: "ひ", romaji: "hi", zhuyin: "ㄏㄧ", approx: false },
      { char: "ふ", romaji: "fu", zhuyin: "ㄈㄨ", approx: true },
      { char: "へ", romaji: "he", zhuyin: "ㄏㄝ", approx: false },
      { char: "ほ", romaji: "ho", zhuyin: "ㄏㄛ", approx: false },
    ],
  },
  {
    id: "ma",
    label: "ま行",
    kana: [
      { char: "ま", romaji: "ma", zhuyin: "ㄇㄚ", approx: false },
      { char: "み", romaji: "mi", zhuyin: "ㄇㄧ", approx: false },
      { char: "む", romaji: "mu", zhuyin: "ㄇㄨ", approx: false },
      { char: "め", romaji: "me", zhuyin: "ㄇㄝ", approx: false },
      { char: "も", romaji: "mo", zhuyin: "ㄇㄛ", approx: false },
    ],
  },
  {
    id: "ya",
    label: "や行",
    kana: [
      { char: "や", romaji: "ya", zhuyin: "ㄧㄚ", approx: false },
      { char: "ゆ", romaji: "yu", zhuyin: "ㄧㄨ", approx: false },
      { char: "よ", romaji: "yo", zhuyin: "ㄧㄛ", approx: false },
    ],
  },
  {
    id: "ra",
    label: "ら行",
    kana: [
      { char: "ら", romaji: "ra", zhuyin: "ㄌㄚ", approx: true },
      { char: "り", romaji: "ri", zhuyin: "ㄌㄧ", approx: true },
      { char: "る", romaji: "ru", zhuyin: "ㄌㄨ", approx: true },
      { char: "れ", romaji: "re", zhuyin: "ㄌㄝ", approx: true },
      { char: "ろ", romaji: "ro", zhuyin: "ㄌㄛ", approx: true },
    ],
  },
  {
    id: "wa",
    label: "わ行",
    kana: [
      { char: "わ", romaji: "wa", zhuyin: "ㄨㄚ", approx: false },
      { char: "を", romaji: "o", zhuyin: "ㄛ", approx: false },
      { char: "ん", romaji: "n", zhuyin: "ㄣ", approx: true },
    ],
  },
];

export const ALL_KANA = ROWS.reduce((acc, r) => acc.concat(r.kana), []);
