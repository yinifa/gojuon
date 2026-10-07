// 畫面全部由這裡產生。用 hash 決定要顯示首頁、區頁、字卡還是寫字畫面。
// DOM 一律用 createElement + textContent 產生，不直接塞字串進標籤。

import { SECTIONS, findRow, findSection, sectionRows } from "./data/sections.js";
import { loadSeen, markSeen, isRowDone } from "./progress.js";
import { playKana, stopKana } from "./speech.js";
import { createStrokeView, strokeGlyphs } from "./stroke.js";
import { createMemoPanel, hasMemo } from "./memo.js";

const app = document.getElementById("app");

// Safari 私密模式下，連讀 window.localStorage 都可能丟例外。
// 取不到就用一個記憶體裡的假 storage 頂替，網頁照常能用。
function getStorage() {
  try {
    const ls = window.localStorage;
    ls.getItem("nihongo.probe");
    // 有些瀏覽器讀得到但寫不了（容量滿、隱私模式），所以寫入也要探一次。
    ls.setItem("nihongo.probe", "1");
    ls.removeItem("nihongo.probe");
    return ls;
  } catch {
    const mem = new Map();
    return {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
  }
}

const storage = getStorage();

function el(tag, text, opts = {}) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (opts.lang) node.setAttribute("lang", opts.lang);
  if (opts.className) node.className = opts.className;
  return node;
}

function button(text, opts = {}) {
  const b = el("button", text, opts);
  b.type = "button";
  if (opts.ariaLabel) b.setAttribute("aria-label", opts.ariaLabel);
  return b;
}

// 只有「往下點」才用 location.hash（會多推一筆歷史，返回時剛好退回去）。
function go(hash) {
  window.location.hash = hash;
}

// 換頁、回上一頁都用 replace：不累積歷史，也不會把使用者帶離網站。
function goReplace(hash) {
  window.location.replace(hash);
}

// 有沒有從上一層按按鈕進來。分兩層各記各的：
//   enteredFromHome    首頁 → 區頁
//   enteredFromSection 區頁 → 字卡
// 使用者若是從聊天軟體點連結直接進字卡，back() 會離開本站，
// 那種情況就改用 replace，留在本站。
let enteredFromHome = false;
let enteredFromSection = false;

// 使用者用瀏覽器的「返回」再「前進」之後，歷史裡可能躺著兩筆一樣的網址，
// 這時 history.back() 不會讓畫面改變，按鈕第一下看起來像沒反應。
// 所以 back() 之後等 200 毫秒再確認一次，還停在錯的畫面就自己 replace 過去。
//
// valid 是「可接受的網址」清單（同一個畫面可能有不只一種寫法，例如首頁
// 可能是 "" 也可能是 "#/"）。計時器編號記在 backCheckTimer，換畫面時可以
// 取消——長輩常常連點，不取消的話會在按了別的按鈕之後又把人拉回舊畫面。
let backCheckTimer = 0;

function ensureHashAfterBack(valid) {
  if (backCheckTimer) clearTimeout(backCheckTimer);
  backCheckTimer = window.setTimeout(() => {
    backCheckTimer = 0;
    try {
      const h = window.location.hash;
      if (valid.indexOf(h) === -1) window.location.replace(valid[valid.length - 1]);
    } catch {
      // 連 hash 都讀不到就放棄，不要把使用者卡住。
    }
  }, 200);
}

// 字卡回列表：從區頁點進來的才 back()，其他入口都 replace 留在本站。
function backToSection(section) {
  const want = `#/sec/${section.id}`;
  if (enteredFromSection) {
    enteredFromSection = false;
    window.history.back();
    ensureHashAfterBack([want]);
  } else {
    window.location.replace(want);
  }
}

