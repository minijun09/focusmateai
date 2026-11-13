#!/bin/zsh
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  focusmate_node="$(command -v node)"
else
  focusmate_node="/Users/jun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$focusmate_node" ]; then
  echo 'Node.js 22 이상을 설치한 뒤 다시 실행해 주세요.'
  read -r
  exit 1
fi
export PATH="$(dirname "$focusmate_node"):$PATH"
if [ ! -d node_modules/vite ]; then
  echo '먼저 이 폴더에서 pnpm install을 실행해 주세요.'
  read -r
  exit 1
fi
exec "$focusmate_node" node_modules/vite/bin/vite.js --host 127.0.0.1 --open
