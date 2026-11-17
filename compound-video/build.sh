#!/usr/bin/env bash
# One-command rebuild.
#   ./build.sh                 # re-render video from existing assets (voice/bgm/timeline)
#   ./build.sh --tts MODEL_DIR # also regenerate the voiceover with the offline TTS model
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
if [ "${1:-}" = "--tts" ]; then
  python3 scripts/tts.py --model-dir "$2"
fi
[ -f assets/bgm.wav ] || python3 scripts/bgm.py
./scripts/mix.sh
node scripts/render.mjs
echo "done -> output/compound_growth_30s_1080x1920.mp4"
