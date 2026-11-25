#!/usr/bin/env python3
"""
FitLeader Social Studio — Audio & Beat-Timing Generator (Vía C Guide + Vía B Official Swap)
Generates beat-synced voiceover tracks with per-line prosody modulation + subtle UI SFX + ambient bed,
and writes exact beat timestamps (timings.json) so the 1080x1920 renderer locks every spring/zoom to the voice.
"""

import asyncio
import json
import math
import os
import struct
import subprocess
import wave
from pathlib import Path
import edge_tts

STUDIO_DIR = Path(__file__).resolve().parent
OUT_DIR = STUDIO_DIR / "out"
ASSETS_DIR = STUDIO_DIR / "assets"

SAMPLE_RATE = 44100

# Beat-by-beat scripts with prosody tuning for Vía C guide track
IG_BEATS = [
    {
        "id": "hook",
        "text": "¿Cobras ochenta euros al mes, y sigues mandando un PDF?",
        "on_screen": "80€/MES... ¿Y UN PDF?",
        "accent": "red",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+8%",
        "pitch": "+3Hz",
        "pause_after": 0.22,
        "sfx": "thump",
    },
    {
        "id": "stake",
        "text": "Normal que a los quince días nadie lo abra.",
        "on_screen": "DÍA 15: NADIE LO ABRE",
        "accent": "red",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+4%",
        "pitch": "-2Hz",
        "pause_after": 0.28,
        "sfx": "whoosh",
    },
    {
        "id": "reveal",
        "text": "Mira el cambio cuando entran en tu propia app, con tu logo.",
        "on_screen": "TU APP · TU LOGO",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+9%",
        "pitch": "+2Hz",
        "pause_after": 0.18,
        "sfx": "reveal",
    },
    {
        "id": "video",
        "text": "Abren la sesión de hoy con su vídeo listo.",
        "on_screen": "RUTINA + VÍDEO HD",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+10%",
        "pitch": "+1Hz",
        "pause_after": 0.15,
        "sfx": "click",
    },
    {
        "id": "sets",
        "text": "Anotan cien kilos por ocho en sentadilla.",
        "on_screen": "100 KG × 8 ✓",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+10%",
        "pitch": "+2Hz",
        "pause_after": 0.15,
        "sfx": "pop_check",
    },
    {
        "id": "streak",
        "text": "Suman doce días seguidos en racha.",
        "on_screen": "🔥 12 DÍAS EN RACHA",
        "accent": "amber",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+11%",
        "pitch": "+3Hz",
        "pause_after": 0.20,
        "sfx": "chime",
    },
    {
        "id": "sync",
        "text": "Y a ti te salta al segundo en tu panel de entrenador.",
        "on_screen": "SINCRONIZADO AL SEGUNDO",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+8%",
        "pitch": "+1Hz",
        "pause_after": 0.24,
        "sfx": "whoosh",
    },
    {
        "id": "clean",
        "text": "Cero Excels rotos. Cero audios eternos.",
        "on_screen": "CERO EXCELS · CERO CAOS",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+5%",
        "pitch": "-1Hz",
        "pause_after": 0.22,
        "sfx": "click",
    },
    {
        "id": "cta",
        "text": "Comenta APP y empieza gratis hoy en FitLeader.",
        "on_screen": "COMENTA «APP» 👇",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+6%",
        "pitch": "+2Hz",
        "pause_after": 0.45,
        "sfx": "reveal",
    },
]

TT_BEATS = [
    {
        "id": "hook",
        "text": "Domingo, nueve de la noche. Abres WhatsApp.",
        "on_screen": "DOMINGO · 21:00",
        "accent": "amber",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+4%",
        "pitch": "-2Hz",
        "pause_after": 0.24,
        "sfx": "thump",
    },
    {
        "id": "msg1",
        "text": "Un audio de cuatro minutos para cambiar las sentadillas.",
        "on_screen": "1️⃣ AUDIO DE 4:12",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+9%",
        "pitch": "+1Hz",
        "pause_after": 0.18,
        "sfx": "pop_msg",
    },
    {
        "id": "msg2",
        "text": "Dos fotos de check-in mezcladas con el grupo de tu madre.",
        "on_screen": "2️⃣ FOTOS + CHAT MAMÁ",
        "accent": "red",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+10%",
        "pitch": "+2Hz",
        "pause_after": 0.20,
        "sfx": "pop_msg",
    },
    {
        "id": "msg3",
        "text": "Y el clásico: oye, ¿te llegó ya mi Bizum?",
        "on_screen": "3️⃣ «¿LLEGÓ MI BIZUM?»",
        "accent": "amber",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+7%",
        "pitch": "+4Hz",
        "pause_after": 0.32,
        "sfx": "pop_msg",
    },
    {
        "id": "pivot1",
        "text": "Tu problema no es tener treinta clientes.",
        "on_screen": "30 CLIENTES ≠ CAOS",
        "accent": "white",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+5%",
        "pitch": "-1Hz",
        "pause_after": 0.18,
        "sfx": "whoosh",
    },
    {
        "id": "pivot2",
        "text": "Es llevar todo tu negocio metido en WhatsApp.",
        "on_screen": "SÁCALO DE WHATSAPP",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+8%",
        "pitch": "+2Hz",
        "pause_after": 0.26,
        "sfx": "reveal",
    },
    {
        "id": "cta",
        "text": "Dime la verdad, ¿cuál de los tres te cae cada domingo?",
        "on_screen": "¿EL 1, EL 2 O EL 3? 👇",
        "accent": "emerald",
        "voice": "es-ES-AlvaroNeural",
        "rate": "+7%",
        "pitch": "+3Hz",
        "pause_after": 0.45,
        "sfx": "click",
    },
]


