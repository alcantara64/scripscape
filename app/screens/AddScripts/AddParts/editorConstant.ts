export type TabKey = "last_used" | "asc" | "des"
export const TAB_ITEMS: Array<{ label: string; key: TabKey }> = [
  { label: "Last Used", key: "last_used" },
  { label: "A–Z", key: "asc" },
  { label: "Z–A", key: "des" },
]

export const DIALOGUE_CSS = `
  /* --- keep these --- */
.ss-dialogue-wrap{
  position:relative; margin:10px 0;
  -webkit-user-select:none; user-select:none;
  -webkit-user-modify:read-only;
  caret-color: transparent;
}

/* The overlay that turns the whole bubble into an edit target */
.ss-dialogue-tap{
  position:absolute; inset:0; background:transparent; border:0; padding:0; margin:0;
  z-index:1;               /* BELOW the play control */
  cursor:pointer;
  pointer-events:auto;     /* clickable */
}

/* Render-only content shouldn't intercept clicks */
.ss-dialogue{ pointer-events:none; display:flex; align-items:flex-start; gap:10px; }
.ss-avatar{ width:28px; height:28px; border-radius:50%; overflow:hidden; flex:0 0 28px; background:#2B2A45; }
.ss-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
.ss-bubble{ position:relative; flex:1; border-radius:14px; padding:10px 44px 10px 12px; box-shadow:0 2px 8px rgba(0,0,0,.18); }
.ss-name{ font-weight:700; font-size:13px; line-height:16px; margin-bottom:2px; }
.ss-text{ font-size:14px; line-height:20px; white-space:pre-wrap; }

/* --- PLAY CONTROL --- */
.ss-play{
  position:absolute; right:8px; top:50%; transform:translateY(-50%);
  width:36px; height:28px; border-radius:14px;
  background:rgba(255,255,255,.75); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center;
  z-index:2;                 /* ABOVE the tap overlay */
  pointer-events:auto;       /* clickable area restored */
}

.ss-play-btn{   all: unset;           /* removes all UA default button styles */
  display: inline-flex; /* keep it a flex container */
  cursor: pointer;      /* show hand cursor */
  line-height: 0;       /* prevent extra inline spacing */
  padding: 0;
  margin: 0;
  border: 0;
  background: none; }

/* Make inner SVG ignore events so the <button> is the hit target */
.ss-play-btn svg,
.ss-play-btn * { pointer-events:none; }

/* 🚫 REMOVE THIS RULE
.ss-dialogue-wrap * { pointer-events: none; }
*/
`.trim()

export const LOCATION_CSS = `
  .ss-location { margin: 14px 0; position: relative; }
  .ss-location figure { margin: 0; }
  .ss-location img {
    width: 100%; height: auto; border-radius: 12px; display: block;
    box-shadow: 0 2px 8px rgba(0,0,0,.18);
  }
  .ss-location .ss-cap {
    font-size: 12px; line-height: 16px; opacity: .85; margin-top: 6px;
  }
`.trim()

export const editorContentStyle = (colors: any) => ({
  backgroundColor: "transparent",
  placeholderColor: colors.palette.secondary300,
  contentCSSText: `font-size:16px; line-height:24px; ${DIALOGUE_CSS}\n${LOCATION_CSS}`,
  color: colors.text,
})

export const validateTitle = (v: string) =>
  v.trim().length < 3 ? "Title must be at least 3 characters" : undefined

export const buildLocationHTML = (item: { image: string; name: string; hideName: boolean }) => {
  const caption = item.hideName
    ? ""
    : `<figcaption class="ss-cap">${escapeHtml(item.name)}</figcaption>`
  return `
    <div class="ss-location" data-ss="location" data-name="${escapeAttr(item.name)}">
     ${caption}
      <figure>
        <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.name || "Location")}"/>
      </figure>
    </div>
    <p><br/></p>
  `.trim()
}

const escapeHtml = (s: string) =>
  s?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") ?? ""
const escapeAttr = (s: string) =>
  s?.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;") ?? ""

// editorConstant.ts (additions)
export function buildCharacterDialogueHTML(args: {
  id: string // generate uuid before insert
  name: string
  avatar?: string
  bubbleBg: string
  textColor: string
  dialogue: string
  audioSrc?: string // file://, https://, or base64
}) {
  const { id, name, avatar, bubbleBg, textColor, dialogue, audioSrc } = args

  // contenteditable="false" prevents the caret from entering the block
  // data-* attributes let our bridge JS recognize and handle clicks
  return `
    <div class="dlg" data-type="dialogue" data-id="${id}" contenteditable="false" style="margin:12px 0;">
      <div class="dlg-row" style="display:flex; gap:10px; align-items:flex-start;">
        <img src="${avatar ?? ""}" alt="${name}" class="dlg-avatar" style="width:40px;height:40px;border-radius:20px;object-fit:cover; background:#3a2a84;" />
        <div class="dlg-bubble" style="flex:1;border-radius:14px;padding:10px 12px;background:${bubbleBg};color:${textColor};">
          <div class="dlg-name" style="font-weight:600;opacity:.9;margin-bottom:6px;">${name}</div>
          <div class="dlg-text" style="line-height:1.35;">${dialogue.replace(/\n/g, "<br/>")}</div>
          ${
            audioSrc
              ? `
            <div class="dlg-audio" style="display:flex;align-items:center;gap:10px;margin-top:10px;">
              <button class="audio-btn" data-id="${id}" style="padding:6px 10px;border-radius:10px;border:none;background:#4C3AA5;color:white;">▶︎ Play</button>
              <audio id="audio-${id}" src="${audioSrc}"></audio>
            </div>`
              : ""
          }
        </div>
      </div>
    </div>
  `
}

export const TEXT_BACKGROUND_COLORS = [
  "#AEDEF7",
  "#A8F5ED",
  "#F2F5D5",
  "#E9CDFD",
  "#F9BCBC",
  "#E8FBDA",
  "#F3E399",
  "#BBFDD4",
] as const

export const TEXT_COLOR = [
  "#1389C8",
  "#15A496",
  "#AF7E15",
  "#2C087F",
  "#B24513",
  "#438114",
  "#9C7F00",
  "#10863D",
] as const
