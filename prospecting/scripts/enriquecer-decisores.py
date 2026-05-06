#!/usr/bin/env python3
"""
EsarIA — Enriquecer decisores desde webs oficiales.

Lee leads/reales/leads-reales.json y busca indicios del decisor solo en la
web publica del negocio. No usa login, redes sociales ni scraping agresivo.
"""

import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

BASE = Path(__file__).parent.parent
INPUT = BASE / "leads" / "reales" / "leads-reales.json"

USER_AGENT = "EsarIAProspectingBot/1.0"
TIMEOUT = 10
MAX_PAGES_PER_DOMAIN = 6
REQUEST_DELAY_SECONDS = 1.0

CANDIDATE_PATHS = [
    "/",
    "/quienes-somos",
    "/quienes-somos/",
    "/sobre-nosotros",
    "/sobre-nosotros/",
    "/equipo",
    "/equipo/",
    "/contacto",
    "/contacto/",
    "/clinica",
    "/la-clinica",
    "/nosotros",
    "/about",
    "/team",
]

BLOCKED_PATH_PARTS = (
    "login",
    "admin",
    "wp-admin",
    "checkout",
    "cart",
    "carrito",
    "mi-cuenta",
    "account",
    "register",
)

ROLE_PATTERNS = [
    ("Directora", r"\b[Dd]irectora\b"),
    ("Director", r"\b[Dd]irector\b"),
    ("Gerente", r"\b[Gg]erente\b"),
    ("Propietaria", r"\b[Pp]ropietaria\b"),
    ("Propietario", r"\b[Pp]ropietario\b"),
    ("Fundadora", r"\b[Ff]undadora\b"),
    ("Fundador", r"\b[Ff]undador\b"),
    ("CEO", r"\bCEO\b"),
    ("Responsable", r"\b[Rr]esponsable\b"),
    ("Administrador", r"\b[Aa]dministrador(?:a)?\b"),
    ("Titular", r"\b[Tt]itular\b"),
    ("Doctor", r"\bDr\.\s+|\b[Dd]octor\b"),
    ("Doctora", r"\bDra\.\s+|\b[Dd]octora\b"),
]

ROLE_RE = re.compile("|".join(f"(?:{pattern})" for _, pattern in ROLE_PATTERNS))
TEAM_RE = re.compile(r"\b[Ee]quipo\b")
DIRECTIVE_RE = re.compile(
    r"\b[Dd]irectora?\b|\b[Gg]erente\b|\b[Pp]ropietaria?o?\b|\b[Tt]itular\b|\bCEO\b"
)
DENTAL_RE = re.compile(r"\b[Dd]entista\b|\b[Oo]dont[oó]log[oa]\b|\b[Cc]l[ií]nica dental\b")
STAFF_ROLE_RE = re.compile(
    r"\b[Dd]entista\b|\b[Oo]dont[oó]log[oa]\b|\b[Hh]igienista\b|\b[Aa]uxiliar\b|"
    r"\b[Oo]rtodoncista\b|\b[Ii]mplant[oó]log[oa]\b|\b[Ee]ndodoncista\b|\b[Pp]eriodoncista\b"
)
ACADEMIC_CONTEXT_RE = re.compile(
    r"\b[Cc]olegio Oficial\b|\b[Uu]niversidad\b|\b[Ff]acultad\b|\b[Pp]osgrado\b|"
    r"\b[Mm][aá]ster\b|\b[Ff]ormaci[oó]n\b|\b[Cc]urso\b|\b[Cc]olegiad[oa]\b|"
    r"\b[Cc]entros? de radiodiagn[oó]stico\b"
)

NAME_WORD = r"[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+"
NAME_RE = re.compile(
    rf"\b(?:Dr\.|Dra\.)?\s*{NAME_WORD}(?:\s+(?:de|del|la|las|los))?(?:\s+{NAME_WORD}){{1,4}}\b"
)
MEDICAL_NAME_RE = re.compile(
    rf"\b(?:Odont[oó]log[oa]\s+General\s+|Dentista\s+|Directora\s*[-–]\s*Dentista\s+|"
    rf"Director\s*[-–]\s*)?(?P<name>(?:Dr\.|Dra\.)\s+{NAME_WORD}(?:\s+{NAME_WORD}){{0,3}})\b"
)

