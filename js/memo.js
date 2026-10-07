// 「💡 怎麼記」的面板：聯想圖、漢字來源圖、來源說明、口訣、容易搞混提醒。
// DOM 一律用 createElement／createElementNS ＋ textContent 產生，不塞字串進標籤。

import { MNEMONICS } from "./data/mnemonics.js";
import { ORIGIN_STROKES } from "./data/origins.js";
import { STROKES } from "./data/strokes.js";
import { SOGANA } from "./data/sogana.js";
import { mnemoImagePathFor } from "./mnemo-path.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const VIEWBOX = "0 0 109 109";

// 這個字有沒有「怎麼記」的內容。
export function hasMemo(char) {
  return Object.prototype.hasOwnProperty.call(MNEMONICS, char);
}

function svgEl(tag) {
  return document.createElementNS(SVG_NS, tag);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

// 來源漢字的圖。hot 決定哪幾筆畫成紅色。
// 沒有 hot（平假名）、hot 是空陣列 → 全部墨色；hot 是 "all" → 全部紅色；
// hot 是非空陣列 → 陣列裡的筆畫紅色，其餘淡色。
function originGlyph(origin, hot) {
  const svg = svgEl("svg");
  svg.setAttribute("viewBox", VIEWBOX);
  svg.setAttribute("class", "origin-glyph");

  const strokes = ORIGIN_STROKES[origin];
  if (!Array.isArray(strokes)) return svg;

  for (let i = 0; i < strokes.length; i += 1) {
    let cls;
    if (hot === "all") cls = "origin-hot";
    else if (Array.isArray(hot) && hot.length > 0) {
      cls = hot.indexOf(i + 1) !== -1 ? "origin-hot" : "origin-dim";
    } else cls = "origin-ink";

    const p = svgEl("path");
    p.setAttribute("d", strokes[i]);
    p.setAttribute("class", cls);
    svg.appendChild(p);
  }
  return svg;
}

// 假名自己的筆畫圖，全部紅色。
function kanaGlyph(char) {
  const svg = svgEl("svg");
  svg.setAttribute("viewBox", VIEWBOX);
  svg.setAttribute("class", "origin-glyph");

  const strokes = STROKES[char];
  if (!Array.isArray(strokes)) return svg;

  for (let i = 0; i < strokes.length; i += 1) {
    const p = svgEl("path");
    p.setAttribute("d", strokes[i]);
    p.setAttribute("class", "origin-hot");
    svg.appendChild(p);
  }
  return svg;
}

// 中間那一格的示意圖：漢字寫快了、變成假名之前的樣子（是示意，不是古代字跡的原樣）。SOGANA 的路徑是「填色」的外框，
// 不是筆畫線，所以這裡只給 class（填色在 CSS 的 .origin-sogana）。
function soganaGlyph(char) {
  const svg = svgEl("svg");
  svg.setAttribute("viewBox", VIEWBOX);
  svg.setAttribute("class", "origin-glyph");

  const paths = SOGANA[char];
  if (!Array.isArray(paths)) return svg;

  for (let i = 0; i < paths.length; i += 1) {
    const p = svgEl("path");
    p.setAttribute("d", paths[i]);
    p.setAttribute("class", "origin-sogana");
    svg.appendChild(p);
  }
  return svg;
}

// 「怎麼記」裡的一格：上面是圖，下面是說明文字。
function originCell(glyph, label) {
  const cell = el("div", "origin-cell");
  cell.appendChild(glyph);
  cell.appendChild(el("span", "origin-label", label));
  return cell;
}

// 產生一個「怎麼記」面板。char 必須在 MNEMONICS 裡。
export function createMemoPanel(char) {
  const memo = MNEMONICS[char];
  const panel = el("div", "memo-panel");

  // 聯想圖只有平假名有。「假名＋圖」這一列等圖片載入成功才放進面板，
  // 圖檔還沒生出來（載入失敗）就什麼都不做，那一列不會出現，其他內容照常顯示。
  const imagePath = mnemoImagePathFor(char);
  if (imagePath !== null) {
    // 左邊放假名自己的筆畫圖，右邊放聯想圖。這一整列連同下面的說明文字
    // 一起包在 memo-top 裡，圖片載入成功才整包放進面板。
    const top = el("div", "memo-top");
    const pair = el("div", "memo-pair");

    const kana = kanaGlyph(char);
    kana.setAttribute("class", "memo-pair-kana");
    pair.appendChild(kana);

    const img = el("img", "memo-image");
    img.setAttribute("alt", "");
    img.addEventListener("load", () => {
      panel.insertBefore(top, panel.firstChild);
    });
    img.src = imagePath;
    pair.appendChild(img);

    top.appendChild(pair);
    // 聯想圖下面那一行說明。沒有 pic 的字就不建立這個 <p>。
    if (typeof memo.pic === "string" && memo.pic.length > 0) {
      top.appendChild(el("p", "memo-pic", memo.pic));
    }
  }

  // 平假名走「楷書 → 演變 → 假名」三格（標字都用兩個字，窄手機才不會折行）；片假名維持原本的兩格。
  const hasSogana = Array.isArray(SOGANA[char]);
  const row = el("div", hasSogana ? "origin-row origin-row-3" : "origin-row");
  if (hasSogana) {
    row.appendChild(originCell(originGlyph(memo.origin, memo.hot), "楷書"));
    row.appendChild(el("span", "origin-arrow", "→"));
    row.appendChild(originCell(soganaGlyph(char), "演變"));
    row.appendChild(el("span", "origin-arrow", "→"));
    row.appendChild(originCell(kanaGlyph(char), "假名"));
  } else {
    row.appendChild(originGlyph(memo.origin, memo.hot));
    row.appendChild(el("span", "origin-arrow", "→"));
    row.appendChild(kanaGlyph(char));
  }
  panel.appendChild(row);

  // 來源說明。平假名是整個漢字的草書，片假名是取其中一部分。
  let originText;
  if (imagePath !== null) {
    originText = `來自漢字「${memo.origin}」的草書。中間那格是示意圖。`;
  } else if (memo.hot === "all") {
    originText = `來自漢字「${memo.origin}」`;
  } else if (Array.isArray(memo.hot) && memo.hot.length === 0) {
    originText = `來自漢字「${memo.origin}」的一部分`;
  } else {
    originText = `來自漢字「${memo.origin}」，紅色是取用的部分`;
  }
  panel.appendChild(el("p", "memo-origin", originText));

  panel.appendChild(el("p", "memo-tip", memo.tip));

  // 諧音提示。沒有這個欄位的字就不顯示。
  if (memo.sound) {
    panel.appendChild(el("p", "memo-sound", `發音像：${memo.sound}`));
  }

  if (memo.mix) {
    panel.appendChild(el("p", "memo-mix", `容易搞混：${memo.mix}`));
  }

  return panel;
}
