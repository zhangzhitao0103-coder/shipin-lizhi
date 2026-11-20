#!/usr/bin/env bash
# Voice + music + SFX  ->  assets/mix.wav
#  voice : high-pass, chest warmth (+150 Hz), presence (+3 kHz), compression, light hall reverb
#  music : sits under the voice and ducks further while the voice speaks (sidechain)
#  sfx   : light ducking so hits stay punchy but never cover words
#  master: -14 LUFS (short-video platforms), true peak -1 dB
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -loglevel error -i assets/voice.wav -i assets/music.wav -i assets/sfx.wav -filter_complex "\
[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=75,\
equalizer=f=150:t=q:w=1.0:g=3,equalizer=f=3200:t=q:w=1.2:g=3.5,equalizer=f=7000:t=q:w=1.5:g=-2,\
acompressor=threshold=-20dB:ratio=3.5:attack=4:release=90:makeup=2,\
aecho=0.85:0.5:38|61:0.12|0.08,volume=1.0,asplit=3[v][sc1][sc2];\
[1:a]volume=-15dB[m];[m][sc1]sidechaincompress=threshold=0.025:ratio=6:attack=25:release=450[md];\
[2:a]volume=-10dB[s];[s][sc2]sidechaincompress=threshold=0.03:ratio=5:attack=3:release=250[sd];\
[v][md][sd]amix=inputs=3:normalize=0:duration=longest,atrim=0:60,\
loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000[a]" -map "[a]" -c:a pcm_s16le assets/mix.wav
echo "assets/mix.wav written"
