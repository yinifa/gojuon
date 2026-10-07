// 筆順動畫與手指描寫。純邏輯與繪圖，不讀寫 location、不碰 localStorage。

import { STROKES } from "./data/strokes.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const VIEWBOX = "0 0 109 109";

export function strokesFor(char) {
  const list = STROKES[char];
  return Array.isArray(list) ? list.slice() : [];
}

// 拗音（きゃ）是兩個字，兩個字要各畫各的。
// 回傳每個字的筆畫陣列複本；任何一個字查不到筆畫就整個回傳空陣列。
export function strokeGlyphs(text) {
  const out = [];
  for (let i = 0; i < text.length; i += 1) {
    const list = strokesFor(text.charAt(i));
    if (list.length === 0) return [];
    out.push(list);
  }
  return out;
}

// 兩個字並排時，各自的 <g> 要縮小並平移到不同位置。
// 第二個字要明顯比較小，兩個同樣大小看不出來那是拗音。
const PAIR_TRANSFORMS = [
  "translate(0 20) scale(0.62)",
  "translate(50 30) scale(0.52)",
];

function svgEl(tag) {
  return document.createElementNS(SVG_NS, tag);
}

export function createStrokeView(char, { reducedMotion } = {}) {
  const glyphs = strokeGlyphs(char);
  // 一個字時跟以前一樣，兩個字（拗音）時每個字各有一個縮小的 <g>。
  const isPair = char.length === 2;
  const smallClass = isPair ? " is-small" : "";

  const box = document.createElement("div");
  box.className = "stroke-box";

  // 底層：淡色底稿，永遠顯示全部筆畫
  const ghostSvg = svgEl("svg");
  ghostSvg.setAttribute("viewBox", VIEWBOX);

  // 中層：動畫用，一筆一筆畫出來
  const inkSvg = svgEl("svg");
  inkSvg.setAttribute("viewBox", VIEWBOX);

  const ghostPaths = [];
  const inkPaths = [];

  // 筆畫順序：先第一個字的全部筆畫，再第二個字的全部筆畫（播放與底稿一致）。
  for (let gi = 0; gi < glyphs.length; gi += 1) {
    let ghostTarget = ghostSvg;
    let inkTarget = inkSvg;

    if (isPair) {
      const ghostG = svgEl("g");
      ghostG.setAttribute("transform", PAIR_TRANSFORMS[gi]);
      ghostSvg.appendChild(ghostG);
      ghostTarget = ghostG;

      const inkG = svgEl("g");
      inkG.setAttribute("transform", PAIR_TRANSFORMS[gi]);
      inkSvg.appendChild(inkG);
      inkTarget = inkG;
    }

    for (const d of glyphs[gi]) {
      const g = svgEl("path");
      g.setAttribute("d", d);
      g.setAttribute("class", "stroke-ghost" + smallClass);
      ghostTarget.appendChild(g);
      ghostPaths.push(g);

      const i = svgEl("path");
      i.setAttribute("d", d);
      i.setAttribute("class", "stroke-ink" + smallClass);
      inkTarget.appendChild(i);
      inkPaths.push(i);
    }
  }

  // 上層：手指描寫
  const canvas = document.createElement("canvas");
  canvas.className = "stroke-pad";

  box.appendChild(ghostSvg);
  box.appendChild(inkSvg);
  box.appendChild(canvas);

  // ---- canvas 手指描寫 ----
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  // 同一時間只認一根手指／一支滑鼠。
  let activePointerId = null;
  let activeTouchId = null;

  // 建立當下 .stroke-box 還沒掛進頁面，量到的寬高是 0。
  // 所以不要在這裡量，改成每次真的要用（播放／下筆／視窗改變大小）才量。
  // 只量 canvas 本身（含邊框的 box 會差 6px，線會偏、擦不乾淨）。
  function ensureSize() {
    if (!ctx) return;
    // 正在畫的時候絕對不能重設 canvas，設了會把畫到一半的線清掉。
    if (drawing) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    // 還沒量到尺寸就不要亂設，否則 canvas 會變成 2×2，畫什麼都看不到。
    if (w === 0 || h === 0) return;
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function strokeStyle() {
    if (!ctx) return;
    const brand = getComputedStyle(document.documentElement)
      .getPropertyValue("--brand")
      .trim();
    ctx.strokeStyle = brand || "#8F2611";
    ctx.lineWidth = Math.max(1, canvas.getBoundingClientRect().width * 0.045);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function pointAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // 兩組事件（Pointer / touch）共用這三個畫線函式。
  function startAt(clientX, clientY) {
    ensureSize();
    drawing = true;
    const p = pointAt(clientX, clientY);
    lastX = p.x;
    lastY = p.y;
    if (ctx) {
      strokeStyle();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.01, p.y);
      ctx.stroke();
    }
  }

  function moveTo(clientX, clientY) {
    if (!drawing || !ctx) return;
    const p = pointAt(clientX, clientY);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  }

  function endStroke() {
    drawing = false;
  }

  function onPointerDown(e) {
    // 已經在畫了就忽略別的指標，不准中途換手指。
    if (drawing) return;
    activePointerId = e.pointerId;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // 某些瀏覽器不支援就跳過，不影響描寫。
    }
    startAt(e.clientX, e.clientY);
    e.preventDefault();
  }

  function onPointerMove(e) {
    // 不是我們認得的那一支，一律不理會。
    if (!drawing || e.pointerId !== activePointerId) return;
    moveTo(e.clientX, e.clientY);
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (!drawing || e.pointerId !== activePointerId) return;
    endStroke();
    activePointerId = null;
    try {
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // 忽略。
    }
  }

  // 舊手機（iOS 12）沒有 PointerEvent，只能用 touch 事件。
  // 在所有觸點裡找出 identifier 等於 activeTouchId 的那一個。
  function activeTouch(e) {
    const list = e.touches;
    if (!list) return null;
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].identifier === activeTouchId) {
        return { x: list[i].clientX, y: list[i].clientY };
      }
    }
    return null;
  }

  function isActiveTouchEnd(e) {
    const list = e.changedTouches;
    if (!list) return false;
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].identifier === activeTouchId) return true;
    }
    return false;
  }

  function onTouchStart(e) {
    // 已經在畫了就不准再開一筆。
    if (drawing) return;
    const t = e.changedTouches && e.changedTouches[0];
    if (t) {
      activeTouchId = t.identifier;
      startAt(t.clientX, t.clientY);
    }
    e.preventDefault();
  }

  function onTouchMove(e) {
    const t = activeTouch(e);
    if (t) moveTo(t.x, t.y);
    e.preventDefault();
  }

  function onTouchEnd(e) {
    // 抬起的是別的手指就當作沒發生，這一筆繼續畫。
    if (!isActiveTouchEnd(e)) return;
    endStroke();
    activeTouchId = null;
  }

  // 記下實際掛上去的那一組監聽，destroy() 才知道要拆哪一組。
  let bound = [];
  if (window.PointerEvent) {
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    bound = [
      ["pointerdown", onPointerDown],
      ["pointermove", onPointerMove],
      ["pointerup", onPointerUp],
      ["pointercancel", onPointerUp],
    ];
  } else {
    const opts = { passive: false };
    canvas.addEventListener("touchstart", onTouchStart, opts);
    canvas.addEventListener("touchmove", onTouchMove, opts);
    canvas.addEventListener("touchend", onTouchEnd, opts);
    canvas.addEventListener("touchcancel", onTouchEnd, opts);
    bound = [
      ["touchstart", onTouchStart],
      ["touchmove", onTouchMove],
      ["touchend", onTouchEnd],
      ["touchcancel", onTouchEnd],
    ];
  }

  window.addEventListener("resize", ensureSize);

  // ---- 筆順播放 ----
  let runId = 0;
  let cancelled = false;
  let currentRaf = 0;
  const timers = new Set();
  const waiters = new Set();

  function cancelRun() {
    runId += 1;
    cancelled = true;
    if (currentRaf) {
      cancelAnimationFrame(currentRaf);
      currentRaf = 0;
    }
    // 計時器也收掉，不留著在背景跑。順便讓等待中的 play() 立刻結束。
    for (const t of timers) clearTimeout(t);
    timers.clear();
    for (const resolve of waiters) resolve();
    waiters.clear();
  }

  // 睡一下，但可以被 cancelRun() 提前叫醒。
  function wait(ms) {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        timers.delete(t);
        waiters.delete(resolve);
        resolve();
      }, ms);
      timers.add(t);
      waiters.add(resolve);
    });
  }

  function hideAll() {
    for (const p of inkPaths) {
      p.classList.remove("is-drawing");
      p.style.strokeDasharray = "none";
      p.style.strokeDashoffset = "0";
      p.style.opacity = "0";
    }
  }

  function showStroke(path) {
    path.classList.remove("is-drawing");
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
    path.style.opacity = "1";
  }

  function drawOne(path, duration, mine) {
    return new Promise((resolve) => {
      let len = 100;
      try {
        len = path.getTotalLength() || 100;
      } catch {
        len = 100;
      }
      path.classList.add("is-drawing");
      path.style.opacity = "1";
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);

      const start = performance.now();

      // 把 resolve 也放進 waiters，cancelRun() 才會在取消時順便叫醒它，
      // 否則這支 promise 會永遠卡住，play() 就停在那裡。
      waiters.add(resolve);

      function step(now) {
        if (cancelled || mine !== runId) {
          waiters.delete(resolve);
          resolve();
          return;
        }
        const t = Math.min(1, (now - start) / duration);
        path.style.strokeDashoffset = String(len * (1 - t));
        if (t < 1) {
          currentRaf = requestAnimationFrame(step);
        } else {
          currentRaf = 0;
          waiters.delete(resolve);
          path.classList.remove("is-drawing");
          path.style.strokeDasharray = "none";
          path.style.strokeDashoffset = "0";
          resolve();
        }
      }

      currentRaf = requestAnimationFrame(step);
    });
  }

  // 全部播完後等一下，然後把黑色的示範筆畫收掉，只留淡色底稿讓使用者照著描。
  async function fadeOutAfterPlay(mine) {
    await wait(1200);
    if (cancelled || mine !== runId) return;
    hideAll();
  }

  async function play() {
    cancelRun();
    cancelled = false;
    const mine = runId;
    ensureSize();
    hideAll();

    if (reducedMotion) {
      for (const p of inkPaths) {
        if (cancelled || mine !== runId) return;
        showStroke(p);
        // eslint-disable-next-line no-await-in-loop
        await wait(700);
      }
      await fadeOutAfterPlay(mine);
      return;
    }

    for (const p of inkPaths) {
      if (cancelled || mine !== runId) return;
      let len = 100;
      try {
        len = p.getTotalLength() || 100;
      } catch {
        len = 100;
      }
      // eslint-disable-next-line no-await-in-loop
      await drawOne(p, Math.max(500, len * 12), mine);
      if (cancelled || mine !== runId) return;
      // eslint-disable-next-line no-await-in-loop
      await wait(350);
    }

    await fadeOutAfterPlay(mine);
  }

  function clear() {
    if (!ctx) return;
    // 先把座標系統拉回原點，再用 canvas 自己的像素尺寸擦，
    // 才不會因為縮放或邊框差幾個像素而殘留線條。
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function destroy() {
    cancelRun();
    window.removeEventListener("resize", ensureSize);
    for (const pair of bound) {
      canvas.removeEventListener(pair[0], pair[1], false);
    }
    bound = [];
  }

  return { element: box, play, clear, destroy, cancel: cancelRun };
}
