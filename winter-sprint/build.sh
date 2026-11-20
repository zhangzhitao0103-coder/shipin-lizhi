#!/usr/bin/env bash
# One-command rebuild.
#   ./build.sh                                   re-render from existing voice (assets/voice.wav + timeline.json)
#   ./build.sh --tts KOKORO_DIR [ASR_DIR]        regenerate the voiceover first (ASR dir = precise subtitle cuts)
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
if [ "${1:-}" = "--tts" ]; then
  python3 scripts/tts.py --model-dir "$2" ${3:+--asr-dir "$3"}
fi
node scripts/render.mjs --events      # visual beats -> assets/events.json
python3 scripts/soundtrack.py         # music + sound effects synced to the beats
./scripts/mix.sh                      # voice processing + mix -> assets/mix.wav
node scripts/render.mjs --workers 3   # frames -> output/winter_sprint_60s_1080x1920.mp4
