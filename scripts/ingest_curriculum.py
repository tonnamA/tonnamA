#!/usr/bin/env python3
"""Compile the cloned rohitg00/ai-engineering-from-scratch repository into static JSON assets."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path
from typing import Any

WEB_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = WEB_ROOT / ".upstream-repo"
PUBLIC_DIR = WEB_ROOT / "public"
DATA_DIR = PUBLIC_DIR / "data"
LESSONS_OUT_DIR = DATA_DIR / "lessons"
ASSETS_OUT_DIR = PUBLIC_DIR / "upstream-assets"
FIGURES_OUT_DIR = PUBLIC_DIR / "upstream-figures"

GITHUB_REPO_URL = "https://github.com/rohitg00/ai-engineering-from-scratch"

PHASE_DIR_RE = re.compile(r"^([0-9]{2})-([a-z0-9][a-z0-9-]*)$")
LESSON_DIR_RE = re.compile(r"^([0-9]{2})-([a-z0-9][a-z0-9-]*)$")
H1_RE = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)
HEADING_RE = re.compile(r"^(#{2,3})\s+(.+?)\s*$", re.MULTILINE)
MOTTO_RE = re.compile(r"^>\s*(.+?)\s*$", re.MULTILINE)

TEXT_EXTS = {
    ".py", ".ts", ".tsx", ".js", ".mjs", ".rs", ".jl", ".go", ".sh", ".bash",
    ".c", ".cpp", ".h", ".hpp", ".cs", ".java", ".s", ".wat", ".sql",
    ".json", ".yaml", ".yml", ".toml", ".md", ".txt", ".env", ".gitignore",
    ".css", ".html", ".svg",
}
TEXT_NAMES = {"Dockerfile", "Containerfile", "Makefile", "README", "LICENSE"}
SKIP_DIRS = {"__pycache__", "node_modules", ".git", "target", "dist", "build", ".venv"}

# Exact order from upstream site/build.js
FIGURE_PROVIDER_ORDER = [
    "figures.js", "figures-math.js", "figures-ml.js", "figures-dl.js",
    "figures-vision-speech.js", "figures-transformers.js", "figures-genai-rl.js",
    "figures-llms-systems.js", "figures-agents-alignment.js", "figures-math2.js",
    "figures-nlp2.js", "figures-llms2.js", "figures-infra.js", "figures-frontier.js",
    "figures-llmeng.js", "figures-multimodal.js", "figures-agents2.js",
    "figures-alignment2.js", "figures-foundations2.js", "figures-capstone-a.js",
    "figures-capstone-b.js", "figures-agents3.js", "figures-nlp3.js", "figures-cv2.js",
    "figures-llms3.js", "figures-autonomous2.js", "figures-swarms2.js",
    "figures-infra2.js", "figures-systems3.js", "figures-capstone-c.js",
    "figures-capstone-d.js", "figures-cv3.js", "figures-speech2.js",
    "figures-multimodal2.js", "figures-tools2.js", "figures-agents4.js",
    "figures-swarms3.js", "figures-genai3.js", "figures-misc2.js", "figures-history.js",
    "figures-capstone-e.js", "figures-capstone-f.js", "figures-capstone-g.js",
    "figures-capstone-h.js", "figures-capstone-i.js", "figures-alignment3.js",
    "figures-alignment4.js", "figures-workbench.js", "figures-tools3.js",
    "figures-mcp.js", "figures-setup.js", "figures-foundations3.js",
    "figures-visaudio4.js", "figures-nlp5.js", "figures-llmstack5.js",
    "figures-autoswarm5.js", "figures-infra4.js", "figures-claude-certifications.js",
    "figures-mcpa-certifications.js", "figures-agent-skills.js", "figures-python.js",
    "figures-mlprod.js", "figures-iso.js", "figures-demo.js",
    "figures-re-32.js", "figures-re-33.js", "figures-re-34.js", "figures-re-35.js",
    "figures-re-36.js", "figures-re-37.js", "figures-re-38.js", "figures-re-39.js",
    "figures-re-40.js", "figures-re-41.js", "figures-re-42.js", "figures-re-43.js",
    "figures-re-44.js", "figures-re-45.js",
]

VOLUMES = [
    {
        "num": 1,
        "id": "vol-1",
        "title": "Foundations",
        "titleTh": "เล่ม 1: รากฐาน (Foundations)",
        "subtitle": "Math, Tooling, and Classical Machine Learning",
        "subtitleTh": "เครื่องมือ คณิตศาสตร์ และ Machine Learning พื้นฐาน",
        "phases": [0, 1, 2],
        "epub": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol1-foundations.epub",
        "pdf": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol1-foundations.pdf",
    },
    {
        "num": 2,
        "id": "vol-2",
        "title": "Deep Learning",
        "titleTh": "เล่ม 2: ดีปเลิร์นนิง (Deep Learning)",
        "subtitle": "Networks, Vision, and Speech",
        "subtitleTh": "โครงข่ายประสาท คอมพิวเตอร์วิทัศน์ และเสียงพูด",
        "phases": [3, 4, 6],
        "epub": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol2-deep-learning.epub",
        "pdf": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol2-deep-learning.pdf",
    },
    {
        "num": 3,
        "id": "vol-3",
        "title": "Language",
        "titleTh": "เล่ม 3: ภาษา (Language)",
        "subtitle": "NLP Foundations and the Transformer",
        "subtitleTh": "รากฐาน NLP และสถาปัตยกรรม Transformer ด้วยมือเปล่า",
        "phases": [5, 7],
        "epub": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol3-language.epub",
        "pdf": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol3-language.pdf",
    },
    {
        "num": 4,
        "id": "vol-4",
        "title": "Large Language Models",
        "titleTh": "เล่ม 4: โมเดลภาษาขนาดใหญ่ (LLMs)",
        "subtitle": "Generation, Reinforcement, Pretraining, and Engineering",
        "subtitleTh": "โมเดลกำเนิด RLHF การฝึก Pretraining และวิศวกรรม LLM",
        "phases": [8, 9, 10, 11],
        "epub": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol4-llms.epub",
        "pdf": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol4-llms.pdf",
    },
    {
        "num": 5,
        "id": "vol-5",
        "title": "Agents",
        "titleTh": "เล่ม 5: เอเจนต์ (Agents)",
        "subtitle": "Multimodality, Protocols, Autonomy, and Swarms",
        "subtitleTh": "AI หลายโมดัลลิตี MCP โพรโทคอล ระบบอัตโนมัติ และฝูงเอเจนต์",
        "phases": [12, 13, 14, 15, 16],
        "epub": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol5-agents.epub",
        "pdf": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol5-agents.pdf",
    },
    {
        "num": 6,
        "id": "vol-6",
        "title": "Production",
        "titleTh": "เล่ม 6: ระบบจริง (Production)",
        "subtitle": "Infrastructure, Safety, and Capstones",
        "subtitleTh": "โครงสร้างพื้นฐาน ความปลอดภัย การจัดแนว และโครงงานสรุป",
        "phases": [17, 18, 19],
        "epub": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol6-production.epub",
        "pdf": f"{GITHUB_REPO_URL}/releases/latest/download/aiefs-vol6-production.pdf",
    },
]

PHASE_DEPENDENCIES: dict[int, list[int]] = {
    0: [], 1: [0], 2: [1], 3: [2],
    4: [3], 5: [3], 6: [3], 9: [3],
    7: [5], 8: [7], 10: [7],
    11: [10], 12: [10],
    13: [11], 14: [13],
    15: [14], 16: [15],
    17: [14], 18: [15],
    19: [16, 17, 18],
}

PHASE_TITLES_EN: dict[int, tuple[str, str]] = {
    0: ("Setup & Tooling", "Get your environment ready for everything that follows."),
    1: ("Math Foundations", "The intuition behind every AI algorithm, through code."),
    2: ("ML Fundamentals", "Classical ML — still the backbone of most production AI."),
    3: ("Deep Learning Core", "Neural networks from first principles. No frameworks until you build one."),
    4: ("Computer Vision", "From pixels to understanding — image, video, 3D, VLMs, and world models."),
    5: ("NLP: Foundations to Advanced", "Language is the interface to intelligence."),
    6: ("Speech & Audio", "Hear, understand, speak."),
    7: ("Transformers Deep Dive", "The architecture that changed everything."),
    8: ("Generative AI", "Create images, video, audio, 3D, and more."),
    9: ("Reinforcement Learning", "The foundation of RLHF and game-playing AI."),
    10: ("LLMs from Scratch", "Build, train, and understand large language models."),
    11: ("LLM Engineering", "Put LLMs to work in production."),
    12: ("Multimodal AI", "See, hear, read, and reason across modalities — from ViT patches to computer-use agents."),
    13: ("Tools & Protocols", "The interfaces between AI and the real world."),
    14: ("Agent Engineering", "Build agents from first principles, use coding agents reliably, and shape the work before implementation."),
    15: ("Autonomous Systems", "Long-horizon agents, self-improvement, and the 2026 safety stack."),
    16: ("Multi-Agent & Swarms", "Coordination, emergence, and collective intelligence."),
    17: ("Infrastructure & Production", "Ship AI to the real world."),
    18: ("Ethics, Safety & Alignment", "Build AI that helps humanity. Not optional."),
    19: ("Capstone Projects", "17 end-to-end products + 9 deep-build tracks. 20-40 hours per project; 4-12 lessons per track."),
}

PHASE_TITLES_TH: dict[int, tuple[str, str]] = {
    0: ("การตั้งค่าและเครื่องมือ", "เตรียมสภาพแวดล้อมให้พร้อมสำหรับทุกบทเรียนต่อจากนี้"),
    1: ("พื้นฐานคณิตศาสตร์", "เข้าใจแนวคิดเบื้องหลังทุกอัลกอริทึม AI ผ่านโค้ด"),
    2: ("พื้นฐาน ML", "ML แบบดั้งเดิมยังเป็นแกนหลักของ AI ส่วนใหญ่ที่ใช้งานจริง"),
    3: ("แกนหลักดีปเลิร์นนิง", "โครงข่ายประสาทจากหลักการพื้นฐาน ยังไม่ใช้เฟรมเวิร์กจนกว่าจะสร้างเอง"),
    4: ("คอมพิวเตอร์วิทัศน์", "จากพิกเซลสู่ความเข้าใจ: ภาพ วิดีโอ 3D โมเดล VLM และโมเดลโลก"),
    5: ("NLP จากพื้นฐานสู่ขั้นสูง", "ภาษาคืออินเทอร์เฟซสู่อัจฉริยะ"),
    6: ("เสียงพูดและออดิโอ", "ฟัง เข้าใจ และพูด"),
    7: ("เจาะลึก Transformers", "สถาปัตยกรรมที่เปลี่ยนทุกอย่าง"),
    8: ("AI กำเนิด (Generative AI)", "สร้างภาพ วิดีโอ เสียง 3D และอื่น ๆ"),
    9: ("การเรียนรู้แบบเสริมกำลัง (RL)", "รากฐานของ RLHF และ AI เล่นเกม"),
    10: ("LLM จากศูนย์", "สร้าง ฝึก และเข้าใจโมเดลภาษาขนาดใหญ่"),
    11: ("วิศวกรรม LLM", "นำ LLM ไปใช้งานจริงในโปรดักชัน"),
    12: ("AI หลายโมดัลลิตี", "ดู ฟัง อ่าน และให้เหตุผลข้ามรูปแบบ ตั้งแต่แพตช์ ViT ถึงเอเจนต์ใช้คอมพิวเตอร์"),
    13: ("เครื่องมือและโพรโทคอล", "อินเทอร์เฟซระหว่าง AI กับโลกจริง"),
    14: ("วิศวกรรมเอเจนต์", "สร้างเอเจนต์จากหลักการพื้นฐาน ใช้เอเจนต์เขียนโค้ดอย่างเชื่อถือได้ และกำหนดงานก่อนลงมือเขียน"),
    15: ("ระบบอัตโนมัติ", "เอเจนต์ระยะยาว การปรับปรุงตนเอง และชั้นความปลอดภัย"),
    16: ("หลายเอเจนต์และฝูง", "การประสานงาน พฤติกรรมอุบัติการณ์ และปัญญาร่วม"),
    17: ("โครงสร้างพื้นฐานและงานจริง", "นำ AI ออกสู่โลกจริงอย่างเสถียร"),
    18: ("จริยธรรม ความปลอดภัย และการจัดแนว", "สร้าง AI ที่ช่วยมนุษยชาติ เรื่องนี้ไม่ใช่ทางเลือก"),
    19: ("โครงงานสรุป (Capstones)", "17 ผลิตภัณฑ์ครบวงจร + 9 เส้นทางสร้างเชิงลึก (Deep-Build Tracks)"),
}

TRACK_NAMES: dict[int, str] = {}
for n in range(20, 30): TRACK_NAMES[n] = "A. Agent Harness"
for n in range(30, 42): TRACK_NAMES[n] = "B. NLP & LLM"
for n in range(42, 50): TRACK_NAMES[n] = "C. Train End-to-End"
for n in range(50, 58): TRACK_NAMES[n] = "D. Auto Research"
for n in range(58, 64): TRACK_NAMES[n] = "E. Multimodal VLM"
for n in range(64, 70): TRACK_NAMES[n] = "F. Advanced RAG"
for n in range(70, 76): TRACK_NAMES[n] = "G. Eval Framework"
for n in range(76, 82): TRACK_NAMES[n] = "H. Distributed Train"
for n in range(82, 88): TRACK_NAMES[n] = "I. Safety Harness"


def slugify_heading(text: str) -> str:
    clean = re.sub(r"`([^`]+)`", r"\1", text)
    clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", clean)
    clean = re.sub(r"[^a-zA-Z0-9\u0E00-\u0E7F\s-]", "", clean).strip().lower()
    return re.sub(r"\s+", "-", clean)


def strip_num_prefix(dirname: str) -> str:
    return re.sub(r"^[0-9]{2}-", "", dirname)


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    raw_fm = text[3:end].strip()
    body = text[end + 4:].lstrip("\r\n")
    meta: dict[str, Any] = {}
    for line in raw_fm.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        k = k.strip()
        v = v.strip()
        if v.startswith("[") and v.endswith("]"):
            items = [x.strip().strip("'\"") for x in v[1:-1].split(",") if x.strip()]
            meta[k] = items
        else:
            meta[k] = v.strip("'\"")
    return meta, body


def detect_code_language(path: Path) -> str:
    ext = path.suffix.lower()
    mapping = {
        ".py": "python", ".ts": "typescript", ".tsx": "tsx", ".js": "javascript",
        ".mjs": "javascript", ".rs": "rust", ".jl": "julia", ".go": "go",
        ".sh": "bash", ".bash": "bash", ".c": "c", ".cpp": "cpp", ".h": "c",
        ".cs": "csharp", ".java": "java", ".s": "x86asm", ".wat": "lisp",
        ".sql": "sql", ".json": "json", ".yaml": "yaml", ".yml": "yaml",
        ".toml": "ini", ".md": "markdown", ".css": "css", ".html": "xml",
        ".svg": "xml",
    }
    if path.name in ("Dockerfile", "Containerfile"):
        return "dockerfile"
    return mapping.get(ext, "plaintext")


def safe_read_text(path: Path, max_bytes: int = 120_000) -> tuple[str, bool]:
    raw = path.read_bytes()
    truncated = len(raw) > max_bytes
    if truncated:
        raw = raw[:max_bytes]
    return raw.decode("utf-8", errors="replace"), truncated


def is_text_code_file(path: Path) -> bool:
    if any(part in SKIP_DIRS for part in path.parts):
        return False
    if path.suffix.lower() in TEXT_EXTS or path.name in TEXT_NAMES:
        return True
    return False


CANONICAL_CODE_LANG_MAP = {
    "python": "Python",
    "typescript": "TypeScript",
    "tsx": "TypeScript",
    "javascript": "JavaScript",
    "rust": "Rust",
    "julia": "Julia",
    "go": "Go",
    "bash": "Shell",
    "dockerfile": "Docker",
    "c": "C",
    "cpp": "C++",
    "java": "Java",
    "sql": "SQL",
}


def normalize_languages(raw_text: str, code_files: list[dict[str, Any]] | None = None) -> list[str]:
    found: list[str] = []

    def add(lang: str) -> None:
        if lang not in found:
            found.append(lang)

    if raw_text and raw_text not in ("—", "-", "None", "none", "N/A"):
        patterns: list[tuple[str, str, int]] = [
            ("Python", r"\bpython\b", re.IGNORECASE),
            ("TypeScript", r"\b(?:typescript|tsx)\b", re.IGNORECASE),
            ("JavaScript", r"\b(?:javascript|jsx)\b", re.IGNORECASE),
            ("Rust", r"\brust\b", re.IGNORECASE),
            ("Julia", r"\bjulia\b", re.IGNORECASE),
            ("Go", r"(?:^|[\s,/])Go(?=$|[\s,/])|\bgolang\b", 0),
            ("Shell", r"\b(?:shell|bash|zsh)\b", re.IGNORECASE),
            ("Docker", r"\b(?:docker|dockerfile)\b", re.IGNORECASE),
            ("C++", r"(?:^|[\s,/])(?:c\+\+|cpp)(?=$|[\s,/])", re.IGNORECASE),
            ("C", r"(?:^|[\s,/])C(?=$|[\s,/])", 0),
            ("Java", r"\bjava\b", re.IGNORECASE),
            ("SQL", r"\bsql\b", re.IGNORECASE),
            ("WASM", r"\b(?:wasm|webassembly)\b", re.IGNORECASE),
        ]
        for label, pat, flags in patterns:
            if re.search(pat, raw_text, flags):
                add(label)

    if code_files:
        for cf in code_files:
            canon = CANONICAL_CODE_LANG_MAP.get(cf.get("language", ""))
            if canon:
                add(canon)
            elif cf.get("name", "").lower().endswith((".wat", ".wasm")):
                add("WASM")

    return found


def parse_lesson_meta_from_md(md: str, fallback_title: str) -> dict[str, Any]:
    h1_m = H1_RE.search(md)
    title = h1_m.group(1).strip() if h1_m else fallback_title
    motto_m = MOTTO_RE.search(md)
    motto = motto_m.group(1).strip() if motto_m else ""

    type_m = re.search(r"\*\*Type:\*\*\s*([^\n]+)", md)
    lesson_type = type_m.group(1).strip() if type_m else "Build"
    if "learn" in lesson_type.lower() and "build" not in lesson_type.lower():
        lesson_type = "Learn"
    elif "build" in lesson_type.lower():
        lesson_type = "Build"
    else:
        lesson_type = "Build" if "build" in lesson_type.lower() else "Learn"

    lang_m = re.search(r"\*\*Languages?:\*\*\s*([^\n]+)", md)
    raw_langs = lang_m.group(1).strip() if lang_m else ""
    languages = normalize_languages(raw_langs)

    prereq_m = re.search(r"\*\*Prerequisites?:\*\*\s*([^\n]+)", md)
    prerequisites = prereq_m.group(1).strip() if prereq_m else ""

    time_m = re.search(r"\*\*Time:\*\*\s*([^\n]+)", md)
    time_str = time_m.group(1).strip() if time_m else "~45 minutes"
    mins_m = re.search(r"(\d+)", time_str)
    time_minutes = int(mins_m.group(1)) if mins_m else 45

    headings = []
    seen_slugs: dict[str, int] = {}
    for hm in HEADING_RE.finditer(md):
        level = len(hm.group(1))
        text = hm.group(2).strip()
        base_slug = slugify_heading(text) or "section"
        cnt = seen_slugs.get(base_slug, 0)
        seen_slugs[base_slug] = cnt + 1
        slug = base_slug if cnt == 0 else f"{base_slug}-{cnt}"
        headings.append({"level": level, "text": text, "id": slug})

    return {
        "title": title,
        "motto": motto,
        "type": lesson_type,
        "rawLanguages": raw_langs,
        "languages": languages,
        "prerequisites": prerequisites,
        "timeStr": time_str,
        "timeMinutes": time_minutes,
        "headings": headings,
    }


def normalize_quiz(quiz_path: Path) -> list[dict[str, Any]]:
    if not quiz_path.exists():
        return []
    try:
        raw = json.loads(quiz_path.read_text(encoding="utf-8"))
    except Exception:
        return []
    items = raw.get("questions", []) if isinstance(raw, dict) else (raw if isinstance(raw, list) else [])
    normalized = []
    for idx, q in enumerate(items):
        if not isinstance(q, dict):
            continue
        question_text = q.get("question") or q.get("q") or ""
        options = q.get("options") or q.get("choices") or []
        correct = q.get("correct") if "correct" in q else q.get("answer", 0)
        if not isinstance(correct, int):
            try:
                correct = int(correct)
            except Exception:
                correct = 0
        stage = str(q.get("stage", "check")).lower()
        if stage not in ("pre", "check", "post"):
            stage = "check"
        normalized.append({
            "id": str(q.get("id") or f"q-{idx+1}"),
            "stage": stage,
            "question": question_text,
            "options": [str(o) for o in options],
            "correctIndex": correct,
            "explanation": str(q.get("explanation") or ""),
        })
    return normalized


def collect_outputs(outputs_dir: Path, phase_num: int, lesson_num: int, phase_dir: str, lesson_dir: str) -> list[dict[str, Any]]:
    if not outputs_dir.exists():
        return []
    artifacts: list[dict[str, Any]] = []
    for p in sorted(outputs_dir.rglob("*")):
        if not p.is_file() or p.name.startswith("."):
            continue
        rel = p.relative_to(outputs_dir).as_posix()
        text, truncated = safe_read_text(p)
        fm, body = parse_frontmatter(text)
        name = fm.get("name") or p.stem
        lower_rel = rel.lower()
        if "prompt" in lower_rel:
            art_type = "prompt"
        elif "agent" in lower_rel and "skill" not in lower_rel:
            art_type = "agent"
        elif "mcp" in lower_rel:
            art_type = "mcp"
        else:
            art_type = "skill"
        tags = fm.get("tags", [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]
        artifacts.append({
            "id": f"{phase_dir}/{lesson_dir}/{rel}",
            "type": art_type,
            "name": str(name),
            "description": str(fm.get("description") or ""),
            "version": str(fm.get("version") or "1.0.0"),
            "tags": tags,
            "filename": rel,
            "phaseNum": phase_num,
            "lessonNum": lesson_num,
            "phaseDir": phase_dir,
            "lessonDir": lesson_dir,
            "frontmatter": fm,
            "body": body,
            "raw": text,
            "truncated": truncated,
        })
    return artifacts


def copy_assets_and_figures() -> dict[str, str]:
    if ASSETS_OUT_DIR.exists():
        shutil.rmtree(ASSETS_OUT_DIR)
    ASSETS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    for src_dir, sub in [(REPO_ROOT / "assets" / "readme", "readme"), (REPO_ROOT / "site" / "assets" / "figures", "figures")]:
        if src_dir.exists():
            dst = ASSETS_OUT_DIR / sub
            dst.mkdir(parents=True, exist_ok=True)
            for item in src_dir.iterdir():
                if item.is_file():
                    shutil.copy2(item, dst / item.name)

    if FIGURES_OUT_DIR.exists():
        shutil.rmtree(FIGURES_OUT_DIR)
    FIGURES_OUT_DIR.mkdir(parents=True, exist_ok=True)
    lf_src = REPO_ROOT / "site" / "lesson-figures.js"
    if lf_src.exists():
        shutil.copy2(lf_src, FIGURES_OUT_DIR / "lesson-figures.js")

    provider_map: dict[str, list[str]] = {}
    reg_re = re.compile(r"['\"]([a-zA-Z0-9_.:-]+)['\"]\s*:\s*function")
    # Also match LF.register({ 'id': fnName or arrow
    key_re = re.compile(r"(?:^|[\s,{])['\"]([a-zA-Z0-9][a-zA-Z0-9_-]{2,})['\"]\s*:")

    for fname in FIGURE_PROVIDER_ORDER:
        src = REPO_ROOT / "site" / fname
        if not src.exists():
            continue
        shutil.copy2(src, FIGURES_OUT_DIR / fname)
        content = src.read_text(encoding="utf-8", errors="replace")
        url_path = f"/upstream-figures/{fname}"
        # Find keys inside LF.register({ ... }) or anywhere top-level in provider
        for m in re.finditer(r"LF\.register\s*\(\s*\{", content):
            tail = content[m.end():]
            for km in re.finditer(r"(?:^|\n)\s*['\"]([a-zA-Z0-9][a-zA-Z0-9_.-]+)['\"]\s*:", tail):
                fig_id = km.group(1)
                provider_map.setdefault(fig_id, [])
                if url_path not in provider_map[fig_id]:
                    provider_map[fig_id].append(url_path)
        for m in reg_re.finditer(content):
            fig_id = m.group(1)
            provider_map.setdefault(fig_id, [])
            if url_path not in provider_map[fig_id]:
                provider_map[fig_id].append(url_path)

    return {
        "providers": provider_map,
        "order": [f"/upstream-figures/{f}" for f in FIGURE_PROVIDER_ORDER if (FIGURES_OUT_DIR / f).exists()],
    }


def ingest_phases_and_lessons() -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    if LESSONS_OUT_DIR.exists():
        shutil.rmtree(LESSONS_OUT_DIR)
    LESSONS_OUT_DIR.mkdir(parents=True, exist_ok=True)

    phases_dir = REPO_ROOT / "phases"
    phase_dirs = sorted([p for p in phases_dir.iterdir() if p.is_dir() and PHASE_DIR_RE.match(p.name)])

    phases_meta: list[dict[str, Any]] = []
    flat_lessons: list[dict[str, Any]] = []
    all_skills: list[dict[str, Any]] = []

    for p_dir in phase_dirs:
        pm = PHASE_DIR_RE.match(p_dir.name)
        assert pm
        phase_num = int(pm.group(1))
        phase_slug = pm.group(2)
        title_en, tagline_en = PHASE_TITLES_EN.get(phase_num, (phase_slug.replace("-", " ").title(), ""))
        title_th, tagline_th = PHASE_TITLES_TH.get(phase_num, (title_en, tagline_en))

        vol_num = next((v["num"] for v in VOLUMES if phase_num in v["phases"]), 1)
        lesson_dirs = sorted([l for l in p_dir.iterdir() if l.is_dir() and LESSON_DIR_RE.match(l.name)])

        phase_lessons_stubs: list[dict[str, Any]] = []
        total_mins = 0

        for l_dir in lesson_dirs:
            lm = LESSON_DIR_RE.match(l_dir.name)
            assert lm
            lesson_num = int(lm.group(1))
            lesson_slug = lm.group(2)

            doc_path = l_dir / "docs" / "en.md"
            md = doc_path.read_text(encoding="utf-8", errors="replace") if doc_path.exists() else f"# {lesson_slug.replace('-', ' ').title()}\n"
            parsed = parse_lesson_meta_from_md(md, lesson_slug.replace("-", " ").title())

            mission_path = l_dir / "mission.md"
            mission_md = mission_path.read_text(encoding="utf-8", errors="replace") if mission_path.exists() else None

            # Code files
            code_files: list[dict[str, Any]] = []
            code_dir = l_dir / "code"
            if code_dir.exists():
                for cf in sorted(code_dir.rglob("*")):
                    if cf.is_file() and is_text_code_file(cf):
                        rel_cf = cf.relative_to(code_dir).as_posix()
                        c_text, c_trunc = safe_read_text(cf)
                        code_files.append({
                            "name": rel_cf,
                            "language": detect_code_language(cf),
                            "content": c_text,
                            "truncated": c_trunc,
                            "lines": len(c_text.splitlines()),
                        })

            # Quiz
            quiz = normalize_quiz(l_dir / "quiz.json")

            # Outputs
            outputs = collect_outputs(l_dir / "outputs", phase_num, lesson_num, p_dir.name, l_dir.name)
            all_skills.extend(outputs)

            track_name = TRACK_NAMES.get(lesson_num) if phase_num == 19 else None
            total_mins += parsed["timeMinutes"]
            lesson_languages = normalize_languages(parsed["rawLanguages"], code_files)

            stub = {
                "num": lesson_num,
                "dirName": l_dir.name,
                "slug": lesson_slug,
                "phaseNum": phase_num,
                "phaseDir": p_dir.name,
                "phaseSlug": phase_slug,
                "phaseTitle": title_en,
                "phaseTitleTh": title_th,
                "path": f"phases/{p_dir.name}/{l_dir.name}",
                "title": parsed["title"],
                "motto": parsed["motto"],
                "type": parsed["type"],
                "languages": lesson_languages,
                "timeMinutes": parsed["timeMinutes"],
                "hasQuiz": len(quiz) > 0,
                "quizCount": len(quiz),
                "codeFileCount": len(code_files),
                "outputCount": len(outputs),
                "hasMission": mission_md is not None,
                "track": track_name,
            }
            phase_lessons_stubs.append(stub)
            flat_lessons.append({
                "stub": stub,
                "detail": {
                    **stub,
                    "prerequisites": parsed["prerequisites"],
                    "timeStr": parsed["timeStr"],
                    "headings": parsed["headings"],
                    "docsMarkdown": md,
                    "missionMarkdown": mission_md,
                    "codeFiles": code_files,
                    "quiz": quiz,
                    "outputs": outputs,
                    "githubUrl": f"{GITHUB_REPO_URL}/tree/main/phases/{p_dir.name}/{l_dir.name}",
                },
            })

        phases_meta.append({
            "num": phase_num,
            "dirName": p_dir.name,
            "slug": phase_slug,
            "title": title_en,
            "titleTh": title_th,
            "tagline": tagline_en,
            "taglineTh": tagline_th,
            "volume": vol_num,
            "dependencies": PHASE_DEPENDENCIES.get(phase_num, []),
            "lessonCount": len(phase_lessons_stubs),
            "estimatedHours": round(total_mins / 60, 1),
            "lessons": phase_lessons_stubs,
        })

    # Write individual lesson JSON files with prev/next pointers
    for idx, entry in enumerate(flat_lessons):
        stub = entry["stub"]
        detail = entry["detail"]
        prev_stub = flat_lessons[idx - 1]["stub"] if idx > 0 else None
        next_stub = flat_lessons[idx + 1]["stub"] if idx + 1 < len(flat_lessons) else None
        detail["prev"] = {
            "phaseDir": prev_stub["phaseDir"],
            "dirName": prev_stub["dirName"],
            "title": prev_stub["title"],
            "phaseNum": prev_stub["phaseNum"],
            "num": prev_stub["num"],
        } if prev_stub else None
        detail["next"] = {
            "phaseDir": next_stub["phaseDir"],
            "dirName": next_stub["dirName"],
            "title": next_stub["title"],
            "phaseNum": next_stub["phaseNum"],
            "num": next_stub["num"],
        } if next_stub else None

        out_dir = LESSONS_OUT_DIR / stub["phaseDir"]
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / f"{stub['dirName']}.json").write_text(
            json.dumps(detail, ensure_ascii=False),
            encoding="utf-8",
        )

    return {
        "volumes": VOLUMES,
        "phases": phases_meta,
    }, flat_lessons, all_skills


def ingest_learning_paths() -> dict[str, Any]:
    lp_dir = REPO_ROOT / "learning-paths"
    paths = []
    for jf in sorted(lp_dir.glob("*.json")):
        d = json.loads(jf.read_text(encoding="utf-8"))
        paths.append(d)
    career_md = (lp_dir / "CAREER-PRACTICE.md").read_text(encoding="utf-8", errors="replace") if (lp_dir / "CAREER-PRACTICE.md").exists() else ""
    return {
        "paths": paths,
        "careerPracticeMarkdown": career_md,
    }


def ingest_projects() -> list[dict[str, Any]]:
    proj_root = REPO_ROOT / "projects"
    projects = []
    for p_dir in sorted(proj_root.iterdir()):
        if not p_dir.is_dir() or p_dir.name.startswith(".") or p_dir.name.startswith("_"):
            continue
        pj_path = p_dir / "project.json"
        meta = json.loads(pj_path.read_text(encoding="utf-8")) if pj_path.exists() else {"id": p_dir.name, "title": p_dir.name.replace("-", " ").title()}
        readme_md = (p_dir / "README.md").read_text(encoding="utf-8", errors="replace") if (p_dir / "README.md").exists() else ""

        def read_dir_files(sub: str, limit: int = 12) -> list[dict[str, Any]]:
            d = p_dir / sub
            if not d.exists():
                return []
            res = []
            for f in sorted(d.rglob("*")):
                if f.is_file() and is_text_code_file(f):
                    txt, trunc = safe_read_text(f, 45_000)
                    res.append({
                        "name": f.relative_to(d).as_posix(),
                        "language": detect_code_language(f),
                        "content": txt,
                        "truncated": trunc,
                    })
                    if len(res) >= limit:
                        break
            return res

        projects.append({
            "id": meta.get("id", p_dir.name),
            "title": meta.get("title", p_dir.name),
            "level": meta.get("level", 1),
            "levelName": meta.get("levelName", "Builder"),
            "tagline": meta.get("tagline", ""),
            "summary": meta.get("summary", ""),
            "youWillBuild": meta.get("youWillBuild", ""),
            "usefulFor": meta.get("usefulFor", []),
            "hours": meta.get("hours", 4),
            "languages": meta.get("languages", []),
            "status": meta.get("status", "ready"),
            "stages": meta.get("stages", []),
            "prerequisites": meta.get("prerequisites", []),
            "readmeMarkdown": readme_md,
            "starterFiles": read_dir_files("starter"),
            "solutionFiles": read_dir_files("solution"),
            "githubUrl": f"{GITHUB_REPO_URL}/tree/main/projects/{p_dir.name}",
        })
    return projects


def ingest_certifications() -> dict[str, Any]:
    cert_root = REPO_ROOT / "certifications"
    programs = []
    for prog_name in ["claude", "mcpa"]:
        p_dir = cert_root / prog_name
        if not p_dir.exists():
            continue
        prog_meta = json.loads((p_dir / "program.json").read_text(encoding="utf-8")) if (p_dir / "program.json").exists() else {"id": prog_name, "name": prog_name.upper()}
        readme_md = (p_dir / "README.md").read_text(encoding="utf-8", errors="replace") if (p_dir / "README.md").exists() else ""
        getting_started_md = (p_dir / "GETTING_STARTED.md").read_text(encoding="utf-8", errors="replace") if (p_dir / "GETTING_STARTED.md").exists() else ""

        tracks = []
        for tf in sorted((p_dir / "tracks").glob("*.json")):
            td = json.loads(tf.read_text(encoding="utf-8"))
            # Attach sample diagnostic / mock questions if available
            tid = td.get("slug") or td.get("id", "").replace("claude-", "")
            assess_dir = p_dir / "assessments" / tid
            assessments = {}
            if assess_dir.exists():
                for af in sorted(assess_dir.glob("*.json")):
                    ad = json.loads(af.read_text(encoding="utf-8"))
                    qs = ad.get("questions", ad if isinstance(ad, list) else [])
                    assessments[af.stem] = {
                        "title": ad.get("title", af.stem) if isinstance(ad, dict) else af.stem,
                        "questionCount": len(qs),
                        "questions": qs[:20],
                    }
            td["assessmentsData"] = assessments
            tracks.append(td)

        # Collect cert lessons list
        cert_lessons = []
        ld = p_dir / "lessons"
        if ld.exists():
            for l in sorted(ld.iterdir()):
                if l.is_dir():
                    doc = l / "docs" / "en.md"
                    txt = doc.read_text(encoding="utf-8", errors="replace") if doc.exists() else ""
                    h1 = H1_RE.search(txt)
                    cert_lessons.append({
                        "slug": l.name,
                        "title": h1.group(1).strip() if h1 else l.name,
                        "docsMarkdown": txt,
                        "quiz": normalize_quiz(l / "quiz.json"),
                    })

        programs.append({
            "id": prog_name,
            "program": prog_meta,
            "readmeMarkdown": readme_md,
            "gettingStartedMarkdown": getting_started_md,
            "tracks": tracks,
            "lessons": cert_lessons,
        })

    overview_md = (cert_root / "README.md").read_text(encoding="utf-8", errors="replace") if (cert_root / "README.md").exists() else ""
    return {
        "overviewMarkdown": overview_md,
        "programs": programs,
    }


def ingest_glossary() -> dict[str, Any]:
    terms_path = REPO_ROOT / "glossary" / "terms.md"
    myths_path = REPO_ROOT / "glossary" / "myths.md"
    entries: list[dict[str, Any]] = []
    if terms_path.exists():
        lines = terms_path.read_text(encoding="utf-8", errors="replace").splitlines()
        current: dict[str, Any] | None = None
        for line in lines:
            if line.startswith("### "):
                if current:
                    entries.append(current)
                term = line[4:].strip()
                first_char = term[0].upper() if term else "#"
                letter = first_char if "A" <= first_char <= "Z" else "#"
                current = {
                    "term": term,
                    "letter": letter,
                    "slug": slugify_heading(term),
                    "category": "General",
                    "whatPeopleSay": "",
                    "meaning": "",
                    "confusion": "",
                    "inPractice": "",
                    "learnLink": "",
                    "related": [],
                }
            elif current is not None and line.startswith("- **"):
                m = re.match(r"-\s*\*\*([^*]+?):\*\*\s*(.+)", line)
                if m:
                    field = m.group(1).strip().lower()
                    val = m.group(2).strip()
                    if field == "category":
                        current["category"] = val
                    elif field == "what people say":
                        current["whatPeopleSay"] = val
                    elif field == "what it actually means":
                        current["meaning"] = val
                    elif field == "common confusion":
                        current["confusion"] = val
                    elif field == "in practice":
                        current["inPractice"] = val
                    elif field == "learn it":
                        lm = re.search(r"\(\.\./phases/([^\)]+)\)", val)
                        if lm:
                            current["learnLink"] = lm.group(1).strip("/")
                    elif field == "related terms":
                        current["related"] = [r.strip() for r in val.split(",") if r.strip()]
        if current:
            entries.append(current)
    myths_md = myths_path.read_text(encoding="utf-8", errors="replace") if myths_path.exists() else ""
    return {"entries": entries, "mythsMarkdown": myths_md}


def ingest_cheatsheets() -> list[dict[str, Any]]:
    cs_dir = REPO_ROOT / "cheatsheets"
    sheets = []
    for f in sorted(cs_dir.glob("*.md")):
        if f.name == "AUTHORING.md":
            continue
        raw = f.read_text(encoding="utf-8", errors="replace")
        fm, body = parse_frontmatter(raw)
        h1 = H1_RE.search(body)
        title = fm.get("title") or (h1.group(1).strip() if h1 else f.stem.replace("-", " ").title())
        sheets.append({
            "id": fm.get("id") or f.stem,
            "slug": f.stem,
            "code": fm.get("code") or "",
            "title": title,
            "subtitle": fm.get("subtitle") or "",
            "sources": [s.strip() for s in str(fm.get("sources") or "").split(",") if s.strip()],
            "markdown": body,
        })
    return sheets


def ingest_practice_interviews_manuals() -> dict[str, Any]:
    # Practice problems
    prac_dir = REPO_ROOT / "practice"
    collections = json.loads((prac_dir / "collections.json").read_text(encoding="utf-8")) if (prac_dir / "collections.json").exists() else []
    problems = []
    for pd in sorted(prac_dir.iterdir()):
        if not pd.is_dir() or pd.name.startswith("_") or pd.name.startswith("."):
            continue
        meta = json.loads((pd / "meta.json").read_text(encoding="utf-8")) if (pd / "meta.json").exists() else {}
        problem_md = (pd / "problem.md").read_text(encoding="utf-8", errors="replace") if (pd / "problem.md").exists() else ""
        hints_md = (pd / "hints.md").read_text(encoding="utf-8", errors="replace") if (pd / "hints.md").exists() else ""
        starter_py = (pd / "starter.py").read_text(encoding="utf-8", errors="replace") if (pd / "starter.py").exists() else ""
        solution_py = (pd / "solution.py").read_text(encoding="utf-8", errors="replace") if (pd / "solution.py").exists() else ""
        problems.append({
            "id": pd.name,
            "title": meta.get("title") or pd.name.replace("-", " ").title(),
            "collection": meta.get("collection") or "general",
            "difficulty": meta.get("difficulty") or "intermediate",
            "minutes": meta.get("minutes") or 15,
            "summary": meta.get("summary") or "",
            "problemMarkdown": problem_md,
            "hintsMarkdown": hints_md,
            "starterCode": starter_py,
            "solutionCode": solution_py,
        })

    # Interviews
    iv_dir = REPO_ROOT / "interviews"
    questions = []
    q_root = iv_dir / "questions"
    if q_root.exists():
        for qf in sorted(q_root.rglob("*.md")):
            if qf.name == "README.md":
                continue
            raw = qf.read_text(encoding="utf-8", errors="replace")
            fm, body = parse_frontmatter(raw)
            questions.append({
                "id": fm.get("id") or qf.stem,
                "title": fm.get("title") or qf.stem.replace("-", " ").title(),
                "category": qf.parent.name,
                "kind": fm.get("kind") or "concept",
                "level": fm.get("level") or "1",
                "roles": fm.get("roles") or [],
                "tags": fm.get("tags") or [],
                "minutes": fm.get("minutes") or "5",
                "markdown": body,
            })

    # Manuals
    man_dir = REPO_ROOT / "manuals"
    manuals = []
    if man_dir.exists():
        for md in sorted(man_dir.iterdir()):
            if not md.is_dir() or md.name.startswith("_"):
                continue
            mjson = md / "manual.json"
            meta = json.loads(mjson.read_text(encoding="utf-8")) if mjson.exists() else {}
            readme = (md / "README.md").read_text(encoding="utf-8", errors="replace") if (md / "README.md").exists() else ""
            manuals.append({
                "id": md.name,
                "title": meta.get("title") or md.name.replace("-", " ").title(),
                "summary": meta.get("summary") or meta.get("tagline") or "",
                "markdown": readme,
                "githubUrl": f"{GITHUB_REPO_URL}/tree/main/manuals/{md.name}",
            })

    return {
        "collections": collections,
        "problems": problems,
        "interviews": questions,
        "manuals": manuals,
    }


def main() -> None:
    if not REPO_ROOT.exists():
        raise SystemExit(f"Missing .upstream-repo at {REPO_ROOT}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("1/7 Copying upstream SVGs and figure runtime...")
    fig_providers = copy_assets_and_figures()
    (DATA_DIR / "figure-providers.json").write_text(json.dumps(fig_providers), encoding="utf-8")

    print("2/7 Ingesting 20 phases and 542 lessons...")
    curriculum, flat_lessons, all_skills = ingest_phases_and_lessons()

    print("3/7 Ingesting learning paths & projects...")
    learning_paths = ingest_learning_paths()
    projects = ingest_projects()

    print("4/7 Ingesting certifications (Claude & MCPA)...")
    certifications = ingest_certifications()

    print("5/7 Ingesting glossary & cheatsheets...")
    glossary = ingest_glossary()
    cheatsheets = ingest_cheatsheets()

    print("6/7 Ingesting practice, interviews & manuals...")
    practice = ingest_practice_interviews_manuals()

    print("7/7 Writing Thai guide, search index, and manifest...")
    th_readme_path = REPO_ROOT / "i18n" / "th" / "README.md"
    th_readme = th_readme_path.read_text(encoding="utf-8", errors="replace") if th_readme_path.exists() else ""
    (DATA_DIR / "thai-guide.json").write_text(json.dumps({"markdown": th_readme}, ensure_ascii=False), encoding="utf-8")

    (DATA_DIR / "learning-paths.json").write_text(json.dumps(learning_paths, ensure_ascii=False), encoding="utf-8")
    (DATA_DIR / "projects.json").write_text(json.dumps(projects, ensure_ascii=False), encoding="utf-8")
    (DATA_DIR / "certifications.json").write_text(json.dumps(certifications, ensure_ascii=False), encoding="utf-8")
    (DATA_DIR / "skills.json").write_text(json.dumps(all_skills, ensure_ascii=False), encoding="utf-8")
    (DATA_DIR / "glossary.json").write_text(json.dumps(glossary, ensure_ascii=False), encoding="utf-8")
    (DATA_DIR / "cheatsheets.json").write_text(json.dumps(cheatsheets, ensure_ascii=False), encoding="utf-8")
    (DATA_DIR / "practice.json").write_text(json.dumps(practice, ensure_ascii=False), encoding="utf-8")

    # Unified lightweight search index
    search_items: list[dict[str, Any]] = []
    for ph in curriculum["phases"]:
        search_items.append({
            "kind": "phase",
            "id": ph["dirName"],
            "title": f"Phase {ph['num']:02d}: {ph['title']}",
            "subtitle": ph["tagline"],
            "meta": f"{ph['lessonCount']} lessons · Vol {ph['volume']}",
            "route": f"/roadmap?phase={ph['num']}",
        })
    for entry in flat_lessons:
        s = entry["stub"]
        search_items.append({
            "kind": "lesson",
            "id": s["path"],
            "title": s["title"],
            "subtitle": s["motto"],
            "meta": f"Phase {s['phaseNum']:02d} · #{s['num']:02d} · {s['type']}" + (f" · {', '.join(s['languages'])}" if s["languages"] else ""),
            "route": f"/learn/{s['phaseDir']}/{s['dirName']}",
        })
    for g in glossary["entries"]:
        search_items.append({
            "kind": "glossary",
            "id": g["slug"],
            "title": g["term"],
            "subtitle": g["meaning"][:140],
            "meta": f"Glossary · {g['category']}",
            "route": f"/glossary?q={g['slug']}",
        })
    for sk in all_skills:
        search_items.append({
            "kind": "skill",
            "id": sk["id"],
            "title": sk["name"],
            "subtitle": sk["description"][:140],
            "meta": f"{sk['type'].upper()} · Phase {sk['phaseNum']:02d}",
            "route": f"/skills?q={sk['name']}",
        })
    for pr in projects:
        search_items.append({
            "kind": "project",
            "id": pr["id"],
            "title": pr["title"],
            "subtitle": pr["tagline"][:140],
            "meta": f"Project · {', '.join(pr['languages'])} · {pr['hours']}h",
            "route": f"/projects/{pr['id']}",
        })
    for cs in cheatsheets:
        search_items.append({
            "kind": "cheatsheet",
            "id": cs["slug"],
            "title": cs["title"],
            "subtitle": cs["subtitle"][:140],
            "meta": f"Cheatsheet {cs['code']}".strip(),
            "route": f"/cheatsheets?sheet={cs['slug']}",
        })
    (DATA_DIR / "search-index.json").write_text(json.dumps(search_items, ensure_ascii=False), encoding="utf-8")

    # Manifest totals
    total_code = sum(e["stub"]["codeFileCount"] for e in flat_lessons)
    total_quizzes = sum(1 for e in flat_lessons if e["stub"]["hasQuiz"])
    skill_cnt = sum(1 for s in all_skills if s["type"] == "skill")
    prompt_cnt = sum(1 for s in all_skills if s["type"] == "prompt")
    agent_cnt = sum(1 for s in all_skills if s["type"] in ("agent", "mcp"))

    manifest = {
        "schemaVersion": 1,
        "repoUrl": GITHUB_REPO_URL,
        "totals": {
            "phases": len(curriculum["phases"]),
            "lessons": len(flat_lessons),
            "codeFiles": total_code,
            "quizzes": total_quizzes,
            "skills": skill_cnt,
            "prompts": prompt_cnt,
            "agents": agent_cnt,
            "outputs": len(all_skills),
            "projects": len(projects),
            "learningPaths": len(learning_paths["paths"]),
            "glossaryTerms": len(glossary["entries"]),
            "cheatsheets": len(cheatsheets),
            "practiceProblems": len(practice["problems"]),
            "interviewQuestions": len(practice["interviews"]),
            "figureCount": len(fig_providers["providers"]),
        },
        "volumes": curriculum["volumes"],
        "phases": curriculum["phases"],
    }
    (DATA_DIR / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")

    t = manifest["totals"]
    print(
        f"DONE: phases={t['phases']} lessons={t['lessons']} codeFiles={t['codeFiles']} "
        f"quizzes={t['quizzes']} outputs={t['outputs']} (skills={t['skills']}, prompts={t['prompts']}, agents={t['agents']}) "
        f"projects={t['projects']} paths={t['learningPaths']} glossary={t['glossaryTerms']} "
        f"cheatsheets={t['cheatsheets']} practice={t['practiceProblems']} interviews={t['interviewQuestions']} "
        f"figures={t['figureCount']}"
    )


if __name__ == "__main__":
    main()
