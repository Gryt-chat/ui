---
"@gryt/ui": minor
---

Every component now has its own entry point, like `@gryt/ui/button` and `@gryt/ui/video-player`. The build keeps one file per source module, and interactive components keep their `"use client"`. A Next.js server component can import them now, and a page that uses one Button ships about 12 KB gzipped of @gryt/ui instead of about 228 KB. `@gryt/ui` still exports everything, and existing imports don't need to change.
