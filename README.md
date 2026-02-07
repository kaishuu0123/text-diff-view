<p align="center">
  <img width="128" height="128" src="https://raw.github.com/kaishuu0123/text-diff-view/main/build/icon.png">
</p>

# Text Diff View

<a href="https://github.com/kaishuu0123/text-diff-view/releases">

![GitHub Release](https://img.shields.io/github/v/release/kaishuu0123/text-diff-view)

</a>

A simple, fast, and privacy-focused text comparison tool powered by Monaco Editor.

- [Overview](#overview)
- [Screenshots](#screenshots)
  - [Features](#features-1)
  - [Theme](#theme)
- [Features](#features)
- [Usage](#usage)
  - [Basic Comparison](#basic-comparison)
  - [Viewing Large Diffs](#viewing-large-diffs)
  - [Generating Unified Diff](#generating-unified-diff)
- [Demo](#demo)
- [Download](#download)
- [Support platform](#support-platform)
- [Motivation](#motivation)
- [Development](#development)
  - [Recommended IDE Setup](#recommended-ide-setup)
  - [Project Setup](#project-setup)
    - [Install](#install)
    - [Development](#development-1)
    - [Build](#build)
- [Technology Stack](#technology-stack)
- [LICENSE](#license)

## Overview

**Text Diff View** is a straightforward diff viewer designed to instantly compare content entered into two text boxes. It operates entirely offline to ensure privacy and reliability, and supports **Unified Diff (patch format) generation** for seamless developer workflows.

## Screenshots

### Features

| Main                                                                                          | Unified Diff                                                                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ![Main](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20260207/main.png) | ![Unified Diff](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20260207/unified_diff.png) |

### Theme

| Light                                                                                                | Dark                                                                                                |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ![Light Theme](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20260207/main.png) | ![Dark Theme](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20260207/dark.png) |

## Features

- **Side-by-Side Diff**: Compare text with Monaco Editor's powerful diff visualization
- **Unified Diff Export**: Generate standard unified diff patches with syntax highlighting
- **Offline First**: Works completely offline - no server required, your data stays local
- **Theme Support**: Light and dark themes with synchronized editor and UI
- **Cross-Platform**: Available for Windows, macOS, and Linux
- **Monaco Editor**: Powered by the same editor engine used in VS Code

## Usage

### Basic Comparison

Simply type or paste text into the left and right text boxes. The differences will be highlighted automatically.

### Viewing Large Diffs

To test with a real-world example:

1. Copy the contents of `example_texts/freebsd_sbin_route/left_82641e1.txt` from this repository to your clipboard and paste it into the left text box.
2. Copy the contents of `example_texts/freebsd_sbin_route/right_158f319.txt` from this repository to your clipboard and paste it into the right text box.

### Generating Unified Diff

Click the **"Show Unified Diff"** button in the toolbar to:

- View the differences in standard unified diff format (patch format)
- Copy the patch to clipboard for use with `git apply`, `patch`, or other tools
- See syntax-highlighted diff output with proper `---`/`+++` headers and `@@` hunk markers

## Demo

https://sandbox.saino.me/text-diff-view/

If you don't want to download the Electron app, try the web version.

Also available as a [Docker image](https://github.com/kaishuu0123/text-diff-view/pkgs/container/text-diff-view).

## Download

- [Download from releases](https://github.com/kaishuu0123/text-diff-view/releases)

## Support platform

- Windows (x64, arm64)
- Linux (x64, arm64, AppImage, deb, rpm)
- macOS (Intel, Apple Silicon)

## Motivation

1. Simple tool to compare left and right text
1. Works offline (no server required)
1. Multi-platform support (Windows, macOS, Linux)
1. Generate unified diff patches for version control workflows

The difference calculation is done using [Monaco Editor (microsoft/monaco-editor)](https://microsoft.github.io/monaco-editor/). This project provides the Electron app wrapper and UI layout.

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [devcontainer](https://code.visualstudio.com/docs/devcontainers/tutorial)

### Project Setup

#### Install

```bash
$ yarn
```

#### Development

```bash
$ yarn dev
```

#### Build

```bash
# For Windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## Technology Stack

- **Framework:** Electron
- **UI:** React + TypeScript
- **Editor:** Monaco Editor
- **Styling:** Tailwind CSS
- **Build:** electron-vite

# LICENSE

MIT

---

Made by [kaishuu0123](https://github.com/kaishuu0123) ✨