def make_sfx_samples(kind: str) -> list[float]:
    """Synthesize subtle, clean UI motion sound effects (mono float -1..1)."""
    if kind == "thump":
        n = int(SAMPLE_RATE * 0.22)
        out = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 22.0)
            freq = 115.0 * math.exp(-t * 9.0) + 42.0
            out.append(0.24 * env * math.sin(2 * math.pi * freq * t))
        return out
    if kind == "click":
        n = int(SAMPLE_RATE * 0.045)
        out = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 110.0)
            val = math.sin(2 * math.pi * 1450 * t) + 0.5 * math.sin(2 * math.pi * 2900 * t)
            out.append(0.11 * env * val)
        return out
    if kind == "pop_check":
        n = int(SAMPLE_RATE * 0.14)
        out = []
        for i in range(n):
            t = i / SAMPLE_RATE
            f = 580 + 480 * min(1.0, t / 0.06)
            env = math.exp(-t * 28.0)
            out.append(0.15 * env * math.sin(2 * math.pi * f * t))
        return out
    if kind == "pop_msg":
        n = int(SAMPLE_RATE * 0.12)
        out = []
        for i in range(n):
            t = i / SAMPLE_RATE
            f = 420 + 520 * (t / 0.12)
            env = math.sin(math.pi * min(1.0, t / 0.12)) * math.exp(-t * 16.0)
            out.append(0.16 * env * math.sin(2 * math.pi * f * t))
        return out
    if kind == "chime":
        n = int(SAMPLE_RATE * 0.32)
        out = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 11.0)
            val = math.sin(2 * math.pi * 659.25 * t) + 0.7 * math.sin(2 * math.pi * 987.77 * t)
            out.append(0.11 * env * val)
        return out
    if kind == "reveal":
        n = int(SAMPLE_RATE * 0.36)
        out = []
        for i in range(n):
            t = i / SAMPLE_RATE
            env = math.sin(math.pi * min(1.0, t / 0.36)) * math.exp(-t * 6.5)
            val = (
                math.sin(2 * math.pi * 261.63 * t)
                + 0.8 * math.sin(2 * math.pi * 329.63 * t)
                + 0.7 * math.sin(2 * math.pi * 392.00 * t)
                + 0.5 * math.sin(2 * math.pi * 523.25 * t)
            )
            out.append(0.065 * env * val)
        return out
    if kind == "whoosh":
        n = int(SAMPLE_RATE * 0.20)
        out = []
        seed = 1337
        lp = 0.0
        for i in range(n):
            t = i / SAMPLE_RATE
            seed = (1103515245 * seed + 12345) & 0x7FFFFFFF
            noise = (seed / 0x3FFFFFFF) - 1.0
            alpha = 0.08 + 0.25 * math.sin(math.pi * (i / n))
            lp = lp + alpha * (noise - lp)
            env = math.sin(math.pi * (i / n)) ** 1.6
            out.append(0.09 * env * lp)
        return out
    return []


async def synth_beat_to_wav(beat: dict, mp3_path: Path, wav_path: Path):
    comm = edge_tts.Communicate(
        beat["text"],
        voice=beat["voice"],
        rate=beat["rate"],
        pitch=beat["pitch"],
    )
    await comm.save(str(mp3_path))
    # Trim leading/trailing digital silence gently and convert to 44.1kHz mono 16-bit PCM
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(mp3_path),
            "-af",
            "silenceremove=start_periods=1:start_silence=0.03:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse,equalizer=f=180:t=q:w=1.2:g=2.5,equalizer=f=3800:t=q:w=1.4:g=-1.8",
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "1",
            str(wav_path),
        ],
        check=True,
    )


def read_wav_mono(path: Path) -> list[float]:
    with wave.open(str(path), "rb") as wf:
        n = wf.getnframes()
        raw = wf.readframes(n)
        vals = struct.unpack(f"<{n}h", raw)
        return [v / 32768.0 for v in vals]


