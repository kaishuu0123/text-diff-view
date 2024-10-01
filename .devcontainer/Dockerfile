FROM --platform=linux/amd64 mcr.microsoft.com/devcontainers/base:ubuntu

RUN apt -y update && apt install -y --no-install-recommends \
  build-essential clang libdbus-1-dev libgtk-3-dev \
  libnotify-dev libasound2-dev libcap-dev \
  libcups2-dev libxtst-dev \
  libxss1 libnss3-dev gcc-multilib g++-multilib curl \
  gperf bison python3-dbusmock
