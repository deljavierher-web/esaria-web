#!/usr/bin/env python3
"""Valida que los decisores enriquecidos no contengan falsos positivos obvios."""

import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).parent.parent
INPUT = BASE / "leads" / "reales" / "leads-reales.json"

KNOWN_GARBAGE = {
    "Acceso Grado Medio Acceso",
    "Superior Idiomas Clases",
    "León Oferta",
    "Leon Oferta",
    "Estado Administrativo",
    "Servicio de Salud Castilla",
    "Fuente Llevamos",
    "Profesionalidad Visitar",
    "Director Odontológico",
}

GENERIC_TOKENS = {
    "Acceso", "Grado", "Medio", "Superior", "Idiomas", "Clases", "Oferta",
    "Estado", "Administrativo", "Administrativa", "Administración", "Administracion",
    "Servicio", "Salud", "Castilla", "León", "Leon", "Junta", "Auxiliar",
    "Promoción", "Promocion", "Interna", "Convocatoria", "Plazas", "Información",
    "Informacion", "Temario", "Oposiciones", "Curso", "Cursos", "Universidad",
    "Graduado", "Bachillerato", "ESO", "EVAU", "UNED", "IGCSE", "A-LEVEL",
    "Planes", "Estudio", "Estudios", "Fuente", "Llevamos", "Pide", "Cita",
    "Inicio", "Equipo", "Nuestro", "Nuestra", "Nuestros", "Nuestras", "Conoce",
    "Visitar", "Profesionalidad", "Sanitario", "Registro", "Legal", "Privacidad",
    "Fray", "VIII", "Osteopatía", "Osteopatia", "Optica", "Óptica",
    "Dirección", "Direccion", "Gerencia", "Director", "Directora", "Responsable",
}

NAME_RE = re.compile(r"^(?:Dr\.|Dra\.)?\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|del|la|las|los|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)){0,4}$")


def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def is_generic_name(value: str) -> bool:
    words = [w.strip(".,;:()[]") for w in normalize(value).split()]
    return any(word in GENERIC_TOKENS for word in words)


def validate(path: Path) -> tuple[list[str], dict[str, int]]:
    with open(path, encoding="utf-8") as f:
        leads = json.load(f)
    if not isinstance(leads, list):
        return ["El JSON no contiene una lista de leads"], {}

    errors = []
    summary = {"Alta": 0, "Media": 0, "Baja": 0, "No encontrado": 0}

    for index, lead in enumerate(leads, start=1):
        lead_id = lead.get("id") or f"lead #{index}"
        name = normalize(lead.get("decisor_nombre", ""))
        confidence = normalize(lead.get("confianza_decisor", "")) or "No encontrado"
        source = normalize(lead.get("fuente_decisor", ""))
        evidence = normalize(lead.get("evidencia_decisor", ""))
        candidates = lead.get("candidatos_decisor", [])

        if confidence not in summary:
            errors.append(f"{lead_id}: confianza_decisor no válida: {confidence}")
        else:
            summary[confidence] += 1

        if name in KNOWN_GARBAGE:
            errors.append(f"{lead_id}: falso positivo conocido como decisor_nombre: {name}")
        if name and is_generic_name(name):
            errors.append(f"{lead_id}: decisor_nombre contiene término genérico: {name}")
        if name and not NAME_RE.match(name):
            errors.append(f"{lead_id}: decisor_nombre no parece nombre de persona: {name}")
        if name and (not source or not evidence):
            errors.append(f"{lead_id}: decisor_nombre relleno sin fuente o evidencia")
        if confidence == "No encontrado" and name:
            errors.append(f"{lead_id}: tiene nombre pero confianza No encontrado")
        if confidence in ("Alta", "Media") and not name:
            errors.append(f"{lead_id}: confianza {confidence} sin decisor_nombre")

        if not isinstance(candidates, list):
            errors.append(f"{lead_id}: candidatos_decisor no es una lista")
            continue
        for cindex, candidate in enumerate(candidates, start=1):
            cname = normalize(candidate.get("nombre", ""))
            if not cname:
                errors.append(f"{lead_id}: candidato #{cindex} sin nombre")
                continue
            if cname in KNOWN_GARBAGE or is_generic_name(cname):
                errors.append(f"{lead_id}: falso positivo conocido en candidatos_decisor: {cname}")
            for field in ("cargo", "fuente", "confianza", "evidencia"):
                if field not in candidate:
                    errors.append(f"{lead_id}: candidato #{cindex} sin campo {field}")

    return errors, summary


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else INPUT
    errors, summary = validate(path)
    if errors:
        print("[ERROR] Validación de decisores fallida:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print("[OK] Validación de decisores superada.")
    print(f"     Alta          : {summary.get('Alta', 0)}")
    print(f"     Media         : {summary.get('Media', 0)}")
    print(f"     Baja          : {summary.get('Baja', 0)}")
    print(f"     No encontrado : {summary.get('No encontrado', 0)}")
    print("     Falsos positivos conocidos: 0")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
