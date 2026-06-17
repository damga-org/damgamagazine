---
phase: 02-code-review-command
reviewed: 2026-06-17T12:00:00Z
depth: deep
files_reviewed: 18
files_reviewed_list:
  - src/app/layout.js
  - src/app/page.js
  - src/app/globals.css
  - src/app/newsletter/[id]/page.js
  - src/app/admin/layout.js
  - src/app/admin/page.js
  - src/app/admin/login/page.jsx
  - src/app/admin/new/page.js
  - src/app/admin/edit/[id]/page.js
  - src/app/api/generate-pdf/route.js
  - src/lib/supabase.js
  - src/lib/supabase-admin.js
  - src/context/AuthContext.jsx
  - src/components/AuthGuard.jsx
  - src/components/NewsletterCard.js
  - src/components/NewsletterForm.js
  - src/components/SearchBar.js
  - src/components/SectionEditor.js
  - src/components/SectionRenderer.js
  - supabase/migrations/001_newsletters.sql
  - next.config.mjs
  - package.json
  - postcss.config.mjs
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 2: Code Review Report — Final Implementation Review

**Reviewed:** 2026-06-17T12:00:00Z  
**Depth:** deep  
**Files Reviewed:** 18 (23 including config/support files)  
**Status:** issues_found  

## Summary

The project implements a functional newsletter webapp (담가화로구이 가맹점 소식지) with admin CMS, public viewer, tsvector search, and PDF generation. The architecture is clean and the 8-route build passes successfully.

**Three critical bugs** were identified: (1) the admin dashboard crashes on load due to a missing function call (`ReferenceError`), (2) newsletter saves silently fail when `issue_month` is not set (violates `NOT NULL`), and (3) multi-word search is broken due to incompatible query syntax. Additionally, there are 5 warnings around error handling gaps and state mutation, and 3 informational items for hardening.

## Critical Issues

### CR-01: Admin dashboard crashes on load — `supabase` is not defined

**File:** `src/app/admin/page.js:19`  
**Issue:** The `loadNewsletters()` function references an undefined variable `supabase` instead of calling the imported `getSupabase()` function. This will throw a `ReferenceError: supabase is not defined` as soon as the admin dashboard mounts and `useEffect` triggers a data load. The build does not catch this because it is a runtime error in a `'use client'` component, not a TypeScript project.

```js
// Line 19 — BUG: supabase is not defined
const { data } = await supabase
  .from('newsletters')
  .select('*')
  .order('issue_month', { ascending: false })
```

**Fix:** Replace `supabase` with `getSupabase()`:

```js
const { data } = await getSupabase()
  .from('newsletters')
  .select('*')
  .order('issue_month', { ascending: false })
```

---

### CR-02: Save silently fails when `issue_month` is not set

**File:** `src/components/NewsletterForm.js:39`  
**Issue:** The `issueMonth` state starts as `''` (empty string) for new newsletters. The ternary at line 39 produces `null` for falsy values:

```js
issue_month: issueMonth ? `${issueMonth}-01` : null,
```

The database column `issue_month` is defined as `DATE NOT NULL`. When the user does not select a month (or clears it), `null` is sent to the DB, violating the constraint. The Supabase call at line 46-49 has no `try/catch`, so the error is silently swallowed. The user is redirected to `/admin` believing the save succeeded, but no data was persisted.

**Fix (pick one):**

Option A — Make the field mandatory (disable save buttons when empty):

```jsx
<button onClick={() => handleSave('draft')}
  disabled={saving || !title || !issueMonth}
  ...
>
```

Option B — Default to the current month when saving:

```js
const month = issueMonth || new Date().toISOString().slice(0, 7)
const payload = {
  ...
  issue_month: `${month}-01`,
}
```

---

### CR-03: Multi-word text search returns zero results

**File:** `src/app/page.js:27`  
**Issue:** The search query is processed by joining terms with ` & ` (e.g., `"menu soup"` → `"menu & soup"`), but the `.textSearch()` uses `type: 'websearch'`, which calls PostgreSQL's `websearch_to_tsquery`. This function does **not** recognize `&` as an operator — it treats `&` as a literal search term. Since `&` is not present in newsletter content, any multi-word query returns zero results. Single-word queries work because no splitting/joining occurs.

```js
// Line 27 — Bug: websearch doesn't use & operator
.textSearch('search_vector', query.trim().split(/\s+/).join(' & '), {
  type: 'websearch',
  config: 'simple',
})
```

**Fix:** Remove the `&` joining — `websearch_to_tsquery` already ANDs terms by default:

```js
.textSearch('search_vector', query.trim(), {
  type: 'websearch',
  config: 'simple',
})
```

> **Note:** The same pattern exists redundantly in `src/app/admin/page.js`, but the dashboard is currently broken due to CR-01. Fix CR-01 first, then apply this fix.

---

## Warnings

### WR-01: `pdf_url` DB update in PDF API has no error handling

**File:** `src/app/api/generate-pdf/route.js:124–127`  
**Issue:** After uploading the PDF to storage, the API route updates `pdf_url` in the newsletters table using `await getSupabaseAdmin().from('newsletters').update(…)`. The return value is not checked. If this update fails (network blip, RLS issue), the PDF is stored but its URL is lost — the newsletter is published without a working download link.

