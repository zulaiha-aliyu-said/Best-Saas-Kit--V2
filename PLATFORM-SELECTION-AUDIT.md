# Platform Selection & Output Routing — Technical Audit

**Date:** 2025-02-15  
**Scope:** Repurpose flow — platform selection to AI generation to response.

---

## 1. Summary

Users selecting a single platform (e.g. LinkedIn) were receiving content for multiple platforms because:

1. **The AI prompt always requested all platforms** — it never used the request body `platforms` array.
2. **Only 4 of 7 output keys were stripped** when not selected; `facebook_post`, `reddit_post`, and `pinterest_description` were left in the response.
3. **Fallback (no-AI) path** always generated all platforms (x, linkedin, instagram, email) and did not respect `platforms`.

---

## 2. Frontend Analysis

### 2.1 Where platform selection is handled

- **Repurpose page:** `src/app/dashboard/repurpose/page.tsx`
- Selection is driven by buttons in `#rp-platforms` with `data-key` (platform id) and `data-active="true"` when selected.
- On submit, platforms are collected and sent in the request body:

```ts
const container = document.getElementById('rp-platforms');
const platforms: string[] = [];
container?.querySelectorAll('button[data-key]')?.forEach((btn) => {
  const b = btn as HTMLButtonElement;
  if (b.dataset.active === 'true') platforms.push(String(b.dataset.key));
});
// ...
body: JSON.stringify({ sourceType: tab, text, url, platforms, numPosts, tone, contentLength, options })
```

- Other entry points (e.g. Trends, Templates customize) also send `platforms` to `/api/repurpose`.

**Conclusion:** Frontend correctly collects and sends `platforms` in the POST body.

### 2.2 How the response is displayed

- The repurpose page sets `setOutput(data.output)` and renders one card per output key:
  - `tweets.length > 0` → X thread card
  - `output?.linkedin_post` → LinkedIn card
  - `output?.instagram_caption` → Instagram card
  - `output?.facebook_post` → Facebook card
  - `output?.reddit_post` → Reddit card
  - `output?.pinterest_description` → Pinterest card
  - `output?.email_newsletter` → Email card

- Display is purely “if this key exists, show it.” There is no filtering by “platforms that were requested.” So any platform key present in `data.output` is shown, which allowed extra platforms to appear when the API returned them.

---

## 3. Backend Analysis

### 3.1 Request parsing

- **File:** `src/app/api/repurpose/route.ts`
- Body default: `platforms = ['x', 'linkedin', 'instagram', 'email']` if omitted.
- Later: `const include = new Set<string>(platforms as string[]);`

**Conclusion:** Selected platforms are correctly read and stored in `include`.

### 3.2 How selection is passed to generation

- **It was not.** The system prompt and user message were built once and never used `platforms` or `include`:
  - System prompt (lines 242–262) always listed all 7 platforms and a single JSON schema containing all keys:  
    `x_thread`, `linkedin_post`, `instagram_caption`, `email_newsletter`, `facebook_post`, `reddit_post`, `pinterest_description`.
  - User message (lines 289–304) always said: “Generate EXACTLY N tweets … Return ONLY the JSON,” implying the full object.

So the model was always instructed to produce content for every platform, regardless of user selection.

### 3.3 Post-generation stripping

- After parsing the AI response, the route deleted output only for four platforms when not in `include`:

```ts
if (!include.has('x') && parsed?.x_thread) delete parsed.x_thread;
if (!include.has('linkedin') && parsed?.linkedin_post) delete parsed.linkedin_post;
if (!include.has('instagram') && parsed?.instagram_caption) delete parsed.instagram_caption;
if (!include.has('email') && parsed?.email_newsletter) delete parsed.email_newsletter;
```

- There were **no** equivalent `delete` lines for:
  - `parsed.facebook_post`
  - `parsed.reddit_post`
  - `parsed.pinterest_description`

So if the AI returned those keys, they remained in `parsed` and were sent to the client, leading to extra platform cards (e.g. Facebook, Reddit, Pinterest) even when the user had selected only LinkedIn.

### 3.4 Fallback path (no OpenRouter/Groq)

- When no AI provider is used, the code builds a single `parsed` object with:
  - `x_thread`, `linkedin_post`, `instagram_caption`, `email_newsletter`
- It did not check `include`; it always generated all four. So fallback output also ignored platform selection.

### 3.5 JSON parse fallback

- On parse error after AI call, the route used a default object that included all platforms (including `facebook_post`, `reddit_post`, `pinterest_description`). That again could surface unselected platforms.

---

## 4. Root Causes (Concise)

| # | Issue | Location | Effect |
|---|--------|----------|--------|
| 1 | Prompt always describes all platforms and full JSON schema | `route.ts` system + user message | AI generates every platform; selection ignored at generation time. |
| 2 | User message always asks for “EXACTLY N tweets” and full JSON | `route.ts` user message | Reinforces generating all platforms. |
| 3 | Only 4 platforms stripped after parse | `route.ts` post-parse block | facebook/reddit/pinterest stay in response when not selected. |
| 4 | Fallback (no-AI) builds all four platforms | `route.ts` fallback block | Unselected platforms still returned when no AI. |
| 5 | Parse-failure default object includes all 7 platforms | `route.ts` catch blocks | Same as above on malformed AI response. |

---

## 5. Fixes Applied

1. **Prompt and user message are built from `include` only**
   - System prompt “EXACT SPECIFICATIONS” and the JSON format list only the platforms in `platforms` (e.g. only LinkedIn if user chose only LinkedIn).
   - User message explicitly lists what to generate (e.g. “Generate only: linkedin_post”) and does not ask for tweets when X is not selected.

2. **Stripping extended to all seven platforms**
   - After parsing, delete every platform key that is not in `include` (including `facebook_post`, `reddit_post`, `pinterest_description`).

3. **Fallback path respects `include`**
   - Fallback only generates and sets keys for platforms in `include` (e.g. only linkedin_post when only LinkedIn is selected).

4. **Parse-failure default respects `include`**
   - Default object on JSON parse error only includes keys for platforms in `include`, not a fixed full object.

With these changes, generation and response strictly respect the selected platform(s) end to end.