BLACKLIST_STRONG = (
    "Colegio Oficial",
    "Universidad",
    "Facultad",
    "Posgrado",
    "Máster",
    "Master",
    "Formación",
    "Curso",
    "Tratamientos",
    "Instalaciones",
    "Inicio",
    "Quiénes",
    "Quienes",
    "Conoce",
    "Materiales Premium",
    "Prevención",
    "Endodoncia",
    "Ortodoncia",
    "Periodoncia",
    "Implantología",
    "Implantologia",
    "Odontopediatría",
    "Odontopediatria",
    "Prótesis",
    "Protesis",
    "Estomatólogos",
    "Estomatologos",
    "Colegiado",
    "Centro de radiodiagnóstico",
    "Centro de radiodiagnostico",
    "Centros de radiodiagnóstico",
    "Centros de radiodiagnostico",
    "Santos Pilarica",
)

NAME_STOPWORDS = {
    "El",
    "La",
    "Dental",
    "Clínica",
    "Clinica",
    "Somos",
    "Tratamiento",
    "Tratamientos",
    "Seguimiento",
    "Consejo",
    "General",
    "Dentistas",
    "España",
    "Financiación",
    "Horario",
    "Lunes",
    "Contacto",
    "Teléfono",
    "Telefono",
    "Calle",
    "Valladolid",
    "Equipo",
    "Braquets",
    "Odontología",
    "Odontologia",
    "Restauradora",
    "Implantes",
    "Registro",
    "Sanitario",
    "Espe",
    "Contactar",
    "Blog",
    "News",
    "Search",
    "Paseo",
    "Prostodoncista",
    "Higienista",
    "Auxiliar",
    "Administración",
    "Administracion",
    "Personal",
    "Son",
    "Publicado",
    "Política",
    "Politica",
    "Cookies",
    "Guía",
    "Guia",
    "Sábado",
    "Sabado",
    "Cerrado",
    "Boca",
    "Multimedia",
    "Call",
    "Now",
}

TRAILING_PROFESSION_WORDS = {
    "Odontólogo",
    "Odontóloga",
    "Odontologo",
    "Odontologa",
    "Dentista",
    "Especialista",
    "Implantólogo",
    "Implantóloga",
    "Implantologo",
    "Implantologa",
    "Ortodoncista",
    "Endodoncista",
    "Periodoncista",
    "Graduada",
    "Graduado",
    "Licenciada",
    "Licenciado",
    "General",
    "Prostodoncista",
    "Higienista",
    "Auxiliar",
    "Me",
    "Atención",
    "Atencion",
    "Buenas",
}

STATS = {"candidatos_descartados_basura": 0}


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = False
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip = True

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            text = data.strip()
            if text:
                self.parts.append(text)

    def text(self):
        return " ".join(self.parts)


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value or "")).strip()


def normalize_web(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        return ""
    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw
    parsed = urllib.parse.urlparse(raw)
    if not parsed.netloc:
        return ""
    path = parsed.path or "/"
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, path, "", "", ""))


def is_safe_candidate(url: str, base_netloc: str) -> bool:
    parsed = urllib.parse.urlparse(url)
    if parsed.netloc.lower() != base_netloc.lower():
        return False
    path = parsed.path.lower()
    return not any(part in path for part in BLOCKED_PATH_PARTS)


