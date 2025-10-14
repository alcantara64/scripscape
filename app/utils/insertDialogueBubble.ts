// utils/dialogue.ts
import type { RichEditor } from "react-native-pell-rich-editor"

type PartialDialogue = Partial<Omit<DialogueData, "id">> & { id: string }
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

export type DialogueData = {
  id?: string // if omitted, we generate one
  name: string
  message: string
  avatarUrl?: string
  bubbleColor?: string
  textColor?: string
  nameColor?: string
  playIconColor?: string
  audioUrl?: string
}

const genId = () => `dlg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export function dialogueHtml(d: DialogueData) {
  const id = d.id ?? genId()
  const bubbleColor = d.bubbleColor ?? "#E7D6FF"
  const textColor = d.textColor ?? "#1D1B3A"
  const nameColor = d.nameColor ?? "#3B2A8C"
  const playIconColor = d.playIconColor ?? "#5E46F8"
  const audioUrl = d.audioUrl ? esc(d.audioUrl) : ""

  // in dialogueHtml()
  const bubble = `
<!--ss-dialogue-start:${id}-->
<div class="ss-dialogue-wrap"
     contenteditable="false"
     role="button" aria-label="Edit dialogue"
     data-ss-id="${id}"
     tabindex="-1">

  <!-- explicit overlay just for edit -->
  <button class="ss-dialogue-tap" type="button" aria-label="Edit dialogue"></button>

  <div class="ss-dialogue">
    <div class="ss-avatar">
      ${d.avatarUrl ? `<img src="${esc(d.avatarUrl)}" alt="${esc(d.name)}" />` : ""}
    </div>

    <div class="ss-bubble" style="background:${bubbleColor}">
      <div class="ss-name" style="color:${nameColor}">${esc(d.name)}</div>
      <div class="ss-text" style="color:${textColor}">${esc(d.message)}</div>

      ${
        audioUrl
          ? `<div class="ss-play" aria-hidden="true">
               <button type="button" class="ss-play-btn" data-ss-id="${id}" aria-label="Play">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                   <circle cx="12" cy="12" r="10" stroke="${playIconColor}" stroke-width="2" opacity="0.6"/>
                   <path d="M10 8L16 12L10 16V8Z" fill="${playIconColor}" style="pointer-events:none"/>
                 </svg>
               </button>
             </div>`
          : ""
      }

      ${audioUrl ? `<audio id="ss-audio-${id}" preload="none" playsinline src="${audioUrl}"></audio>` : ""}
    </div>
  </div>
</div>
<!--ss-dialogue-end:${id}-->
`.trim()

  return {
    id,
    html: bubble,
  }
}

export function insertDialogue(editorRef: React.RefObject<RichEditor>, data: DialogueData) {
  const { id, html } = dialogueHtml(data)
  const after = `<p data-ss-caret><br/></p>` // place caret after bubble
  editorRef.current?.focusContentEditor?.()
  editorRef.current?.insertHTML?.(html + after)
  return id
}

export function bindDialogueClick(editorRef: React.RefObject<RichEditor>) {
  editorRef.current?.injectJavascript?.(`
