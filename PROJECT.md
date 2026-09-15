# Project: Studio Editor (CreateBirthday.tsx) Neo-Japanese Cyber-Zen Redesign

## Architecture
- **Framework**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion.
- **Data Flow**: Unidirectional state flow with `formData: BirthdayData` as the single source of truth in `CreateBirthday.tsx`, passed synchronously to `BirthdayPage` in live preview mode (`initialData={formData}`, `isPreview={true}`) for instant real-time reflection.
- **Storage**: Debounced auto-save (600ms) to LocalStorage (`sakura_autosave_draft`) and export/publish to LocalStorage (`sakura_birthdays_v2`) and shareable compressed URLs (`shareEncoder.ts`).
- **Audio Architecture**: `SakuraAudioEngine` (Web Audio API synthesizers for ambient presets: Zen temple bell, gentle rain & koto, lo-fi beats, koto classic), `YouTubeAudioPlayer` for YouTube audio, and HTML5 Audio for uploaded/linked MP3s.
- **Rendering & Containment**: Split-screen with independent left-pane scroll and right-pane preview frame. Mockup viewports enforce strict CSS containment (`contain: paint`, `transform: translateZ(0)`) to lock full-screen canvas particles into the preview frames.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Neo-Japanese Cyber-Zen Styling | Frosted glassmorphism, Kintsugi gold hairline seams, Hanko stamps, washi textures, fine typography | M2 | R1, Survey 1, 2 |
| 2 | 4-Pillar Category Navigation | Scientific 4-category bar (Profile & Greetings, Handwritten Letter, 3D Memory Album, Soundtrack & Sakura) | M2 | R1, Survey 1, 2 |
| 3 | Split-Screen Desktop Layout | Dual-column desktop (>=1024px) with fixed header, independently scrollable editor, right live preview | M2 | R2, Survey 1, 2 |
| 4 | Mobile Responsive Mode | Mobile (<1024px) segmented toggle between "Chỉnh sửa" and "Xem trước", sticky quick FAB | M2 | R2, Survey 1, 2 |
| 5 | Ambient Audio Synthesis Engine | Web Audio API presets: Zen temple bell, gentle rain & koto, lo-fi beats, koto classic in `audioSynthesizer.ts` | M1 | R3, Survey 3 |
| 6 | Data Types & URL Encoder Integrity | `AmbientPresetId` in `types/birthday.ts`, `note` serialization in `shareEncoder.ts` | M1 | R3, Survey 1, 3 |
| 7 | Live Preview Real-time Optimization | `SakuraCanvas` memoization, direct `initialData` flow in `BirthdayPage`, instant preview typing | M1 | AC, Survey 3 |
| 8 | Interactive 3D Polaroid Card Editor | Front: photo, caption, year, location; Back: Hanko seal & secret note `mem.note`, 3D flip animation | M3 | R3, Survey 1, 2, 3 |
| 9 | Memory Album Batch Operations | Batch photo upload, blank card creation, URL input, delete card, capacity indicator | M3 | R3, Survey 2, 3 |
| 10 | Studio Music Controls | YouTube URL & trimming, MP3 upload/URL, ambient preset selector, volume slider, playback visualizer | M3 | R3, Survey 3 |
| 11 | Device Frame Switcher Mockups | Titanium smartphone frame with Dynamic Island vs Desktop browser frame with macOS traffic lights & URL | M4 | R2, Survey 1, 2 |
| 12 | Preview Utilities & Containment | Canvas containment (`contain: paint`), refresh/replay button, new tab launcher, zoom scaler | M4 | R2, Survey 1, 2 |
| 13 | 100% E2E Test Suite Pass | Comprehensive requirement-driven opaque-box test suite (Tiers 1-4), clean `npm run build` | M5 | AC |
| 14 | Adversarial Coverage Hardening | Tier 5 adversarial stress testing and white-box gap analysis | M5 | AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Studio Foundation & Audio Engine | `src/types/birthday.ts`, `src/utils/audioSynthesizer.ts`, `src/utils/shareEncoder.ts`, `src/components/SakuraCanvas.tsx`, `src/pages/BirthdayPage.tsx` | none | DONE |
| M2 | Neo-Japanese Cyber-Zen Studio Editor | `src/pages/CreateBirthday.tsx`, `src/components/MusicEditor.tsx`, UI styling, 4-pillar nav, split-screen, 3D Polaroid front/back, preview frames | M1 | DONE |
| M3 | Final Acceptance, E2E Test Pass & Hardening | Full requirement-driven E2E test suite (Tiers 1-4), Tier 5 adversarial coverage hardening, 100% clean build verification | M1, M2 | DONE |

## Interface Contracts
### `src/types/birthday.ts`
- `AmbientPresetId = 'koto-classic' | 'zen-bell' | 'rain-koto' | 'lofi-beats'`
- `BirthdayData.ambient_preset?: AmbientPresetId`
- `MemoryItem.note?: string` (preserved across all operations)

### `src/utils/audioSynthesizer.ts`
- `SakuraAudioEngine.setPreset(preset: AmbientPresetId): void`
- `SakuraAudioEngine.playPreset(preset: AmbientPresetId): void`

### `src/utils/shareEncoder.ts`
- `minifyBirthdayForUrl(data: BirthdayData): string` (must include `m.n` for `mem.note`)
- `unminifyBirthdayFromUrl(encoded: string): BirthdayData | null` (must restore `note: m.n`)

### `CreateBirthday.tsx` ↔ `BirthdayPage.tsx`
- `<BirthdayPage initialData={formData} isPreview={true} />`
- Preview mode guarantees instant text reflection, zero audio autoplay, and preserved particle loop.

## Code Layout
- `src/types/birthday.ts`: Core data types and presets
- `src/utils/audioSynthesizer.ts`: Web Audio API ambient synthesis engine
- `src/utils/shareEncoder.ts`: Compact URL serializer / deserializer
- `src/components/SakuraCanvas.tsx`: Particle canvas animation and memoization
- `src/pages/CreateBirthday.tsx`: Studio Editor main entry point and split layout
- `src/components/MusicEditor.tsx`: Studio music controller component
- `src/pages/BirthdayPage.tsx`: Live preview target recipient card
- `tests/e2e/`: E2E test runner and test cases
