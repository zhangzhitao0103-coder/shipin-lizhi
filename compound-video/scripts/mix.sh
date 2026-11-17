#!/usr/bin/env bash
# Mix voice + background music -> assets/mix.wav
#  - music sits ~20 dB under the voice and ducks further while the voice speaks
#  - final loudness normalised to -16 LUFS (short-video standard), true peak -1.5 dB
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -loglevel error -i assets/voice.wav -i assets/bgm.wav -filter_complex "\
[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,asplit=2[v][vsc];\
[1:a]aresample=48000,volume=-17dB[b];\
[b][vsc]sidechaincompress=threshold=0.03:ratio=5:attack=30:release=500:makeup=1[bd];\
[v][bd]amix=inputs=2:normalize=0:duration=longest,atrim=0:30,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]" \
  -map "[a]" -c:a pcm_s16le assets/mix.wav
echo "assets/mix.wav written"