def write_wav_stereo(path: Path, samples: list[float]):
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        buf = bytearray()
        for s in samples:
            clamped = max(-0.97, min(0.97, s))
            iv = int(clamped * 32767)
            buf.extend(struct.pack("<hh", iv, iv))
        wf.writeframes(bytes(buf))


async def build_pilot_audio(slug: str, beats: list[dict], official_audio: Path | None = None):
    tmp_dir = OUT_DIR / f"tmp_{slug}"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    lead_in = 0.14
    timeline: list[float] = [0.0] * int(lead_in * SAMPLE_RATE)
    timings = []

    for idx, beat in enumerate(beats):
        start_sec = len(timeline) / SAMPLE_RATE
        mp3_p = tmp_dir / f"b{idx:02d}.mp3"
        wav_p = tmp_dir / f"b{idx:02d}.wav"
        await synth_beat_to_wav(beat, mp3_p, wav_p)
        voice_samples = read_wav_mono(wav_p)

        # Mix subtle SFX right at beat start
        sfx_samples = make_sfx_samples(beat.get("sfx", ""))
        seg_len = max(len(voice_samples), len(sfx_samples))
        seg = [0.0] * seg_len
        for i, v in enumerate(voice_samples):
            seg[i] += v * 0.92
        for i, s in enumerate(sfx_samples):
            seg[i] += s

        timeline.extend(seg)
        speech_end_sec = len(timeline) / SAMPLE_RATE

        pause_samples = int(beat["pause_after"] * SAMPLE_RATE)
        timeline.extend([0.0] * pause_samples)
        end_sec = len(timeline) / SAMPLE_RATE

        timings.append(
            {
                "index": idx,
                "id": beat["id"],
                "text": beat["text"],
                "on_screen": beat["on_screen"],
                "accent": beat["accent"],
                "start": round(start_sec, 3),
                "speech_end": round(speech_end_sec, 3),
                "end": round(end_sec, 3),
            }
        )

    # If user provided official Vía B human voiceover, replace voice while preserving subtle SFX & scaling beat timings!
    total_dur = len(timeline) / SAMPLE_RATE
    if official_audio and official_audio.exists():
        conv_wav = tmp_dir / "official_norm.wav"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-i",
                str(official_audio),
                "-af",
                "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar",
                str(SAMPLE_RATE),
                "-ac",
                "1",
                str(conv_wav),
            ],
            check=True,
        )
        off_samples = read_wav_mono(conv_wav)
        scale = (len(off_samples) / SAMPLE_RATE) / max(0.1, total_dur)
        for b in timings:
            b["start"] = round(b["start"] * scale, 3)
            b["speech_end"] = round(b["speech_end"] * scale, 3)
            b["end"] = round(b["end"] * scale, 3)
        timeline = [v * 0.94 for v in off_samples]
        for b, orig in zip(timings, beats):
            sfx = make_sfx_samples(orig.get("sfx", ""))
            pos = int(b["start"] * SAMPLE_RATE)
            for i, s in enumerate(sfx):
                if pos + i < len(timeline):
                    timeline[pos + i] += s * 0.75
        total_dur = len(timeline) / SAMPLE_RATE

    # Add subtle warm dark-tech ambient pulse (-33dB) so transitions never sound sterile
    for i in range(len(timeline)):
        t = i / SAMPLE_RATE
        fade_in = min(1.0, t / 0.4)
        fade_out = min(1.0, (total_dur - t) / 0.6)
        pulse = 0.5 + 0.5 * math.sin(2 * math.pi * (112.0 / 60.0) * t)
        drone = (
            math.sin(2 * math.pi * 65.41 * t) * 0.55
            + math.sin(2 * math.pi * 98.00 * t) * 0.30
            + math.sin(2 * math.pi * 196.00 * t) * 0.15 * pulse
        )
        timeline[i] += 0.018 * fade_in * fade_out * drone

    wav_out = OUT_DIR / f"{slug}_audio.wav"
    json_out = OUT_DIR / f"{slug}_timings.json"
    write_wav_stereo(wav_out, timeline)

    manifest = {
        "slug": slug,
        "voice_mode": "official_via_b" if (official_audio and official_audio.exists()) else "guide_via_c",
        "duration": round(total_dur, 3),
        "beats": timings,
    }
    json_out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] {slug}: {total_dur:.2f}s across {len(timings)} beats -> {wav_out.name}")


async def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    off_ig = ASSETS_DIR / "official_voice_ig.mp3"
    off_tt = ASSETS_DIR / "official_voice_tt.mp3"
    if not off_ig.exists():
        off_ig = ASSETS_DIR / "official_voice_ig.wav"
    if not off_tt.exists():
        off_tt = ASSETS_DIR / "official_voice_tt.wav"

    await build_pilot_audio("ig_pilot_v2", IG_BEATS, off_ig if off_ig.exists() else None)
    await build_pilot_audio("tt_pilot_v2", TT_BEATS, off_tt if off_tt.exists() else None)


if __name__ == "__main__":
    asyncio.run(main())
