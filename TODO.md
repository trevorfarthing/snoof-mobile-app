- Design some mockups with Stitch
- Set up complex forms with react-hook-form

### Features

- Generate some assets for whimsical icons on empty / loading screens (animations + images)
- Create onboarding flow / tutorial screens
- Lock down features behind Pro subscription and prompt user to upgrade (upsell sheet)
- Figure out how to use local-first data (expo-sqlite) and sync to Supabase. Reference Gemini chat on this.
- Create a pixel art sprite customizer for your pet (Stardew Valley style) - check out PixelLab AI, can also do animations with this
- Badges / achievements for the more things you do in the app
- Animate the progress bars for goals increasing after you log an activity
- Fade transition between SVG hero backgrounds when time changes
- Add haptics everywhere that needs it
- Add docs for all areas of the app in docs/ folder and CLAUDE.md in various folders
- Implement dark mode
- Add ability to select multiple pets on log modals - avatars with name underneath (ellipsis if too long) with text that updates, e.g. "Log a walk for: Ruby, Poppy"
- Make everything clickable - stat cards, care streak days - should take you to another screen or modal with more details or a graph or something

## Refactor

- Potentially refactor toast to global context/provider
- Better global refresh trigger: Zustand state or TanStack React Query
- Set up Supabase Realtime in some areas to sync households between users
- CREATE TESTS - Playwright? pgTAP?

## Bugs

- Number input on Walk distance/duration hides the whole card when you type in number
- After selecting a time started / ended, if you click on another field without clicking the time field again, the time selector doesn't close
