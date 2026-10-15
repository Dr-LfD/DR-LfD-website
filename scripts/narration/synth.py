import asyncio
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import edge_tts

HERE = Path(__file__).parent
OUT = HERE / "tts"
VOICE = "en-US-AndrewNeural"
LEAD = 0.3  # seconds of silence after each slide cut before speech starts
TAIL = 0.3  # minimum gap between speech end and the next slide cut
SPOKEN = {"DR-LfD": "D R L f D", "OOD": "O O D", "ACT": "A C T", "ALOHA": "Aloha"}


def spoken(text):
    for k, v in SPOKEN.items():
        text = text.replace(k, v)
    return text


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    return float(out.stdout)


async def synth(i, seg, rate):
    text = spoken(seg["text"])
    key = hashlib.sha1(f"{VOICE}|{rate}|{text}".encode()).hexdigest()[:8]
    path = OUT / f"{i:02d}_{key}.mp3"
    if path.exists() and path.stat().st_size > 0:
        return path
    for attempt in range(5):
        try:
            await edge_tts.Communicate(text, VOICE, rate=rate).save(str(path))
            return path
        except Exception:
            path.unlink(missing_ok=True)
            if attempt == 4:
                raise
            await asyncio.sleep(5)


async def main():
    rate = sys.argv[1] if len(sys.argv) > 1 else "+0%"
    OUT.mkdir(exist_ok=True)
    segs = json.loads((HERE / "narration.json").read_text())
    paths = [await synth(i, s, rate) for i, s in enumerate(segs)]
    bad = 0
    for i, (s, p) in enumerate(zip(segs, paths)):
        budget = s["end"] - s["start"] - LEAD - TAIL
        d = duration(p)
        flag = "OVER" if d > budget else ""
        bad += bool(flag)
        print(f"{i:02d} {s['start']:6.1f}-{s['end']:6.1f} speech {d:5.2f}s / budget {budget:5.2f}s {flag}")
    print(f"{bad} segment(s) over budget at rate {rate}")


asyncio.run(main())
