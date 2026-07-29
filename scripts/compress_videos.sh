#!/usr/bin/env bash
# Compress all demo videos for web.
# Output: public_optim/ (mirrors public/ paths)
# Strategy per clip group:
#   - 720p max, H.264 CRF 28, faststart, no audio
#   - For clips with a known playback-rate multiplier: bake speed in (setpts=PTS/N, atempo removed since -an)
#   - sup-vid.mp4: click-to-play hero, compress but keep full duration, CRF 30

set -euo pipefail

SRC=public
DST=public_optim

encode() {
  local in="$1" out="$2" speed="${3:-1}" extra_vf="${4:-}" fps="${5:-}"
  mkdir -p "$(dirname "$out")"
  [[ -f "$out" ]] && { echo "  SKIP (exists) $out"; return; }
  local vf="scale=-2:'min(720,ih)'"
  [[ "$speed" != "1" ]] && vf="${vf},setpts=PTS/${speed}"
  [[ -n "$extra_vf" ]] && vf="${vf},${extra_vf}"
  # setpts only rewrites timestamps, so a sped-up clip reports speed*src_fps.
  # Pinning an output fps makes the frame drop deterministic across ffmpeg versions.
  local fps_opt=()
  [[ -n "$fps" ]] && fps_opt=(-r "$fps")
  ffmpeg -y -i "$in" \
    -vf "$vf" \
    "${fps_opt[@]}" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf 28 -preset slow -movflags +faststart \
    -an \
    "$out" \
    2>&1 | tail -1
  local isz osiz
  isz=$(du -h "$in" | cut -f1)
  osiz=$(du -h "$out" | cut -f1)
  echo "  $in ($isz) -> $out ($osiz)"
}

poster() {
  local in="$1" out="$2" ts="${3:-00:00:01}"
  mkdir -p "$(dirname "$out")"
  [[ -f "$out" ]] && { echo "  SKIP poster $out"; return; }
  ffmpeg -y -ss "$ts" -i "$in" -frames:v 1 \
    -vf "scale=-2:'min(720,ih)'" -q:v 4 \
    "$out" 2>/dev/null
  echo "  poster -> $out ($(du -h "$out" | cut -f1))"
}

echo "====== aloha2-vid (unreach: 720p, no speed bake) ======"
for i in 1 2 3; do
  f="$SRC/aloha2-vid/unreach${i}.mp4"
  encode "$f" "$DST/aloha2-vid/unreach${i}.mp4" 1
  poster "$f" "$DST/posters/aloha2-vid/unreach${i}.jpg"
done

echo "====== aloha2-vid (unsafe: 640x480, bake 4x) ======"
for i in 1 2 3 4; do
  f="$SRC/aloha2-vid/unsafe${i}.mp4"
  encode "$f" "$DST/aloha2-vid/unsafe${i}.mp4" 4
  poster "$f" "$DST/posters/aloha2-vid/unsafe${i}.jpg"
done

echo "====== aloha2-vid (3skills: 640x480, bake 6x) ======"
for i in 1 2 3 4 5 6; do
  f="$SRC/aloha2-vid/3skills-web${i}.mp4"
  encode "$f" "$DST/aloha2-vid/3skills-web${i}.mp4" 6
  poster "$f" "$DST/posters/aloha2-vid/3skills-web${i}.jpg"
done

echo "====== franka_screw (720p, bake 4x) ======"
for i in 1 2 3 4 5; do
  f="$SRC/franka_screw/screw${i}.mp4"
  encode "$f" "$DST/franka_screw/screw${i}.mp4" 4
  poster "$f" "$DST/posters/franka_screw/screw${i}.jpg"
done

echo "====== screw_leaky (640x480, bake 4x) ======"
for i in 1 2 3 4; do
  f="$SRC/screw_leaky/screw_${i}.mp4"
  encode "$f" "$DST/screw_leaky/screw_${i}.mp4" 4
  poster "$f" "$DST/posters/screw_leaky/screw_${i}.jpg"
done

echo "====== tape_leaky (640x480, bake 4x) ======"
for i in 1 2 3 4; do
  f="$SRC/tape_leaky/tape${i}.mp4"
  encode "$f" "$DST/tape_leaky/tape${i}.mp4" 4
  poster "$f" "$DST/posters/tape_leaky/tape${i}.jpg"
done

