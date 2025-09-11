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
}

const genId = () => `dlg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export function dialogueHtml(d: DialogueData) {
  const id = d.id ?? genId()
  const bubbleColor = d.bubbleColor ?? "#E7D6FF"
  const textColor = d.textColor ?? "#1D1B3A"
  const nameColor = d.nameColor ?? "#3B2A8C"
  const playIconColor = d.playIconColor ?? "#5E46F8"

  const onClick =
    `event.preventDefault();event.stopPropagation();` +
    `window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(` +
    `'{"type":"edit-dialogue","id":"${id}"}'` +
    `);`

  const bubble = `
    <!--ss-dialogue-start:${id}-->
    <div class="ss-dialogue-wrap"
         contenteditable="false"
         role="button" aria-label="Edit dialogue"
         data-ss-id="${id}"
         onclick="${onClick}"
         onmousedown="event.preventDefault();"
         onmouseup="event.preventDefault();"
         onfocus="event.preventDefault();"
         tabindex="-1">
      <div class="ss-dialogue">
        <div class="ss-avatar">
          ${d.avatarUrl ? `<img src="${esc(d.avatarUrl)}" alt="${esc(d.name)}" />` : ""}
        </div>
        <div class="ss-bubble" style="background:${bubbleColor}">
          <div class="ss-name" style="color:${nameColor}">${esc(d.name)}</div>
          <div class="ss-text" style="color:${textColor}">${esc(d.message)}</div>
          <div class="ss-play" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="${playIconColor}" stroke-width="2" opacity="0.6"/>
              <path d="M10 8L16 12L10 16V8Z" fill="${playIconColor}" />
            </svg>
          </div>
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
  // inject a script to the editor document
  editorRef.current?.insertHTML?.(`
    <script>
      (function(){
        if (window.__ss_dialogue_edit_bound) return; window.__ss_dialogue_edit_bound = true;
        document.addEventListener("click", function(e){
          var root = e.target.closest && e.target.closest(".ss-dialogue");
          if(!root) return;
          var id = root.getAttribute("data-ss-id") || "";
          var name = (root.querySelector(".ss-name")||{}).textContent || "";
          var textEl = root.querySelector(".ss-text");
          var message = textEl ? textEl.textContent : "";
          var bubble = (root.querySelector(".ss-bubble")||{}).style.background || "";
          var nameColor = (root.querySelector(".ss-name")||{}).style.color || "";
          var textColor = textEl ? textEl.style.color : "";
          var img = root.querySelector(".ss-avatar img");
          var avatarUrl = img ? img.getAttribute("src") : "";
          var payload = { type:"edit-dialogue", id, name, message, bubbleColor:bubble, nameColor, textColor, avatarUrl };
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }, true);
      })();
    </script>
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
  // quick extractions:
  const name = /<div class="ss-name"[^>]*>([\s\S]*?)<\/div>/.exec(block)?.[1] ?? ""
  const message = /<div class="ss-text"[^>]*>([\s\S]*?)<\/div>/.exec(block)?.[1] ?? ""
  const avatarUrl = /<img src="([^"]+)"/.exec(block)?.[1] ?? ""
  const bubbleColor = /class="ss-bubble" style="background:([^";]+)[^"]*"/.exec(block)?.[1] ?? ""
  const nameColor = /class="ss-name" style="color:([^";]+)[^"]*"/.exec(block)?.[1] ?? ""
  const textColor = /class="ss-text" style="color:([^";]+)[^"]*"/.exec(block)?.[1] ?? ""
  return { id, name, message, avatarUrl, bubbleColor, nameColor, textColor }
}