(function(){
  if (window.__ss_bound) return; window.__ss_bound = true;

  function post(msg){
    if (window.ReactNativeWebView?.postMessage)
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function kill(e){
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  // --- Icon helpers ----------------------------------------------------------
  function getIconColor(btn){
    // Try to read from existing SVG; fall back to default purple
    var svg = btn && btn.querySelector('svg');
    if (!svg) return '#5E46F8';
    var path = svg.querySelector('path');
    var circle = svg.querySelector('circle');
    var c = (path && (path.getAttribute('fill') || path.style.fill)) ||
            (circle && (circle.getAttribute('stroke') || circle.style.stroke));
    return c || '#5E46F8';
  }

  function setPlayIcon(btn, color){
    color = color || getIconColor(btn);
    btn.innerHTML = ''
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">'
      + '  <circle cx="12" cy="12" r="10" stroke="'+color+'" stroke-width="2" opacity="0.6"/>'
      + '  <path d="M10 8L16 12L10 16V8Z" fill="'+color+'"/>'
      + '</svg>';
  }

  function setPauseIcon(btn, color){
    color = color || getIconColor(btn);
    btn.innerHTML = ''
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">'
      + '  <circle cx="12" cy="12" r="10" stroke="'+color+'" stroke-width="2" opacity="0.6"/>'
      + '  <rect x="9" y="8" width="2" height="8" fill="'+color+'"/>'
      + '  <rect x="13" y="8" width="2" height="8" fill="'+color+'"/>'
      + '</svg>';
  }

  function btnForId(id){
    return document.querySelector('.ss-play-btn[data-ss-id="'+id+'"]');
  }

  // --- Audio toggle ----------------------------------------------------------
  function toggleAudio(id){
    var a = document.getElementById('ss-audio-'+id);
    if (!a) return;
    var btn = btnForId(id);
    if (!btn) return;

    // Pause all other audios and restore their icons
    document.querySelectorAll('audio[id^="ss-audio-"]').forEach(function(other){
      if (other !== a) {
        if (!other.paused) {
          other.pause();
          var oid = other.id.replace('ss-audio-','');
          var obtn = btnForId(oid);
          if (obtn) setPlayIcon(obtn);
        }
      }
    });

    if (a.paused) {
      a.play();
      setPauseIcon(btn);
    } else {
      a.pause();
      setPlayIcon(btn);
    }

    // Keep icon in sync with media state
    a.onplay = function(){ setPauseIcon(btn); };
    a.onpause = function(){ setPlayIcon(btn); };
    a.onended = function(){ setPlayIcon(btn); };
  }

  // PLAY — block the editor early, toggle only on click
  ['pointerdown','touchstart','mousedown','click'].forEach(function(type){
    document.addEventListener(type, function(e){
      var t = e.target && e.target.closest && e.target.closest('.ss-play-btn');
      if (!t) return;
      kill(e);
      if (type === 'click') {
        var id = t.getAttribute('data-ss-id');
        if (id) toggleAudio(id);
      }
    }, true); // capture
  });

  // EDIT — hit the overlay button only
  document.addEventListener('click', function(e){
    var tap = e.target && e.target.closest && e.target.closest('.ss-dialogue-tap');
    if (!tap) return;
    kill(e);
    var wrap = tap.closest('.ss-dialogue-wrap');
    var id = (wrap && wrap.getAttribute('data-ss-id')) || '';
    post({ type: 'edit-dialogue', id: id });
  }, true);

})();
true;
  `)
}

export async function getBubbleData(id: string, editorRef: React.RefObject<RichEditor>) {
  const html = await editorRef.current?.getContentHtml?.()
  if (!html) return null
  const start = `<!--ss-dialogue-start:${id}-->`
  const end = `<!--ss-dialogue-end:${id}-->`
  const m = html.match(new RegExp(`${start}([\\s\\S]*?)${end}`))
  if (!m) return null
  const block = m[1]
  const name = /<div class="ss-name"[^>]*>([\s\S]*?)<\/div>/.exec(block)?.[1] ?? ""
  const message = /<div class="ss-text"[^>]*>([\s\S]*?)<\/div>/.exec(block)?.[1] ?? ""
  const avatarUrl = /<img src="([^"]+)"/.exec(block)?.[1] ?? ""
  const bubbleColor = /class="ss-bubble" style="background:([^";]+)[^"]*"/.exec(block)?.[1] ?? ""
  const nameColor = /class="ss-name" style="color:([^";]+)[^"]*"/.exec(block)?.[1] ?? ""
  const textColor = /class="ss-text" style="color:([^";]+)[^"]*"/.exec(block)?.[1] ?? ""
  const audioUrl = /<audio[^>]*src="([^"]+)"/.exec(block)?.[1] ?? ""
  return { id, name, message, avatarUrl, bubbleColor, nameColor, textColor, audioUrl }
}
export const dialogueBridgeJS = `
(function(){
  if (window.__ss_bound) return; window.__ss_bound = true;

  function post(msg){
    if (window.ReactNativeWebView?.postMessage)
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function kill(e){
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  // --- Icon helpers ----------------------------------------------------------
  function getIconColor(btn){
    // Try to read from existing SVG; fall back to default purple
    var svg = btn && btn.querySelector('svg');
    if (!svg) return '#5E46F8';
    var path = svg.querySelector('path');
    var circle = svg.querySelector('circle');
    var c = (path && (path.getAttribute('fill') || path.style.fill)) ||
            (circle && (circle.getAttribute('stroke') || circle.style.stroke));
    return c || '#5E46F8';
  }

  function setPlayIcon(btn, color){
    color = color || getIconColor(btn);
    btn.innerHTML = ''
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">'
      + '  <circle cx="12" cy="12" r="10" stroke="'+color+'" stroke-width="2" opacity="0.6"/>'
      + '  <path d="M10 8L16 12L10 16V8Z" fill="'+color+'"/>'
      + '</svg>';
  }

  function setPauseIcon(btn, color){
    color = color || getIconColor(btn);
    btn.innerHTML = ''
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">'
      + '  <circle cx="12" cy="12" r="10" stroke="'+color+'" stroke-width="2" opacity="0.6"/>'
      + '  <rect x="9" y="8" width="2" height="8" fill="'+color+'"/>'
      + '  <rect x="13" y="8" width="2" height="8" fill="'+color+'"/>'
      + '</svg>';
  }

  function btnForId(id){
    return document.querySelector('.ss-play-btn[data-ss-id="'+id+'"]');
  }

  // --- Audio toggle ----------------------------------------------------------
  function toggleAudio(id){
    var a = document.getElementById('ss-audio-'+id);
    if (!a) return;
    var btn = btnForId(id);
    if (!btn) return;

    // Pause all other audios and restore their icons
    document.querySelectorAll('audio[id^="ss-audio-"]').forEach(function(other){
      if (other !== a) {
        if (!other.paused) {
          other.pause();
          var oid = other.id.replace('ss-audio-','');
          var obtn = btnForId(oid);
          if (obtn) setPlayIcon(obtn);
        }
      }
    });

    if (a.paused) {
      a.play();
      setPauseIcon(btn);
    } else {
      a.pause();
      setPlayIcon(btn);
    }

    // Keep icon in sync with media state
    a.onplay = function(){ setPauseIcon(btn); };
    a.onpause = function(){ setPlayIcon(btn); };
    a.onended = function(){ setPlayIcon(btn); };
  }

  // PLAY — block the editor early, toggle only on click
  ['pointerdown','touchstart','mousedown','click'].forEach(function(type){
    document.addEventListener(type, function(e){
      var t = e.target && e.target.closest && e.target.closest('.ss-play-btn');
      if (!t) return;
      kill(e);
      if (type === 'click') {
        var id = t.getAttribute('data-ss-id');
        if (id) toggleAudio(id);
      }
    }, true); // capture
  });

  // EDIT — hit the overlay button only
  document.addEventListener('click', function(e){
    var tap = e.target && e.target.closest && e.target.closest('.ss-dialogue-tap');
    if (!tap) return;
    kill(e);
    var wrap = tap.closest('.ss-dialogue-wrap');
    var id = (wrap && wrap.getAttribute('data-ss-id')) || '';
    post({ type: 'edit-dialogue', id: id });
  }, true);

})();
true;
  `
async function replaceDialogueBlock(
  editorRef: React.RefObject<RichEditor>,
  id: string,
  newBlockHtml: string,
) {
  const html = await editorRef.current?.getContentHtml?.()
  if (!html) return false

  const start = `<!--ss-dialogue-start:${id}-->`
  const end = `<!--ss-dialogue-end:${id}-->`

  // Defensive: ensure both markers exist
  const startIdx = html.indexOf(start)
  const endIdx = html.indexOf(end)
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return false

  // Keep anything before/after the block. Also place a caret <p> after it.
  const before = html.slice(0, startIdx)
  const after = html.slice(endIdx + end.length)

  // Ensure the replacement includes both markers (so future updates still work)
  const blockWithMarkers = `${start}\n${newBlockHtml}\n${end}`

  const next = `${before}${blockWithMarkers}<p data-ss-caret><br/></p>${after}`

  // Replace the whole content (safest with pell)
  // Use setContentHTML to avoid cumulative mutations from insertHTML
  // Then scroll caret into view.
  editorRef.current?.setContentHTML?.(next)
  editorRef.current?.focusContentEditor?.()

  // Move caret after the bubble (where we left data-ss-caret)
  editorRef.current?.injectJavascript?.(`
    (function(){
      var caret = document.querySelector('p[data-ss-caret]');
      if (!caret) return true;
      var sel = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(caret);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      // Cleanup attribute (optional)
      caret.removeAttribute('data-ss-caret');
      true;
    })();
    true;
  `)

  return true
}

export async function updateDialogue(
  editorRef: React.RefObject<RichEditor>,
  patch: PartialDialogue,
) {
  console.log(patch.id, patch)
  const existing = await getBubbleData(patch.id, editorRef)
  if (!existing) return false

  const merged: DialogueData = {
    id: existing.id,
    name: patch.name ?? existing.name,
    message: patch.message ?? existing.message,
    avatarUrl: patch.avatarUrl ?? existing.avatarUrl,
    bubbleColor: patch.bubbleColor ?? existing.bubbleColor,
    textColor: patch.textColor ?? existing.textColor,
    nameColor: patch.nameColor ?? existing.nameColor,
    playIconColor: patch.playIconColor ?? undefined, // optional; we don't parse it back
    audioUrl: patch.audioUrl ?? existing.audioUrl,
  }
  console.log(merged)
  const { html } = dialogueHtml(merged) // keeps same id
  return replaceDialogueBlock(editorRef, merged.id!, html)
}

export async function upsertDialogue(editorRef: React.RefObject<RichEditor>, data: DialogueData) {
  if (data.id) {
    const exists = await getBubbleData(data.id, editorRef)
    if (exists) return updateDialogue(editorRef, data as PartialDialogue)
  }
  insertDialogue(editorRef, data)
  return true
}
export async function removeDialogue(editorRef: React.RefObject<RichEditor>, id: string) {
  const html = await editorRef.current?.getContentHtml?.()
  if (!html) return false

  const start = `<!--ss-dialogue-start:${id}-->`
  const end = `<!--ss-dialogue-end:${id}-->`
  const re = new RegExp(`${start}[\\s\\S]*?${end}`, "m")
  if (!re.test(html)) return false

  const next = html.replace(re, "") // delete the block
  editorRef.current?.setContentHTML?.(next)
  editorRef.current?.focusContentEditor?.()
  return true
}
