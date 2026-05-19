#!/usr/bin/env python3
"""Genera la campaña de leads que debe cargar el CRM para llamadas."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "leads" / "reales" / "leads-reales.json"
DEFAULT_OUTPUT = ROOT / "app" / "leads-campana.js"


def clean(value: object) -> str:
    return str(value or "").strip()


def priority_rank(lead: dict) -> tuple[int, str, str]:
    priority = clean(lead.get("prioridad")).lower()
    rank = 2
    if priority == "alta":
        rank = 0
    elif priority == "media":
        rank = 1
    return rank, clean(lead.get("sector")), clean(lead.get("nombre_empresa"))


def normalize_lead(lead: dict, index: int) -> dict:
    normalized = dict(lead)
    normalized["estado"] = "Nuevo"
    normalized["prioridad"] = clean(normalized.get("prioridad")) or "Alta"
    normalized["tags"] = sorted(set([*(normalized.get("tags") or []), "campana-martes", "llamar-martes"]))
    normalized["historial"] = normalized.get("historial") if isinstance(normalized.get("historial"), list) else []
    normalized["notas"] = clean(normalized.get("notas"))
    normalized["orden_llamada"] = index
    return normalized


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera leads-campana.js para el CRM.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--limite", type=int, default=25)
    parser.add_argument("--version", default="llamadas-martes-20260519")
    args = parser.parse_args()

    leads = json.loads(args.input.read_text(encoding="utf-8"))
    selected = [lead for lead in leads if isinstance(lead, dict) and clean(lead.get("telefono"))]
    selected.sort(key=priority_rank)
    selected = [normalize_lead(lead, index) for index, lead in enumerate(selected[: args.limite], start=1)]

    payload = {
        "version": args.version,
        "nombre": "Llamadas martes",
        "leads": selected,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "window.ESARIA_CAMPAIGN = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Campaña generada: {args.output} ({len(selected)} leads)")


if __name__ == "__main__":
    main()