// 區頁回首頁。
function backHome() {
  if (enteredFromHome) {
    enteredFromHome = false;
    window.history.back();
    // 首頁的網址可能是 ""，也可能是 "#/"，兩個都算對。
    ensureHashAfterBack(["", "#/"]);
  } else {
    window.location.replace("#/");
  }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// 目前這個寫字畫面。離開時要呼叫 destroy()，把計時器與動畫收掉。
let activeView = null;

function destroyActiveView() {
  if (activeView) {
    activeView.destroy();
    activeView = null;
  }
}

// 一個區裡的每一行都學過了 → 整區學過了。
function sectionDone(section, seen) {
  const rows = sectionRows(section);
  for (const row of rows) {
    if (!isRowDone(row, seen)) return false;
  }
  return true;
}

// ---- 首頁 ----

function renderHome() {
  app.textContent = "";
  const seen = loadSeen(storage);

  app.appendChild(el("h1", "日文五十音", { className: "title" }));
  app.appendChild(el("p", "選一個開始，點字可以聽發音", { className: "hint" }));

  const list = el("div", null, { className: "section-list" });

  for (const section of SECTIONS) {
    const b = button(null, { className: "section-button" });
    b.appendChild(el("span", section.title, { className: "section-title" }));

    const sub = el("span", null, { className: "section-sub" });
    sub.appendChild(el("span", section.subtitle, { className: "section-subtitle" }));
    if (sectionDone(section, seen)) {
      sub.appendChild(el("span", "✓ 學過了", { className: "row-done" }));
    }
    b.appendChild(sub);

    b.addEventListener("click", () => {
      enteredFromHome = true;
      go(`#/sec/${section.id}`);
    });
    list.appendChild(b);
  }

  app.appendChild(list);

  const credit = el("p", null, { className: "credit" });
  credit.appendChild(document.createTextNode("筆順資料："));
  const link = el("a", "KanjiVG");
  link.setAttribute("href", "https://kanjivg.tagaini.net");
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  credit.appendChild(link);
  credit.appendChild(document.createTextNode("（CC BY-SA 3.0）　演變示意圖：Wikimedia Commons「Hiragana origin」Pmx（CC BY 2.5，已擷取並縮放）、字型 Liu Jian Mao Cao（SIL OFL 1.1，取字形外框）　發音：ElevenLabs"));
  app.appendChild(credit);
}

// ---- 區頁 ----

function renderSection(section) {
  app.textContent = "";
  const seen = loadSeen(storage);
  // 已經站在區頁了，「從區頁點進字卡」的旗標要收掉，
  // 否則之後從字卡回首頁時會 back() 兩層。
  enteredFromSection = false;

  const top = el("div", null, { className: "card-top" });
  const back = button("← 回首頁", { className: "soft" });
  back.addEventListener("click", () => backHome());
  top.appendChild(back);
  top.appendChild(
    el("span", `${section.title}　${section.subtitle}`, {
      className: "card-position section-heading",
    })
  );
  app.appendChild(top);

  for (const group of section.groups) {
    if (group.title) {
      app.appendChild(el("h2", group.title, { className: "group-title" }));
    }

    const list = el("div", null, { className: "row-list" });

    for (const row of group.rows) {
      const b = button(null, { className: "row-button" });

      const rowTop = el("span", null, { className: "row-top" });
      rowTop.appendChild(el("span", row.label, { className: "row-label", lang: "ja" }));
      if (isRowDone(row, seen)) {
        rowTop.appendChild(el("span", "✓ 學過了", { className: "row-done" }));
      }
      b.appendChild(rowTop);

      const kana = el("span", null, { className: "row-kana" });
      for (const k of row.kana) {
        kana.appendChild(el("span", k.char, { lang: "ja", className: "row-kana-char" }));
      }
      b.appendChild(kana);

      b.addEventListener("click", () => {
        enteredFromSection = true;
        go(`#/row/${row.id}/0`);
      });
      list.appendChild(b);
    }

    app.appendChild(list);
  }
}

// ---- 字卡 ----

function renderCard(section, row, index) {
  const item = row.kana[index];
  markSeen(storage, item.char);

  app.textContent = "";
  window.scrollTo(0, 0);

  const top = el("div", null, { className: "card-top" });
  const back = button("← 回列表", { className: "soft" });
  back.addEventListener("click", () => backToSection(section));
  top.appendChild(back);
  top.appendChild(el("span", `${row.label}　${index + 1}／${row.kana.length}`, {
    className: "card-position",
  }));
  app.appendChild(top);

  const note = el("p", null, { className: "no-sound" });
  note.hidden = true;

  const play = () => {
    // 先收起來，真的沒聲音時才由 onFail 叫出來。
    note.hidden = true;
    playKana(item, () => {
      note.textContent = "這支手機沒辦法播放發音";
      note.hidden = false;
    });
  };

  // 拗音是兩個字，字體要小一點才不會超出按鈕。
  const bigClass = item.char.length === 2 ? "big-kana is-pair" : "big-kana";
  const big = button(item.char, { lang: "ja", ariaLabel: "聽發音", className: bigClass });
  big.addEventListener("click", play);

  // 片假名：在大字框的右下角標出對應的平假名（小標籤，不擋到大字）。
  if (item.pair) {
    // 標籤是中文，標回 zh-Hant（外層按鈕是 ja），裡面的平假名再另外標 ja。
    const pairTag = el("span", null, { className: "pair-tag", lang: "zh-Hant" });
    pairTag.appendChild(document.createTextNode("平假名："));
    pairTag.appendChild(el("span", item.pair, { lang: "ja" }));
    big.appendChild(pairTag);
    big.className = bigClass + " has-pair-tag";
  }

  app.appendChild(big);

  app.appendChild(el("p", `${item.romaji}　${item.zhuyin}`, { className: "reading" }));

  // 三顆功能按鈕左右並排一列，每顆兩行（上面圖示、下面文字），整張字卡一屏看得完。
  const actions = el("div", null, { className: "card-actions" });

  const sound = button("🔊\n聽發音", { className: "primary" });
  sound.addEventListener("click", play);
  actions.appendChild(sound);

  const write = button("✍️\n看筆順", { className: "soft" });
  write.addEventListener("click", () => goReplace(`#/row/${row.id}/${index}/write`));
  actions.appendChild(write);

  // 有「怎麼記」內容的字才多一顆按鈕。按下去把大字換成記憶提示，再按換回來。
  // 面板等到第一次按才做，進字卡時不要先載入圖片。
  if (hasMemo(item.char)) {
    // 同一張字卡重複開關沿用同一個面板，不要每次重做。
    let panel = null;
    const memoBtn = button("💡\n怎麼記", { className: "soft" });
    memoBtn.addEventListener("click", () => {
      if (panel && panel.parentNode) {
        // 收起：拿掉面板，大字回來。
        big.hidden = false;
        if (panel.parentNode) panel.parentNode.removeChild(panel);
        memoBtn.textContent = "💡\n怎麼記";
        return;
      }
      if (!panel) panel = createMemoPanel(item.char);
      big.hidden = true;
      big.parentNode.insertBefore(panel, big.nextSibling);
      memoBtn.textContent = "💡\n收起來";
    });
    actions.appendChild(memoBtn);
  }

  app.appendChild(actions);
  app.appendChild(note);

  if (item.approx) {
    app.appendChild(el("p", "注音只是接近的音，請以聽到的發音為準", { className: "approx" }));
  }

  app.appendChild(el("p", "聽不到聲音時，請看看手機是不是開了靜音、音量有沒有開", { className: "sound-tip" }));

  const nav = el("div", null, { className: "card-nav" });

  const prev = button("上一個", { className: "soft" });
  if (index === 0) prev.disabled = true;
  else prev.addEventListener("click", () => goReplace(`#/row/${row.id}/${index - 1}`));
  nav.appendChild(prev);

  const next = button("下一個", { className: "primary" });
  if (index === row.kana.length - 1) {
    next.textContent = "完成";
    next.addEventListener("click", () => backToSection(section));
  } else {
    next.addEventListener("click", () => goReplace(`#/row/${row.id}/${index + 1}`));
  }
  nav.appendChild(next);

  app.appendChild(nav);
}

// ---- 寫字畫面 ----

function renderWrite(row, index) {
  const item = row.kana[index];

  app.textContent = "";

  const top = el("div", null, { className: "card-top" });
  const back = button("← 回字卡", { className: "soft" });
  back.addEventListener("click", () => goReplace(`#/row/${row.id}/${index}`));
  top.appendChild(back);

  // 寫字畫面最上方：假名、羅馬拼音、注音，以全形空白相隔。
  const pos = el("span", null, { className: "card-position" });
  pos.appendChild(el("span", item.char, { lang: "ja" }));
  pos.appendChild(document.createTextNode(`　${item.romaji}　${item.zhuyin}`));
  top.appendChild(pos);
  app.appendChild(top);

  const view = createStrokeView(item.char, {
    reducedMotion: prefersReducedMotion(),
  });
  activeView = view;
  app.appendChild(view.element);

  app.appendChild(el("p", "看完筆順，用手指在上面跟著寫", { className: "hint" }));

  const actions = el("div", null, { className: "write-actions" });
  const again = button("▶ 再看一次", { className: "primary" });
  again.addEventListener("click", () => view.play());
  const erase = button("擦掉重寫", { className: "soft" });
  erase.addEventListener("click", () => view.clear());
  actions.appendChild(again);
  actions.appendChild(erase);
  app.appendChild(actions);

  // 筆順動畫沒有聲音，可以直接自動播一次。
  view.play();
}

// ---- 路由 ----

function render() {
  // 只要畫面換了，上一筆 back 後備檢查就沒有意義，直接取消。
  // history.back() 成功會觸發 hashchange 走進 render()，計時器因此被清掉；
  // 歷史裡躺著兩筆一樣的網址時不會觸發 hashchange，就留著計時器補救。
  if (backCheckTimer) {
    clearTimeout(backCheckTimer);
    backCheckTimer = 0;
  }
  // 換畫面之前先收掉上一個寫字畫面（計時器、事件監聽、動畫）。
  destroyActiveView();
  // 換畫面時把發音停掉。
  stopKana();

  const hash = window.location.hash.replace(/^#/, "");
  const write = hash.match(/^\/row\/([^/]+)\/(\d+)\/write$/);

  if (write) {
    const found = findRow(write[1]);
    const index = Number(write[2]);
    if (found && Number.isInteger(index) && index >= 0 && index < found.row.kana.length) {
      if (strokeGlyphs(found.row.kana[index].char).length > 0) {
        renderWrite(found.row, index);
        return;
      }
    }
    window.location.replace("#/");
    return;
  }

  const m = hash.match(/^\/row\/([^/]+)\/(\d+)$/);

  if (m) {
    const found = findRow(m[1]);
    const index = Number(m[2]);
    if (found && Number.isInteger(index) && index >= 0 && index < found.row.kana.length) {
      renderCard(found.section, found.row, index);
      return;
    }
    window.location.replace("#/");
    return;
  }

  const sec = hash.match(/^\/sec\/([^/]+)$/);

  if (sec) {
    const section = findSection(sec[1]);
    if (section) {
      renderSection(section);
      return;
    }
    window.location.replace("#/");
    return;
  }

  if (hash === "" || hash === "/") {
    // 回到首頁就把兩個旗標都收掉，否則下次回首頁會 back() 離開本站。
    enteredFromHome = false;
    enteredFromSection = false;
    renderHome();
    return;
  }

  window.location.replace("#/");
}

window.addEventListener("hashchange", render);
render();
