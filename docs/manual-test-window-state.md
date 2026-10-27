# Manual test: window state persistence

Text Diff View uses Electron's built-in window state persistence (`name: 'main-window'`, `windowStatePersistence: true`).
Run this checklist after upgrading Electron or touching window creation code in `src/main/index.ts`.

Start the app with `yarn dev`, or use a packaged build. To start from a clean state, use an empty user data dir (`--user-data-dir=/tmp/test-ud`).

1. **Clean start**: launch with a clean user data dir. The window opens at the default size (800x600), centered.
2. **Bounds**: move and resize the window, quit, relaunch. Same position and size.
3. **Maximized**: maximize, quit, relaunch. Starts maximized.
4. **Un-maximized**: un-maximize, move the window, quit, relaunch. Starts un-maximized at the last position.
5. **Display removed (quit)**: move the window to the secondary display, quit, disconnect that display, relaunch. The window opens fully inside the remaining display.
6. **Display removed (running)**: with the window on the secondary display, disconnect it while the app is running. The window is not left off-screen.
7. **Smaller resolution**: change the primary display to a smaller resolution, relaunch. The window fits inside the screen.

Items 1-5 and 7 were verified on Electron 45.0.0 (Linux, Xvfb + openbox). Item 6 could not be emulated there and needs a real multi-monitor setup. If it fails, add a `screen.on('display-removed')` handler that calls `mainWindow.center()` when the window is no longer visible.

Headless Linux tip: `xvfb-run` + `openbox`, with `xdotool` / `wmctrl` (`wmctrl -ic <id>` closes the window gracefully so the state is saved), can drive items 1-4 and 7.
