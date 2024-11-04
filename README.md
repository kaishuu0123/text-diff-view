<p align="center">
  <img width="256" height="256" src="https://raw.github.com/kaishuu0123/text-diff-view/main/build/icon.png">
</p>

# Text Diff View

<a href="https://github.com/kaishuu0123/text-diff-view/releases">

![GitHub Release](https://img.shields.io/github/v/release/kaishuu0123/text-diff-view)

</a>

A simple diff viewer that only compares what is entered in the left and right text boxes.

- [Motivation](#motivation)
- [Usage](#usage)
- [Demo](#demo)
- [Support platform](#support-platform)
- [Download](#download)
- [Screenshots](#screenshots)
  - [Theme](#theme)
- [Recommended IDE Setup](#recommended-ide-setup)
- [Project Setup](#project-setup)
  - [Install](#install)
  - [Development](#development)
  - [Build](#build)

## Motivation

1. simple tool to compare left and right text
1. works offline (no server required.)
1. multi-platform support (Windows, macOS, Linux)

The difference calculation is done using [monaco editor (microsoft/monaco-editor)](https://microsoft.github.io/monaco-editor/), I just built the layout and the electron app.

## Usage (use example_texts)

Basically, just type the text on the left and right and you're done.

Use this explanation when you want to see large diff.

1. Copy the contents of `example_texts/freebsd_sbin_route/left_82641e1.txt` from this repository to your clipboard and paste it into the text box on the left.
1. Copy the contents of `example_texts/freebsd_sbin_route/right_158f319.txt` from this repository to your clipboard and paste it into the text box on the right.

## Demo

https://sandbox.saino.me/text-diff-view/

If you don't want to download the electron app, try the web version.

also provide [docker image](https://github.com/kaishuu0123/text-diff-view/pkgs/container/text-diff-view).

## Download

- [Download from releases](https://github.com/kaishuu0123/text-diff-view/releases)

## Support platform

- Windows
- Linux
- macOS

## Screenshots
### Theme

| light                                                                                                            | dark                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![Screenshots](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20240930_screenshot_light.png) | ![Screenshots](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20240930_screenshot_dark.png) |

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [devcontainer](https://code.visualstudio.com/docs/devcontainers/tutorial)

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## Thanks

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [electron-vite](https://github.com/alex8088/electron-vite)
- [@vscode/codicons](https://github.com/microsoft/vscode-codicons)
- [suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)