def build_candidate_urls(web: str) -> list[str]:
    normalized = normalize_web(web)
    if not normalized:
        return []
    parsed = urllib.parse.urlparse(normalized)
    root = f"{parsed.scheme}://{parsed.netloc}"
    urls = []
    for path in CANDIDATE_PATHS:
        url = urllib.parse.urljoin(root, path)
        if is_safe_candidate(url, parsed.netloc) and url not in urls:
            urls.append(url)
    return urls[:MAX_PAGES_PER_DOMAIN]


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        content_type = resp.headers.get("content-type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            return ""
        raw = resp.read(800_000).decode(resp.headers.get_content_charset() or "utf-8", errors="ignore")
    parser = TextExtractor()
    parser.feed(raw)
    return normalize_space(parser.text())


def short_fragment(text: str, start: int, end: int, size: int = 180) -> str:
    a = max(0, start - size // 2)
    b = min(len(text), end + size // 2)
    return normalize_space(text[a:b])[:260]


def role_from_text(value: str) -> str:
    for role, pattern in ROLE_PATTERNS:
        if re.search(pattern, value):
            return role
    return ""


def is_blacklisted_name(value: str) -> bool:
    compact = normalize_space(value).lower()
    return any(term.lower() in compact for term in BLACKLIST_STRONG)


def canonical_name(value: str) -> str:
    value = normalize_space(value)
    value = re.sub(r"^(Dr\.|Dra\.)\s+", "", value)
    return value.lower()


def clean_name(value: str) -> str:
    value = normalize_space(value)
    value = re.sub(r"^(Dr\.|Dra\.)\s*", r"\1 ", value)
    value = re.sub(r"\s+(Tratamientos|Instalaciones|Inicio|Conoce|Prevención|Endodoncia|Ortodoncia).*$", "", value)
    value = re.sub(r"^(Odont[oó]log[oa]\s+General|Dentista|Directora\s*[-–]\s*Dentista|Director\s*[-–])\s+", "", value)
    value = re.sub(r"\b(Dra|Dr)$", "", value).strip()

    title_match = re.match(r"^(Dr\.|Dra\.)\s+(.+)$", value)
    if title_match:
        title, rest = title_match.groups()
        words = rest.split()
        while words and words[-1].strip(".,;:") in TRAILING_PROFESSION_WORDS:
            words.pop()
        if not words or any(word.strip(".,;:") in NAME_STOPWORDS for word in words):
            STATS["candidatos_descartados_basura"] += 1
            return ""
        value = f"{title} {' '.join(words[:3])}"
    else:
        words = value.split()
        while words and words[-1].strip(".,;:") in TRAILING_PROFESSION_WORDS:
            words.pop()
        if words and any(word.strip(".,;:") in NAME_STOPWORDS for word in words):
            STATS["candidatos_descartados_basura"] += 1
            return ""
        value = " ".join(words[:4])

    blocked = {
        "Google Maps",
        "Google Places",
        "Política Privacidad",
        "Aviso Legal",
        "Protección Datos",
        "Valladolid Clínica",
        "Clínica Dental",
    }
    if value in blocked or is_blacklisted_name(value):
        STATS["candidatos_descartados_basura"] += 1
        return ""
    if len(value) > 80:
        STATS["candidatos_descartados_basura"] += 1
        return ""
    words = re.findall(NAME_WORD, re.sub(r"^(Dr\.|Dra\.)\s+", "", value))
    has_title = value.startswith(("Dr. ", "Dra. "))
    if not has_title and len(words) < 2:
        STATS["candidatos_descartados_basura"] += 1
        return ""
    return value


def source_priority(url: str) -> int:
    path = urllib.parse.urlparse(url).path.lower().strip("/")
    if path in ("quienes-somos", "sobre-nosotros", "nosotros"):
        return 4
    if path in ("equipo", "team"):
        return 3
    if path in ("", "/"):
        return 2
    return 1


def confidence_score(value: str) -> int:
    return {"Alta": 3, "Media": 2, "Baja": 1}.get(value, 0)


def candidate_rank(candidate: dict) -> tuple:
    return (
        confidence_score(candidate.get("confianza", "")),
        role_score(candidate.get("cargo", "")),
        source_priority(candidate.get("fuente", "")),
    )


def candidate_key(candidate: dict) -> tuple:
    return (canonical_name(candidate.get("nombre", "")),)


def add_candidate(candidates: list[dict], candidate: dict):
    name = clean_name(candidate.get("nombre", ""))
    if not name:
        return
    candidate["nombre"] = name
    key = candidate_key(candidate)
    for i, existing in enumerate(candidates):
        if candidate_key(existing) == key:
            if candidate_rank(candidate) > candidate_rank(existing):
                candidates[i] = candidate
            return
    candidates.append(candidate)


def cargo_for_medical_name(name: str, window: str) -> tuple[str, str]:
    name_pos = window.find(name)
    nearby_role_text = ""
    if name_pos >= 0 and not ACADEMIC_CONTEXT_RE.search(window):
        for match in DIRECTIVE_RE.finditer(window):
            if abs(match.start() - name_pos) <= 70:
                nearby_role_text = window[max(0, match.start() - 20): min(len(window), name_pos + len(name) + 40)]
                break
    role = role_from_text(nearby_role_text) if nearby_role_text else ""
    title_is_dra = name.startswith("Dra.")
    professional = "Odontóloga" if title_is_dra else "Odontólogo"
    if re.search(r"Directora?\s*[-–]\s*Dentista", nearby_role_text) or (
        "Dentista" in nearby_role_text and not re.search(r"[Oo]dont[oó]log", nearby_role_text)
    ):
        professional = "Dentista"

    if role in ("Directora", "Director"):
        return f"{role} / {professional}", "Alta"
    if role in ("Gerente", "Propietaria", "Propietario", "Titular", "CEO"):
        return f"{role} / {professional}", "Alta"
    return f"{professional} / posible responsable de la clínica", "Media"


def extract_candidates(text: str, source_url: str) -> list[dict]:
    candidates = []
    if not text:
        return candidates

    for name_match in MEDICAL_NAME_RE.finditer(text):
        name = clean_name(name_match.group("name"))
        if not name:
            continue
        window_start = max(0, name_match.start() - 180)
        window_end = min(len(text), name_match.end() + 180)
        window = text[window_start:window_end]
        cargo, confianza = cargo_for_medical_name(name, window)
        add_candidate(
            candidates,
            {
                "nombre": name,
                "cargo": cargo,
                "fuente": source_url,
                "confianza": confianza,
                "evidencia": short_fragment(text, window_start, window_end),
            },
        )

    for role_match in ROLE_RE.finditer(text):
        window_start = max(0, role_match.start() - 140)
        window_end = min(len(text), role_match.end() + 140)
        window = text[window_start:window_end]
        if ACADEMIC_CONTEXT_RE.search(window):
            continue
        role = role_from_text(window)
        if role in ("Doctor", "Doctora"):
            continue
        names = [clean_name(m.group(0)) for m in NAME_RE.finditer(window)]
        names = [name for name in names if name]
        for name in names[:3]:
            if name.startswith(("Dr. ", "Dra. ")):
                continue
            cargo, confianza = role, "Alta" if role_score(role) >= role_score("Titular") else "Baja"
            add_candidate(
                candidates,
                {
                    "nombre": name,
                    "cargo": cargo,
                    "fuente": source_url,
                    "confianza": confianza,
                    "evidencia": short_fragment(text, window_start, window_end),
                },
            )

    if TEAM_RE.search(text):
        for name_match in NAME_RE.finditer(text):
            name = clean_name(name_match.group(0))
            if not name:
                continue
            fragment = short_fragment(text, name_match.start(), name_match.end())
            if ACADEMIC_CONTEXT_RE.search(fragment) or not STAFF_ROLE_RE.search(fragment):
                continue
            add_candidate(
                candidates,
                {
                    "nombre": name,
                    "cargo": "",
                    "fuente": source_url,
                    "confianza": "Baja",
                    "evidencia": fragment,
                },
            )
            if len(candidates) >= 10:
                break

    return candidates[:10]


def role_score(role: str) -> int:
    order = [
        "Propietaria / Odontóloga",
        "Propietario / Odontólogo",
        "Gerente / Odontóloga",
        "Gerente / Odontólogo",
        "Directora / Odontóloga",
        "Directora / Dentista",
        "Director / Odontólogo",
        "Director / Dentista",
        "Propietaria",
        "Propietario",
        "Gerente",
        "Directora",
        "Director",
        "Fundadora",
        "Fundador",
        "CEO",
        "Titular",
        "Responsable",
        "Administrador",
        "Doctora",
        "Doctor",
    ]
    try:
        return len(order) - order.index(role)
    except ValueError:
        return 0


def choose_decisor(candidates: list[dict]) -> dict:
    high = [c for c in candidates if c.get("confianza") == "Alta" and c.get("cargo")]
    if high:
        return sorted(high, key=candidate_rank, reverse=True)[0]
    medium = [
        c
        for c in candidates
        if c.get("confianza") == "Media"
        and c.get("nombre", "").startswith(("Dr. ", "Dra. "))
        and source_priority(c.get("fuente", "")) >= 2
    ]
    if medium:
        return sorted(medium, key=candidate_rank, reverse=True)[0]
    return {}


def recommended_searches(lead: dict) -> list[str]:
    name = lead.get("nombre_empresa") or "nombre empresa"
    return [
        f'Google: "{name}" propietario',
        f'Google: "{name}" gerente',
        f'Google: "{name}" director Valladolid',
    ]


def guion_recepcion(lead: dict) -> str:
    nombre = (lead.get("decisor_nombre") or "").strip()
    sector = (lead.get("sector") or "").lower()
    if nombre:
        return f"Hola, buenos días. ¿Podría hablar un momento con {nombre}? Soy Javier, de EsarIA."
    if "clínica" in sector or "clinica" in sector or "dental" in sector or "fisioterapia" in sector:
        return "Hola, buenos días. ¿Podría hablar un momento con la persona que lleva la gestión de la clínica?"
    if "taller" in sector:
        return "Hola, buenos días. ¿Está el dueño o la persona que lleva el taller?"
    if "gimnasio" in sector or "crossfit" in sector:
        return "Hola, buenos días. ¿Podría hablar con la persona responsable del centro?"
    if "academia" in sector:
        return "Hola, buenos días. ¿Podría hablar con la persona que lleva la dirección de la academia?"
    if "comercio" in sector or "tienda" in sector:
        return "Hola, buenos días. ¿Está la persona que lleva la tienda?"
    return "Hola, buenos días. ¿Podría hablar con la persona responsable del negocio?"


def set_not_found(lead: dict, source: str):
    lead["decisor_nombre"] = ""
    lead["decisor_cargo"] = ""
    lead["confianza_decisor"] = "No encontrado"
    lead["fuente_decisor"] = source
    lead["evidencia_decisor"] = ""
    lead["candidatos_decisor"] = []


def enrich_lead(lead: dict) -> dict:
    web = lead.get("web") or ""
    if not web:
        set_not_found(lead, "No buscado automáticamente: lead sin web")
        lead["busquedas_recomendadas_decisor"] = recommended_searches(lead)
        lead["guion_recepcion_personalizado"] = guion_recepcion(lead)
        return lead

    candidates = []
    pages_checked = []
    for url in build_candidate_urls(web):
        time.sleep(REQUEST_DELAY_SECONDS)
        try:
            text = fetch_text(url)
        except (urllib.error.URLError, TimeoutError, ValueError):
            continue
        if not text:
            continue
        pages_checked.append(url)
        for candidate in extract_candidates(text, url):
            add_candidate(candidates, candidate)

    chosen = choose_decisor(candidates)
    if chosen:
        lead["decisor_nombre"] = chosen.get("nombre", "")
        lead["decisor_cargo"] = chosen.get("cargo", "")
        lead["confianza_decisor"] = chosen.get("confianza", "Media")
        lead["fuente_decisor"] = chosen.get("fuente", "")
        lead["evidencia_decisor"] = chosen.get("evidencia", "")
    else:
        lead["decisor_nombre"] = ""
        lead["decisor_cargo"] = ""
        lead["confianza_decisor"] = "Baja" if candidates else "No encontrado"
        lead["fuente_decisor"] = pages_checked[0] if pages_checked else "No encontrado en web oficial"
        lead["evidencia_decisor"] = candidates[0].get("evidencia", "") if candidates else ""

    lead["candidatos_decisor"] = candidates
    lead["busquedas_recomendadas_decisor"] = [] if pages_checked else recommended_searches(lead)
    lead["guion_recepcion_personalizado"] = guion_recepcion(lead)
    return lead


def summarize(leads: list[dict]) -> dict:
    summary = {"Alta": 0, "Media": 0, "Baja": 0, "No encontrado": 0}
    for lead in leads:
        key = lead.get("confianza_decisor") or "No encontrado"
        if key not in summary:
            key = "No encontrado"
        summary[key] += 1
    return summary


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else INPUT
    if not path.exists():
        print(f"[ERROR] No se encuentra: {path}")
        sys.exit(1)

    with open(path, encoding="utf-8") as f:
        leads = json.load(f)

    if not isinstance(leads, list):
        print("[ERROR] El archivo no contiene una lista de leads.")
        sys.exit(1)

    for i, lead in enumerate(leads):
        leads[i] = enrich_lead(lead)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    summary = summarize(leads)
    print("[OK] Enriquecimiento de decisores completado.")
    print(f"     Leads procesados : {len(leads)}")
    print(f"     Alta             : {summary['Alta']}")
    print(f"     Media            : {summary['Media']}")
    print(f"     Baja             : {summary['Baja']}")
    print(f"     No encontrado    : {summary['No encontrado']}")
    print(f"     Candidatos basura descartados : {STATS['candidatos_descartados_basura']}")
    print(f"     Guardado en      : {path}")


if __name__ == "__main__":
    main()
