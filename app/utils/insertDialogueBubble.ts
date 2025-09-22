// utils/dialogue.ts
import type { RichEditor } from "react-native-pell-rich-editor"

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

  function toggleAudio(id){
    var a = document.getElementById('ss-audio-'+id);
    if (!a) return;
    if (a.paused) a.play(); else a.pause();
  }
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
