#!/usr/bin/env python3
"""
Simplified Excalidraw diagrams for the Gas Station AI Engine deck.

Generates:
  - .excalidraw files (editable in excalidraw.com)
  - .png previews for PowerPoint embedding

Diagrams mirror key scenarios from gas-station-coo-ai-engine-implementation-v2.pptx.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
DIAGRAM_DIR = ROOT / (
    "documentation/tenant_management/gas_station_site/videos/generated/diagrams"
)

# Canvas size (Excalidraw coords ≈ PNG pixels at 1:1; PPT scales down)
CANVAS_W = 1200
CANVAS_H = 520


@dataclass
class Node:
    id: str
    x: int
    y: int
    w: int
    h: int
    label: str
    stroke: str = "#9c36b5"
    bg: str = "#f3d9fa"
    font_size: int = 15


@dataclass
class Edge:
    src: str
    dst: str
    label: str = ""
    color: str = "#495057"
    dashed: bool = False


@dataclass
class Diagram:
    file_id: str
    title: str
    subtitle: str
    nodes: list[Node] = field(default_factory=list)
    edges: list[Edge] = field(default_factory=list)
    footer: str = ""


class ExcalidrawBuilder:
    def __init__(self) -> None:
        self.elements: list[dict[str, Any]] = []
        self._seed = 0

    def _sid(self) -> int:
        self._seed += 1
        return self._seed

    def add_title(self, title: str, subtitle: str = "") -> None:
        self.elements.append(
            {
                "id": f"t-{self._sid()}",
                "type": "text",
                "x": 24,
                "y": 12,
                "width": CANVAS_W - 48,
                "height": 28,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "strokeStyle": "solid",
                "roughness": 0,
                "opacity": 100,
                "roundness": None,
                "seed": self._sid(),
                "version": 1,
                "versionNonce": self._sid(),
                "isDeleted": False,
                "text": title,
                "fontSize": 20,
                "fontFamily": 3,
                "textAlign": "left",
                "verticalAlign": "top",
                "containerId": None,
                "originalText": title,
                "autoResize": True,
                "lineHeight": 1.25,
            }
        )
        if subtitle:
            self.elements.append(
                {
                    "id": f"st-{self._sid()}",
                    "type": "text",
                    "x": 24,
                    "y": 38,
                    "width": CANVAS_W - 48,
                    "height": 20,
                    "angle": 0,
                    "strokeColor": "#495057",
                    "backgroundColor": "transparent",
                    "fillStyle": "solid",
                    "strokeWidth": 1,
                    "strokeStyle": "solid",
                    "roughness": 0,
                    "opacity": 100,
                    "roundness": None,
                    "seed": self._sid(),
                    "version": 1,
                    "versionNonce": self._sid(),
                    "isDeleted": False,
                    "text": subtitle,
                    "fontSize": 14,
                    "fontFamily": 3,
                    "textAlign": "left",
                    "verticalAlign": "top",
                    "containerId": None,
                    "originalText": subtitle,
                    "autoResize": True,
                    "lineHeight": 1.25,
                }
            )

    def add_rect(self, node: Node) -> None:
        rid = f"r-{node.id}"
        self.elements.append(
            {
                "id": rid,
                "type": "rectangle",
                "x": node.x,
                "y": node.y,
                "width": node.w,
                "height": node.h,
                "angle": 0,
                "strokeColor": node.stroke,
                "backgroundColor": node.bg,
                "fillStyle": "solid",
                "strokeWidth": 2,
                "strokeStyle": "solid",
                "roughness": 0,
                "opacity": 100,
                "roundness": {"type": 3},
                "seed": self._sid(),
                "version": 1,
                "versionNonce": self._sid(),
                "isDeleted": False,
            }
        )
        self.elements.append(
            {
                "id": f"rt-{node.id}",
                "type": "text",
                "x": node.x + 8,
                "y": node.y + 8,
                "width": node.w - 16,
                "height": node.h - 16,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "strokeStyle": "solid",
                "roughness": 0,
                "opacity": 100,
                "roundness": None,
                "seed": self._sid(),
                "version": 1,
                "versionNonce": self._sid(),
                "isDeleted": False,
                "text": node.label,
                "fontSize": node.font_size,
                "fontFamily": 3,
                "textAlign": "center",
                "verticalAlign": "middle",
                "containerId": None,
                "originalText": node.label,
                "autoResize": True,
                "lineHeight": 1.25,
            }
        )

    def add_arrow(
        self,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
        *,
        color: str = "#495057",
        dashed: bool = False,
        label: str = "",
        lx: int | None = None,
        ly: int | None = None,
    ) -> None:
        self.elements.append(
            {
                "id": f"a-{self._sid()}",
                "type": "arrow",
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1,
                "angle": 0,
                "strokeColor": color,
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 2,
                "strokeStyle": "dashed" if dashed else "solid",
                "roughness": 0,
                "opacity": 100,
                "roundness": {"type": 2},
                "seed": self._sid(),
                "version": 1,
                "versionNonce": self._sid(),
                "isDeleted": False,
                "points": [[0, 0], [x2 - x1, y2 - y1]],
                "lastCommittedPoint": None,
                "startBinding": None,
                "endBinding": None,
                "startArrowhead": None,
                "endArrowhead": "arrow",
            }
        )
        if label:
            tx = lx if lx is not None else (x1 + x2) // 2 - 40
            ty = ly if ly is not None else (y1 + y2) // 2 - 24
            self.elements.append(
                {
                    "id": f"al-{self._sid()}",
                    "type": "text",
                    "x": tx,
                    "y": ty,
                    "width": 120,
                    "height": 20,
                    "angle": 0,
                    "strokeColor": color,
                    "backgroundColor": "#ffffff",
                    "fillStyle": "solid",
                    "strokeWidth": 1,
                    "strokeStyle": "solid",
                    "roughness": 0,
                    "opacity": 100,
                    "roundness": None,
                    "seed": self._sid(),
                    "version": 1,
                    "versionNonce": self._sid(),
                    "isDeleted": False,
                    "text": label,
                    "fontSize": 12,
                    "fontFamily": 3,
                    "textAlign": "center",
                    "verticalAlign": "top",
                    "containerId": None,
                    "originalText": label,
                    "autoResize": True,
                    "lineHeight": 1.25,
                }
            )

    def to_document(self) -> dict[str, Any]:
        return {
            "type": "excalidraw",
            "version": 2,
            "source": "https://excalidraw.com",
            "elements": self.elements,
            "appState": {"gridSize": 20, "viewBackgroundColor": "#ffffff"},
            "files": {},
        }


def _node_map(nodes: list[Node]) -> dict[str, Node]:
    return {n.id: n for n in nodes}


def _anchor(node: Node, side: str) -> tuple[int, int]:
    cx = node.x + node.w // 2
    cy = node.y + node.h // 2
    if side == "right":
        return node.x + node.w, cy
    if side == "left":
        return node.x, cy
    if side == "top":
        return cx, node.y
    return cx, node.y + node.h


def _pick_sides(src: Node, dst: Node) -> tuple[str, str]:
    dx = (dst.x + dst.w // 2) - (src.x + src.w // 2)
    dy = (dst.y + dst.h // 2) - (src.y + src.h // 2)
    if abs(dx) >= abs(dy):
        return ("right", "left") if dx > 0 else ("left", "right")
    return ("bottom", "top") if dy > 0 else ("top", "bottom")


def build_excalidraw(diagram: Diagram) -> dict[str, Any]:
    b = ExcalidrawBuilder()
    b.add_title(diagram.title, diagram.subtitle)
    for n in diagram.nodes:
        b.add_rect(n)
    nm = _node_map(diagram.nodes)
    for e in diagram.edges:
        src, dst = nm[e.src], nm[e.dst]
        ss, ds = _pick_sides(src, dst)
        x1, y1 = _anchor(src, ss)
        x2, y2 = _anchor(dst, ds)
        b.add_arrow(x1, y1, x2, y2, color=e.color, dashed=e.dashed, label=e.label)
    if diagram.footer:
        b.elements.append(
            {
                "id": f"foot-{b._sid()}",
                "type": "text",
                "x": 24,
                "y": CANVAS_H - 36,
                "width": CANVAS_W - 48,
                "height": 28,
                "angle": 0,
                "strokeColor": "#495057",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "strokeStyle": "solid",
                "roughness": 0,
                "opacity": 100,
                "roundness": None,
                "seed": b._sid(),
                "version": 1,
                "versionNonce": b._sid(),
                "isDeleted": False,
                "text": diagram.footer,
                "fontSize": 12,
                "fontFamily": 3,
                "textAlign": "left",
                "verticalAlign": "top",
                "containerId": None,
                "originalText": diagram.footer,
                "autoResize": True,
                "lineHeight": 1.25,
            }
        )
    return b.to_document()


def _hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("arial.ttf", "Arial.ttf", "segoeui.ttf", "calibri.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_w: int) -> list[str]:
    lines: list[str] = []
    for para in text.split("\n"):
        words = para.split(" ")
        cur = ""
        for w in words:
            test = f"{cur} {w}".strip()
            if draw.textlength(test, font=font) <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
    return lines or [""]


def render_png(diagram: Diagram, path: Path) -> None:
    img = Image.new("RGB", (CANVAS_W, CANVAS_H), "#ffffff")
    draw = ImageDraw.Draw(img)
    title_font = _load_font(22)
    sub_font = _load_font(14)
    body_font = _load_font(14)
    small_font = _load_font(12)

    draw.text((24, 10), diagram.title, fill="#1e1e1e", font=title_font)
    if diagram.subtitle:
        draw.text((24, 38), diagram.subtitle, fill="#495057", font=sub_font)

    nm = _node_map(diagram.nodes)
    for n in diagram.nodes:
        stroke = _hex_rgb(n.stroke)
        bg = _hex_rgb(n.bg)
        draw.rounded_rectangle(
            (n.x, n.y, n.x + n.w, n.y + n.h),
            radius=12,
            fill=bg,
            outline=stroke,
            width=2,
        )
        lines = _wrap(draw, n.label, body_font, n.w - 16)
        line_h = 18
        total_h = len(lines) * line_h
        ty = n.y + (n.h - total_h) // 2
        for line in lines:
            tw = draw.textlength(line, font=body_font)
            tx = n.x + (n.w - tw) // 2
            draw.text((tx, ty), line, fill="#1e1e1e", font=body_font)
            ty += line_h

    def arrow_head(x: int, y: int, angle: float, color: tuple[int, int, int]) -> None:
        size = 10
        x1 = x - size * math.cos(angle - math.pi / 6)
        y1 = y - size * math.sin(angle - math.pi / 6)
        x2 = x - size * math.cos(angle + math.pi / 6)
        y2 = y - size * math.sin(angle + math.pi / 6)
        draw.polygon([(x, y), (x1, y1), (x2, y2)], fill=color)

    for e in diagram.edges:
        src, dst = nm[e.src], nm[e.dst]
        ss, ds = _pick_sides(src, dst)
        x1, y1 = _anchor(src, ss)
        x2, y2 = _anchor(dst, ds)
        color = _hex_rgb(e.color)
        if e.dashed:
            seg = 10
            dx, dy = x2 - x1, y2 - y1
            dist = math.hypot(dx, dy) or 1
            ux, uy = dx / dist, dy / dist
            pos = 0.0
            while pos < dist:
                end = min(pos + seg, dist)
                draw.line(
                    (x1 + ux * pos, y1 + uy * pos, x1 + ux * end, y1 + uy * end),
                    fill=color,
                    width=2,
                )
                pos += seg * 2
        else:
            draw.line((x1, y1, x2, y2), fill=color, width=2)
        angle = math.atan2(y2 - y1, x2 - x1)
        arrow_head(x2, y2, angle, color)
        if e.label:
            mx, my = (x1 + x2) // 2, (y1 + y2) // 2 - 14
            lbl = e.label.replace("\n", " ")
            lw = draw.textlength(lbl, font=small_font)
            draw.rectangle((mx - 4, my - 2, mx + lw + 4, my + 14), fill="#ffffff")
            draw.text((mx, my), lbl, fill=e.color, font=small_font)

    if diagram.footer:
        draw.text((24, CANVAS_H - 28), diagram.footer, fill="#495057", font=small_font)

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")


def all_diagrams() -> list[Diagram]:
    """Simplified diagrams — one scenario per file, slide-friendly layout."""
    blue, blue_bg = "#1971c2", "#d0ebff"
    purple, purple_bg = "#9c36b5", "#f3d9fa"
    teal, teal_bg = "#0c8599", "#c3fae8"
    green, green_bg = "#2f9e44", "#d3f9d8"
    orange, orange_bg = "#e67700", "#fff3bf"
    red = "#e03131"
    gray, gray_bg = "#495057", "#f1f3f5"

    return [
        Diagram(
            file_id="01-platform-contract",
            title="Platform ↔ AI Engine contract",
            subtitle="Read registry · process · write curated brief",
            nodes=[
                Node("plat", 40, 130, 220, 110, "Platform\nNext.js + REST API\n(owner dashboard)", blue, blue_bg),
                Node("eng", 400, 110, 360, 150, "AI Engine (AWS ECS)\nConnectors · ML · LLM\nOrchestrator", purple, purple_bg),
                Node("brief", 900, 130, 240, 110, "Owner sees\nDaily brief +\naction cards", green, green_bg),
            ],
            edges=[
                Edge("plat", "eng", "READ integrations\nstations · status", blue, dashed=True),
                Edge("eng", "plat", "WRITE metrics +\nrecommendations", red),
                Edge("plat", "brief", "Dashboard", green),
            ],
            footer="Service JWT + X-Tenant-ID on every engine → platform call",
        ),
        Diagram(
            file_id="02-eight-components",
            title="Eight engine components (simplified pipeline)",
            subtitle="Left → right control flow inside the engine",
            nodes=[
                Node("c1", 20, 160, 115, 70, "C1\nConnectors", purple, purple_bg, 13),
                Node("c2", 150, 160, 115, 70, "C2\nFeature store", purple, purple_bg, 13),
                Node("c3", 280, 160, 115, 70, "C3\nForecast", blue, blue_bg, 13),
                Node("c4", 410, 160, 115, 70, "C4\nAnomaly", blue, blue_bg, 13),
                Node("c5", 540, 160, 115, 70, "C5\nComposer", teal, teal_bg, 13),
                Node("c6", 670, 160, 115, 70, "C6\nLLM explain", orange, orange_bg, 13),
                Node("c7", 800, 160, 115, 70, "C7\nOrchestrator", gray, gray_bg, 13),
                Node("c8", 930, 160, 115, 70, "C8\nWrite-back", green, green_bg, 13),
            ],
            edges=[
                Edge("c1", "c2", "", purple),
                Edge("c2", "c3", "", purple),
                Edge("c3", "c4", "", blue),
                Edge("c4", "c5", "", blue),
                Edge("c5", "c6", "", teal),
                Edge("c6", "c7", "", orange),
                Edge("c7", "c8", "", gray),
            ],
            footer="C7 schedules nightly; C8 POST/PATCH to platform REST API",
        ),
        Diagram(
            file_id="03-store-ingest",
            title="Store data ingest",
            subtitle="How POS / fuel files enter the engine",
            nodes=[
                Node("stores", 30, 140, 200, 120, "Store systems\nPOS · Fuel · Payroll\n(API / SFTP / CSV)", orange, orange_bg),
                Node("conn", 300, 150, 200, 100, "C1 Connectors\nExtract · Normalize", purple, purple_bg),
                Node("s3", 560, 150, 180, 100, "S3 raw zone\n+ features", teal, teal_bg),
                Node("ml", 800, 150, 160, 100, "C3–C4\nML models", blue, blue_bg),
            ],
            edges=[
                Edge("stores", "conn", "pull files", orange),
                Edge("conn", "s3", "validate · load", purple),
                Edge("s3", "ml", "daily features", teal),
            ],
            footer="PATCH integration sync status back to platform after each run",
        ),
        Diagram(
            file_id="04-two-brains",
            title="Two kinds of AI",
            subtitle="Forecasting math (we train) vs language model (we rent)",
            nodes=[
                Node("data", 40, 150, 160, 90, "Store history\n(S3 features)", teal, teal_bg),
                Node("ml", 250, 130, 200, 110, "① ML models\nProphet / GBM\nTrained weekly on AWS", blue, blue_bg),
                Node("rank", 500, 150, 160, 90, "Ranked\nactions + $", purple, purple_bg),
                Node("llm", 720, 130, 200, 110, "② LLM API\nClaude / GPT\nvia Bedrock", orange, orange_bg),
                Node("owner", 980, 150, 160, 90, "Plain English\nexplanation", green, green_bg),
            ],
            edges=[
                Edge("data", "ml", "train · infer", blue),
                Edge("ml", "rank", "scores", blue),
                Edge("rank", "llm", "JSON context", purple),
                Edge("llm", "owner", "explain", orange),
            ],
            footer="LLM is NOT trained at MVP — prompting + RAG only",
        ),
        Diagram(
            file_id="05-bedrock-hosting",
            title="LLM hosting — one API call (MVP path)",
            subtitle="Engine calls Bedrock once; Claude runs inside that service",
            nodes=[
                Node("ecs", 60, 160, 220, 100, "AI Engine\n(ECS Fargate)\nPython + boto3", purple, purple_bg),
                Node(
                    "bedrock",
                    340,
                    110,
                    480,
                    220,
                    "Amazon Bedrock\n(AWS — the API we call)\nmodelId: anthropic.claude-3-5-sonnet\n──────────────────\nHosts inside:\nClaude 3.5 Sonnet\n(Anthropic model weights)",
                    orange,
                    orange_bg,
                ),
                Node("resp", 880, 160, 200, 100, "JSON / text\nback to engine\n→ platform brief", green, green_bg),
                Node("secrets", 340, 360, 480, 70, "Secrets Manager · AWS credentials (not a second LLM call)", gray, gray_bg),
            ],
            edges=[
                Edge("ecs", "bedrock", "ONE HTTPS call", orange),
                Edge("bedrock", "resp", "explanation", orange),
                Edge("secrets", "ecs", "auth", gray, dashed=True),
            ],
            footer="NOT two billable hops — Bedrock is the door; Claude is the brain behind it",
        ),
        Diagram(
            file_id="06-rag-flow",
            title="RAG — memory outside the model",
            subtitle="Retriever builds context packet; LLM only explains",
            nodes=[
                Node("s3", 30, 160, 150, 80, "S3 +\nfeatures", teal, teal_bg, 13),
                Node("ret", 210, 160, 150, 80, "Retriever\n(python)", purple, purple_bg, 13),
                Node("ctx", 390, 160, 170, 80, "Context JSON\nno raw receipts", blue, blue_bg, 13),
                Node("llm", 590, 160, 150, 80, "Bedrock\nLLM", orange, orange_bg, 13),
                Node("out", 770, 160, 150, 80, "explanation\nfield", green, green_bg, 13),
                Node("plat", 950, 160, 150, 80, "Platform\nbrief UI", green, green_bg, 13),
            ],
            edges=[
                Edge("s3", "ret", "", teal),
                Edge("ret", "ctx", "RAG", purple),
                Edge("ctx", "llm", "prompt", orange),
                Edge("llm", "out", "", orange),
                Edge("out", "plat", "write-back", red),
            ],
            footer="RAG is external to model weights — not fine-tuning",
        ),
        Diagram(
            file_id="07-tools-mcp",
            title="LLM tools & MCP",
            subtitle="Function calling (MVP) · MCP plugins (later)",
            nodes=[
                Node("llm", 480, 120, 200, 90, "LLM agent\n(Bedrock)", orange, orange_bg),
                Node("t1", 80, 250, 170, 70, "get_metrics\n(platform API)", blue, blue_bg, 13),
                Node("t2", 300, 250, 170, 70, "get_recs\n(platform API)", blue, blue_bg, 13),
                Node("t3", 520, 250, 170, 70, "run_forecast\n(engine)", purple, purple_bg, 13),
                Node("mcp", 820, 250, 200, 70, "MCP servers\n(phase 4+)\nweather · prices", teal, teal_bg, 13),
                Node("plat", 80, 120, 200, 80, "Platform\nREST API", blue, blue_bg, 13),
            ],
            edges=[
                Edge("llm", "t1", "tool call", orange, dashed=True),
                Edge("llm", "t2", "tool call", orange, dashed=True),
                Edge("llm", "t3", "tool call", orange, dashed=True),
                Edge("llm", "mcp", "optional", teal, dashed=True),
                Edge("t1", "plat", "JWT", blue),
                Edge("t2", "plat", "JWT", blue),
            ],
            footer="RAG = what to read · tools/MCP = what the agent can invoke",
        ),
        Diagram(
            file_id="08-nightly-orchestration",
            title="Overnight orchestration",
            subtitle="Scheduled batch per tenant — many stores in parallel",
            nodes=[
                Node("eb", 40, 150, 180, 90, "EventBridge\ncron", gray, gray_bg),
                Node("sqs", 260, 150, 160, 90, "SQS\nqueue", gray, gray_bg),
                Node("worker", 460, 130, 220, 110, "ECS worker\nper tenant job", purple, purple_bg),
                Node("pipe", 720, 150, 200, 90, "Per station:\ningest→ML→LLM", teal, teal_bg, 13),
                Node("api", 960, 150, 180, 90, "Platform\nREST write", green, green_bg),
            ],
            edges=[
                Edge("eb", "sqs", "enqueue", gray),
                Edge("sqs", "worker", "poll", gray),
                Edge("worker", "pipe", "parallel", purple),
                Edge("pipe", "api", "POST/PATCH", red),
            ],
            footer="Idempotent per calendar day · partial failure per station isolated",
        ),
        Diagram(
            file_id="09-owner-chat",
            title="Owner chat (on-demand)",
            subtitle="Browser never holds LLM keys",
            nodes=[
                Node("owner", 40, 150, 140, 90, "Owner\nbrowser", green, green_bg),
                Node("next", 220, 140, 200, 100, "Next.js\nserver action", blue, blue_bg),
                Node("eng", 460, 140, 200, 100, "Engine\n/v1/chat", purple, purple_bg),
                Node("br", 720, 140, 180, 100, "Bedrock\nClaude", orange, orange_bg),
                Node("tools", 720, 300, 180, 80, "Tools +\nRAG context", teal, teal_bg, 13),
            ],
            edges=[
                Edge("owner", "next", "message", green),
                Edge("next", "eng", "POST", blue),
                Edge("eng", "br", "prompt", orange),
                Edge("eng", "tools", "fetch", teal, dashed=True),
                Edge("tools", "eng", "results", teal, dashed=True),
                Edge("eng", "next", "reply", purple),
                Edge("next", "owner", "stream", green),
            ],
            footer="Phase 3 · same pattern as refresh-brief server action",
        ),
        Diagram(
            file_id="10-aws-hosting-map",
            title="AWS hosting map (layman)",
            subtitle="What runs where in our account",
            nodes=[
                Node("ecs", 40, 130, 200, 100, "ECS Fargate\nengine API +\nworkers", purple, purple_bg),
                Node("s3", 280, 130, 160, 100, "S3\nraw + models", teal, teal_bg),
                Node("sm", 480, 130, 180, 100, "Secrets\nManager", gray, gray_bg),
                Node("br", 700, 130, 200, 100, "Bedrock\nLLM API", orange, orange_bg),
                Node("plat", 940, 130, 200, 100, "Platform\nAmplify + RDS", blue, blue_bg),
            ],
            edges=[
                Edge("ecs", "s3", "", purple),
                Edge("ecs", "sm", "", gray, dashed=True),
                Edge("ecs", "br", "tokens $", orange),
                Edge("ecs", "plat", "write-back", red),
            ],
            footer="Hugging Face = optional model catalog if self-hosting Llama later — not MVP hosting",
        ),
        Diagram(
            file_id="11-bedrock-claude-explained",
            title="Bedrock vs Claude — do we need both?",
            subtitle="Plain answer: ONE outbound call in MVP · two names for two layers",
            nodes=[
                Node(
                    "faq",
                    24,
                    68,
                    1150,
                    52,
                    "❓ Do we call Bedrock AND Claude separately?  →  NO. Our engine makes ONE API request. "
                    "Bedrock = AWS storefront + billing. Claude = the Anthropic model Bedrock runs for us.",
                    gray,
                    "#fff9db",
                    13,
                ),
                Node("eng", 40, 160, 190, 100, "AI Engine\n(our code)\nboto3 / SDK", purple, purple_bg),
                Node(
                    "br",
                    280,
                    130,
                    460,
                    200,
                    "Amazon Bedrock\n═══════════════\n• AWS managed API\n• IAM + single AWS bill\n• We send: modelId + prompt\n═══════════════\nRuns internally ↓",
                    orange,
                    "#ffec99",
                ),
                Node(
                    "claude",
                    350,
                    280,
                    320,
                    90,
                    "Claude 3.5 Sonnet\n(Anthropic)\nexternal LLM — weights\nnot on our servers",
                    purple,
                    purple_bg,
                    14,
                ),
                Node("out", 790, 170, 170, 90, "Response\nto engine", green, green_bg),
                Node(
                    "alt",
                    790,
                    300,
                    360,
                    110,
                    "Optional Path B (skip Bedrock)\nEngine → api.anthropic.com\nSame Claude model · separate bill",
                    blue,
                    blue_bg,
                    13,
                ),
                Node(
                    "use",
                    40,
                    380,
                    560,
                    110,
                    "What each is FOR\n──────────────\nBedrock: how we ACCESS the model (AWS API, cost meter, security)\nClaude: WHAT generates English (brief text, chat, JSON explanations)\nOur ML models (Prophet/GBM): separate — forecasts $ numbers, not language",
                    teal,
                    teal_bg,
                    13,
                ),
                Node(
                    "when",
                    640,
                    380,
                    510,
                    110,
                    "WHEN each is used\n──────────────\nEvery nightly brief explanation · owner chat · RAG explain step\nEngine passes structured JSON context — never raw receipts\nCode: invoke_model(modelId='anthropic.claude-3-5-sonnet', ...)",
                    blue,
                    blue_bg,
                    13,
                ),
            ],
            edges=[
                Edge("eng", "br", "ONE call (MVP)", orange),
                Edge("br", "claude", "hosts model", purple),
                Edge("br", "out", "text / JSON", orange),
                Edge("eng", "alt", "alternate", blue, dashed=True),
            ],
            footer="Analogy: Bedrock = app store · Claude = the app · We install one app through the store",
        ),
        Diagram(
            file_id="12-platform-engine-bedrock-connectivity",
            title="Platform + AI Engine + Bedrock — full connectivity",
            subtitle="Three systems · who calls whom · inputs & outputs",
            nodes=[
                Node(
                    "plat",
                    30,
                    120,
                    250,
                    160,
                    "Host platform\n(running today)\n─────────────\nNext.js mosc-temp\nREST API + dashboard\nClerk auth\nNever calls Bedrock",
                    blue,
                    blue_bg,
                    13,
                ),
                Node(
                    "eng",
                    360,
                    100,
                    300,
                    200,
                    "AI Engine\n(AWS ECS)\n─────────────\nConnectors · ML\nLLM agent · orchestrator\nOwns Bedrock API key",
                    purple,
                    purple_bg,
                    13,
                ),
                Node(
                    "br",
                    740,
                    120,
                    250,
                    160,
                    "Amazon Bedrock\n─────────────\nClaude model inside\nToken billing\nNo link to platform",
                    orange,
                    orange_bg,
                    13,
                ),
                Node(
                    "legend",
                    30,
                    320,
                    960,
                    90,
                    "Call summary\n① Engine READ platform (GET stations, integrations, prior rec status)\n"
                    "② Engine WRITE platform (POST metrics + recommendations, PATCH sync status)\n"
                    "③ Platform → Engine on-demand only (POST /v1/chat · /v1/runs/trigger via server action)\n"
                    "④ Engine ↔ Bedrock many times per night (one explain prompt per station + chat turns)",
                    gray,
                    gray_bg,
                    12,
                ),
            ],
            edges=[
                Edge("eng", "plat", "① READ ② WRITE (JWT)", red),
                Edge("plat", "eng", "③ chat / refresh trigger", blue, dashed=True),
                Edge("eng", "br", "④ OUT prompts", orange),
                Edge("br", "eng", "④ IN responses", orange, dashed=True),
            ],
            footer="Platform ↔ Engine = curated data only · Engine ↔ Bedrock = language I/O only",
        ),
        Diagram(
            file_id="13-engine-bedrock-io-multicall",
            title="Engine ↔ Bedrock — multi-call I/O",
            subtitle="Inputs sent out · responses back · repeats per store and per chat turn",
            nodes=[
                Node(
                    "night",
                    24,
                    72,
                    1150,
                    44,
                    "OVERNIGHT (batch): 50 stores ≈ 50 Bedrock round-trips (one structured prompt + one explanation each)",
                    teal,
                    teal_bg,
                    12,
                ),
                Node("comp", 40, 140, 140, 70, "Composer\nranked JSON", purple, purple_bg, 12),
                Node("out1", 210, 140, 130, 70, "OUT →\nprompt", orange, orange_bg, 12),
                Node("br1", 370, 130, 150, 90, "Bedrock\ninvoke", orange, "#ffec99", 13),
                Node("in1", 550, 140, 130, 70, "IN ←\ntext/JSON", orange, orange_bg, 12),
                Node("wb", 720, 140, 150, 70, "Write-back\nplatform", green, green_bg, 12),
                Node(
                    "chat",
                    24,
                    240,
                    1150,
                    36,
                    "CHAT (on-demand): Platform POST → Engine → Bedrock — may loop 2–4× if tools/RAG needed",
                    blue,
                    blue_bg,
                    12,
                ),
                Node("platc", 40, 300, 120, 60, "Platform\nPOST chat", blue, blue_bg, 12),
                Node("engc", 190, 290, 130, 80, "Engine\nagent", purple, purple_bg, 12),
                Node("brc", 360, 290, 130, 80, "Bedrock\ncall 1", orange, orange_bg, 12),
                Node("tools", 530, 290, 130, 80, "Engine\nRAG + tools", teal, teal_bg, 12),
                Node("brc2", 700, 290, 130, 80, "Bedrock\ncall 2", orange, orange_bg, 12),
                Node("reply", 870, 300, 130, 60, "OUT →\nplatform", green, green_bg, 12),
            ],
            edges=[
                Edge("comp", "out1", "", purple),
                Edge("out1", "br1", "", orange),
                Edge("br1", "in1", "", orange),
                Edge("in1", "wb", "", green),
                Edge("platc", "engc", "", blue),
                Edge("engc", "brc", "OUT", orange),
                Edge("brc", "tools", "tool request", orange, dashed=True),
                Edge("tools", "brc2", "OUT + results", orange),
                Edge("brc2", "reply", "IN answer", green),
            ],
            footer="Each arrow pair = one billable Bedrock request/response · Platform never in Bedrock path",
        ),
    ]


def generate_all(output_dir: Path | None = None) -> list[tuple[Path, Path]]:
    """Write .excalidraw + .png for each diagram. Returns list of (excalidraw, png) paths."""
    out = output_dir or DIAGRAM_DIR
    out.mkdir(parents=True, exist_ok=True)
    paths: list[tuple[Path, Path]] = []
    for d in all_diagrams():
        ex = out / f"{d.file_id}.excalidraw"
        png = out / f"{d.file_id}.png"
        ex.write_text(json.dumps(build_excalidraw(d), indent=2), encoding="utf-8")
        render_png(d, png)
        paths.append((ex, png))
        print(f"Wrote {ex.name} + {png.name}")
    return paths


# Slide titles for diagram appendix in PPT
DIAGRAM_SLIDE_META: list[tuple[str, str, str]] = [
    ("Diagram: Platform contract", "Read · process · write-back", "01-platform-contract"),
    ("Diagram: Eight components", "Simplified engine pipeline", "02-eight-components"),
    ("Diagram: Store ingest", "POS / fuel → connectors → features", "03-store-ingest"),
    ("Diagram: Two kinds of AI", "ML train vs LLM rent", "04-two-brains"),
    ("Diagram: Bedrock + LLM hosting", "One API call — Claude runs inside Bedrock", "05-bedrock-hosting"),
    ("Diagram: Bedrock vs Claude explained", "Do we need both? Roles · connection · usage", "11-bedrock-claude-explained"),
    ("Diagram: RAG flow", "External retrieval → context → LLM", "06-rag-flow"),
    ("Diagram: Tools & MCP", "Function calling and future MCP plugins", "07-tools-mcp"),
    ("Diagram: Nightly orchestration", "EventBridge → queue · workers · API", "08-nightly-orchestration"),
    ("Diagram: Owner chat", "Server action → engine → Bedrock", "09-owner-chat"),
    ("Diagram: AWS hosting map", "ECS · S3 · Secrets · Bedrock · Platform", "10-aws-hosting-map"),
]

# Separate appendix section — three-system connectivity (was missing from prior diagrams)
CONNECTIVITY_DIAGRAM_SLIDE_META: list[tuple[str, str, str]] = [
    (
        "Connectivity: Platform · Engine · Bedrock",
        "Host platform + AI engine + AWS — all call directions",
        "12-platform-engine-bedrock-connectivity",
    ),
    (
        "Connectivity: Engine ↔ Bedrock I/O",
        "Multi-call inputs/outputs — nightly batch + chat loops",
        "13-engine-bedrock-io-multicall",
    ),
]


if __name__ == "__main__":
    generate_all()