**Fix:** Check the response and return a 500 on error:

```js
const { error: updateError } = await getSupabaseAdmin()
  .from('newsletters')
  .update({ pdf_url: publicUrl })
  .eq('id', id)

if (updateError) {
  return NextResponse.json({ error: updateError.message }, { status: 500 })
}
```

---

### WR-02: Image upload fails silently

**File:** `src/components/NewsletterForm.js:26–35`  
**Issue:** If the cover image upload to Supabase Storage fails (bucket doesn't exist, permission denied, file too large), the error is silently ignored. The newsletter saves without the cover image, and the user sees no error.

**Fix:** At minimum, log the error. Better yet, surface it to the user:

```js
if (uploadError) {
  console.error('Image upload failed:', uploadError.message)
  // or: setError('이미지 업로드에 실패했습니다: ' + uploadError.message)
  setSaving(false)
  return  // abort save or continue with empty cover
}
```

---

### WR-03: Blob URL memory leak on cover image preview

**File:** `src/components/NewsletterForm.js:60`  
**Issue:** `URL.createObjectURL(file)` creates a blob URL that persists until explicitly revoked. When the user selects a new image or navigates away, the previous blob URL is never revoked. This leaks memory over repeated usage.

**Fix:** Track the blob URL and revoke it in a cleanup effect:

```js
const [coverPreview, setCoverPreview] = useState(newsletter?.cover_image || '')

useEffect(() => {
  return () => {
    if (coverPreview && coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview)
    }
  }
}, [])
```

Or revoke on each new selection:

```js
const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }
}
```

---

### WR-04: State mutation in `SectionEditor.addItem`

**File:** `src/components/SectionEditor.js:34–37`  
**Issue:** `addItem` mutates the section object in-place because `updated[sectionIndex]` is still a reference to the original state object (shallow copy only):

```js
const updated = [...sections]                      // shallow copy of array
updated[sectionIndex].items = [...(newItemsArray)]  // mutates shared object reference
```

This means `sections[sectionIndex]` (the original state) is mutated as a side effect. React may not detect the change properly, and this is an anti-pattern that can cause subtle bugs with memoized components or concurrent rendering.

**Fix:** Create a new section object:

```js
const addItem = (sectionIndex) => {
  const updated = [...sections]
  const items = [...(updated[sectionIndex].items || []), { name: '', description: '', image_url: '' }]
  updated[sectionIndex] = { ...updated[sectionIndex], items }
  onChange(updated)
}
```

The same fix applies to `removeItem` (line 40–44).

---

### WR-05: AuthGuard redirect loop when already on `/admin/login`

**File:** `src/components/AuthGuard.jsx:12–14`  
**Issue:** When an unauthenticated user navigates to `/admin/login`, `AuthGuard` checks the session, finds it null, and calls `router.push('/admin/login')` — redirecting to the same page. While Next.js may short-circuit same-URL navigations, this creates a fragile cycle. The login page only renders because `AuthGuard` returns `null` for a frame before the redirect fires.

**Fix:** Check the current path before redirecting:

```jsx
import { usePathname } from 'next/navigation'

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !session && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [session, loading, router, pathname])

  // ...rest
}
```

---

## Info

### IN-01: No brute force protection on login

**File:** `src/app/admin/login/page.jsx`  
**Suggestion:** The login form has no rate limiting, account lockout, or CAPTCHA. While this is acceptable for internal/admin tools with strong passwords, consider adding Supabase's built-in rate limiting or integrating a CAPTCHA service.

### IN-02: DB save operations unguarded

**File:** `src/components/NewsletterForm.js:45–49`  
**Suggestion:** Supabase insert/update calls have no `try/catch`. Database errors (constraint violations, network failures) silently fail. Wrap in a try/catch and set a user-facing error state to prevent silent data loss.

### IN-03: `newsletter-assets` bucket creation undocumented

**Files:** `src/app/api/generate-pdf/route.js:109`, `src/components/NewsletterForm.js:27`  
**Suggestion:** Both image uploads and PDF storage assume a `newsletter-assets` Supabase Storage bucket exists with appropriate policies. Add setup instructions to `README.md` or create a setup migration/script.

---

## Strengths

1. **Clean architecture:** Well-organized separation between public and admin routes, server and client components, and business logic (components) vs infrastructure (lib, API routes).

2. **Good security posture:** 
   - `AuthGuard` protects all admin routes at the layout level
   - PDF API route validates session before using service-role client
   - RLS policies correctly differentiate anon (published only) from authenticated (full access)
   - Service role key used only server-side
   - `setAll` cookies correctly omitted in read-only API context

3. **Solid schema design:** 
   - Proper tsvector with trigger-based auto-update
   - Appropriate indexes (`published_at`, `search_vector`, `status`)
   - Status constraint with CHECK, timestamptz for all dates

4. **Good UX patterns:** 
   - Debounced search (300ms)
   - Loading, empty, and error states handled in public pages
   - Optimistic navigation after save

5. **Build passes cleanly:** All 8 routes (6 app + 1 API + _not-found) compile without errors under Next.js 16.2.9 Turbopack.

---

_Reviewed: 2026-06-17T12:00:00Z_  
_Reviewer: gsd-code-reviewer (deep analysis)_  
_Depth: deep_
