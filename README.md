# Text Diff View

A simple diff viewer that only compares what is entered in the left and right text boxes.

## Demo

https://sandbox.saino.me/text-diff-view/

If you don't want to download the electron app, try the web version.

also provide docker images.

## Theme

| light                                                                                                            | dark                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![Screenshots](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20240930_screenshot_light.png) | ![Screenshots](https://raw.github.com/kaishuu0123/text-diff-view/main/screenshots/20240930_screenshot_dark.png) |

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

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

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