echo "====== ppt-pics (720p/1080p demos) ======"
# 3tape and 3skills: no playback-rate attr in yaml, use 1x (already natural speed)
encode "$SRC/ppt-pics/3tape_web.mp4"      "$DST/ppt-pics/3tape_web.mp4"      1
encode "$SRC/ppt-pics/3skills_web.mp4"    "$DST/ppt-pics/3skills_web.mp4"    1
poster "$SRC/ppt-pics/3tape_web.mp4"   "$DST/posters/ppt-pics/3tape_web.jpg"
poster "$SRC/ppt-pics/3skills_web.mp4" "$DST/posters/ppt-pics/3skills_web.jpg"

# throw_screw: long clip, compress (1x, not in a slider so no rate bake needed)
encode "$SRC/ppt-pics/throw_screw_web.mp4" "$DST/ppt-pics/throw_screw_web.mp4" 1
poster "$SRC/ppt-pics/throw_screw_web.mp4" "$DST/posters/ppt-pics/throw_screw_web.jpg"

# sup-vid: click-to-load hero, CRF 30 (slightly more compression for the long reel)
mkdir -p "$DST/ppt-pics"
[[ -f "$DST/ppt-pics/sup-vid.mp4" ]] || \
  ffmpeg -y -i "$SRC/ppt-pics/sup-vid.mp4" \
    -vf "scale=-2:'min(720,ih)'" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf 30 -preset slow -movflags +faststart \
    -an \
    "$DST/ppt-pics/sup-vid.mp4" 2>&1 | tail -1
echo "  sup-vid: $(du -h "$SRC/ppt-pics/sup-vid.mp4"|cut -f1) -> $(du -h "$DST/ppt-pics/sup-vid.mp4" 2>/dev/null|cut -f1 || echo pending)"
poster "$SRC/ppt-pics/sup-vid.mp4" "$DST/posters/ppt-pics/sup-vid.jpg"

echo "====== reactive (contact-monitor recovery; .avi -> .mp4, renamed by task) ======"
# The two .avi sources are mpeg4-in-avi and unplayable in every browser.
# Outputs are renamed to the task they show; the reactive/ folder carries the rest.
# Sources were moved out of public/ after encoding; masters live in ~/yzchen_ws/vid/reactive_raw/.
encode "$SRC/reactive/cup_2try.avi"    "$DST/reactive/handoff.mp4"     2 "" 30
encode "$SRC/reactive/screwdriver.avi" "$DST/reactive/screwdriver.mp4" 2 "" 30
encode "$SRC/reactive/sponge.mp4"      "$DST/reactive/cupwipe.mp4"     1
encode "$SRC/reactive/cup.mp4"         "$DST/reactive/longhorizon.mp4" 4 "" 30
# Posters come from the encoded output, so timestamps are in sped-up time.
# Hand-picked per clip: the default 1s lands before the disturbance and shows an empty table.
poster "$DST/reactive/handoff.mp4"     "$DST/posters/reactive/handoff.jpg"     0.6
poster "$DST/reactive/screwdriver.mp4" "$DST/posters/reactive/screwdriver.jpg" 1.2
poster "$DST/reactive/cupwipe.mp4"     "$DST/posters/reactive/cupwipe.jpg"     4.5
poster "$DST/reactive/longhorizon.mp4" "$DST/posters/reactive/longhorizon.jpg" 2.0

echo "====== libero_dmg: skip (already small) ======"
mkdir -p "$DST/libero_dmg" "$DST/posters/libero_dmg"
for f in "$SRC/libero_dmg/"*.mp4; do
  cp "$f" "$DST/libero_dmg/$(basename "$f")"
  poster "$f" "$DST/posters/libero_dmg/$(basename "${f%.mp4}").jpg"
done

echo ""
echo "====== BEFORE vs AFTER ======"
echo "public (original):      $(du -sh "$SRC" | cut -f1)"
echo "public_optim (compressed): $(du -sh "$DST" | cut -f1)"
echo ""
echo "Per-file comparison:"
find "$DST" -name '*.mp4' | sort | while read out; do
  rel="${out#$DST/}"
  orig="$SRC/$rel"
  if [[ -f "$orig" ]]; then
    os=$(du -h "$orig"|cut -f1); ns=$(du -h "$out"|cut -f1)
    printf "  %-45s %6s -> %6s\n" "$rel" "$os" "$ns"
  fi
done
echo ""
echo "Done. Review the output, then run: rsync -a --delete public_optim/ public/"
