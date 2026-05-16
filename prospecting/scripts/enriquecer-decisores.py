#!/usr/bin/env python3
"""
EsarIA — Enriquecer decisores desde webs oficiales.

Lee leads/reales/leads-reales.json y busca indicios del decisor solo en la
web publica del negocio. No usa login, redes sociales ni scraping agresivo.

Fuentes de datos (por orden de fiabilidad):
  1. JSON-LD / schema.org (datos estructurados)
  2. Meta tag <meta name="author">
  3. Análisis de texto plano (patrones de cargo + nombre)
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
MAX_PAGES_PER_DOMAIN = 12
REQUEST_DELAY_SECONDS = 0.5
MAX_DISCOVERED_LINKS = 8

WEAK_PLATFORM_DOMAINS = (
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "linktr.ee",
    "wodbuster.com",
    "google.com",
    "maps.google",
)

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
    # Rutas adicionales comunes en pymes españolas
    "/quien-soy",
    "/sobre-mi",
    "/la-empresa",
    "/empresa",
    "/nuestro-equipo",
    "/nuestro-centro",
    "/el-centro",
    "/staff",
    "/profesionales",
    "/gerencia",
    "/direccion",
    "/conocenos",
    "/conocenos/",
    "/personas",
    "/personas/",
    "/profesorado",
    "/profesorado/",
    "/monitores",
    "/monitores/",
    "/entrenadores",
    "/entrenadores/",
]

DISCOVERY_LINK_KEYWORDS = (
    "quienes", "nosotros", "sobre", "equipo", "staff", "profesional",
    "direccion", "gerencia", "conocenos", "clinica", "centro", "empresa",
    "profesor", "monitor", "entrenador", "fisioterapeuta", "optico",
)

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
    ("Dirección médica", r"\b[Dd]irecci[oó]n\s+m[eé]dica\b"),
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
    r"\b[Dd]irecci[oó]n\s+m[eé]dica\b|\b[Dd]irectora?\b|\b[Gg]erente\b|\b[Pp]ropietaria?o?\b|\b[Tt]itular\b|\bCEO\b"
)
STAFF_ROLE_RE = re.compile(
    r"\b[Dd]entista\b|\b[Oo]dont[oó]log[oa]\b|\b[Hh]igienista\b|\b[Aa]uxiliar\b|"
    r"\b[Oo]rtodoncista\b|\b[Ii]mplant[oó]log[oa]\b|\b[Ee]ndodoncista\b|\b[Pp]eriodoncista\b|"
    r"\b[Ff]isioterapeuta\b|\b[Oo]ste[oó]pata\b|\b[Ff]isio\b|\b[Ee]ntrenador(?:a)?\b|"
    r"\b[Mm]ec[aá]nico\b|\b[Pp]rofesor(?:a)?\b|\b[Tt]erapeuta\b|\b[Pp]sicologo\b|\b[Pp]sic[oó]logo\b|"
    r"\b[Oo]ptico\b|\b[Óó]ptico\b|\b[Pp]eluquer[oa]\b|\b[Ee]steticista\b|\b[Ee]nfermero\b"
)

STAFF_ROLE_NAME_RE = re.compile(
    r"(?P<role>[Ff]isioterapeuta|[Oo]ste[oó]pata|[Dd]entista|[Oo]dont[oó]log[oa]|"
    r"[Ee]ntrenador[a]?|[Mm]ec[aá]nico|[Pp]rofesor[a]?|[Tt]erapeuta|[Óó]ptico|"
    r"[Pp]eluquer[oa]|[Ee]steticista)"
)
ACADEMIC_CONTEXT_RE = re.compile(
    r"\b[Cc]olegio Oficial\b|\b[Uu]niversidad\b|\b[Ff]acultad\b|\b[Pp]osgrado\b|"
    r"\b[Mm][aá]ster\b|\b[Ff]ormaci[oó]n\b|\b[Cc]urso\b|\b[Cc]olegiad[oa]\b|"
    r"\b[Cc]entros? de radiodiagn[oó]stico\b"
)

# Palabras que si aparecen como PRIMERA PALABRA de un candidato indican que no es un nombre
NOT_FIRST_NAME = {
    "Método", "Metodo", "Técnica", "Tecnica", "Programa", "Tratamiento",
    "Terapia", "Readaptación", "Readaptacion", "Prevención", "Prevencion",
    "Rehabilitación", "Rehabilitacion", "Especialista", "Especialidad",
    "Entrenamiento", "Pilates", "Yoga", "Fisioterapia", "Centro",
    "Servicio", "Atención", "Atencion", "Gestión", "Gestion",
    "Patología", "Patologia", "Lesión", "Lesiones", "Dolor",
    "Columna", "Hombro", "Rodilla", "Cadera", "Espalda",
    "Nuestro", "Nuestra", "Nuestros", "Nuestras",
    "Todos", "Todas", "Cada", "Cualquier",
}

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
    "Acceso Grado Medio",
    "Grado Superior",
    "Superior Idiomas",
    "Idiomas Clases",
    "León Oferta",
    "Leon Oferta",
    "Estado Administrativo",
    "Servicio de Salud Castilla",
    "Junta Castilla",
    "Auxiliar Administrativo",
    "Administrativo del Estado",
    "Promoción Interna",
    "Promocion Interna",
    "Oferta 2020",
    "Oferta 2021",
    "Oferta 2022",
    "Convocatoria",
    "Temario",
    "Oposiciones",
    "EVAU",
    "UNED",
    "IGCSE",
    "A-LEVEL",
    "Planes de estudio",
    "Universidad",
    "Fuente Llevamos",
)

GENERIC_NAME_TOKENS = {
    "Acceso", "Grado", "Medio", "Superior", "Idiomas", "Clases", "Oferta",
    "Estado", "Administrativo", "Administrativa", "Administración", "Administracion",
    "Servicio", "Salud", "Castilla", "León", "Leon", "Junta", "Auxiliar",
    "Promoción", "Promocion", "Interna", "Convocatoria", "Plazas", "Información",
    "Informacion", "Temario", "Oposición", "Oposicion", "Oposiciones", "Curso",
    "Cursos", "Academia", "Universidad", "Graduado", "Bachillerato", "ESO",
    "EVAU", "UNED", "IGCSE", "A-LEVEL", "Planes", "Estudio", "Estudios",
    "Fuente", "Llevamos", "Pide", "Cita", "Más", "Mas", "Información",
    "Inicio", "Equipo", "Nuestro", "Nuestros", "Nuestra", "Nuestras", "Conoce",
    "Visitar", "Profesionalidad", "Médico", "Medico", "Las", "Los", "Una", "Un",
    "Sanitario", "Registro", "Legal", "Privacidad", "Cookies", "Blog", "Home",
    "Fray", "VIII", "Osteopatía", "Osteopatia", "Optica", "Óptica",
}

SPANISH_FIRST_NAMES = {
    "aaron", "abel", "adrian", "agustin", "aitor", "alba", "alberto", "alejandro",
    "alejandra", "alex", "alfonso", "alicia", "almudena", "alvaro", "ana", "andrea",
    "andres", "angel", "angela", "antonio", "arantxa", "beatriz", "belen", "blanca",
    "borja", "carmen", "carolina", "carlos", "catalina", "cesar", "clara", "claudia",
    "cristina", "daniel", "david", "diego", "eduardo", "elena", "elisa", "elvira",
    "emilio", "enrique", "eva", "fernando", "francisco", "gabriel", "gema", "gonzalo",
    "guillermo", "hector", "ines", "irene", "isabel", "ivan", "javier", "jesus",
    "joaquin", "jorge", "jose", "juan", "julia", "laura", "lucia", "luis", "luisa",
    "manuel", "maria", "marina", "marta", "martin", "miguel", "monica", "natalia",
    "noelia", "nuria", "oscar", "pablo", "patricia", "paula", "pedro", "pilar",
    "raquel", "raul", "ricardo", "roberto", "rocio", "rosa", "ruben", "sandra",
    "sara", "sergio", "sofia", "susana", "teresa", "victor", "virginia",
}

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
    "Personal",
    "Profesional",
    "Especializado",
    "Cualificado",
    # Profesiones sectoriales
    "Fisioterapeuta",
    "Fisioterapeutas",
    "Osteópata",
    "Osteopata",
    "Mecánico",
    "Mecanico",
    "Entrenador",
    "Entrenadora",
    "Instructor",
    "Instructora",
    "Terapeuta",
    "Terapeuta",
    "Óptico",
    "Optico",
    "Peluquero",
    "Peluquera",
    "Esteticista",
    "Enfermero",
    "Enfermera",
    "Colaborador",
    "Colaboradora",
    "Coordinador",
    "Coordinadora",
    "Dirección",
    "Direccion",
    "Gerencia",
    "Director",
    "Directora",
    "Responsable",
    "Titular",
}

STATS = {"candidatos_descartados_basura": 0}


# ---------------------------------------------------------------------------
# Parser HTML: texto plano + JSON-LD + meta author
# ---------------------------------------------------------------------------

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = False
        self.capture_jsonld = False
        self.parts = []
        self.jsonld_blocks = []
        self.meta_author = ""
        self.links = []
        self._current_jsonld = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "script":
            stype = attrs_dict.get("type", "")
            if stype == "application/ld+json":
                self.capture_jsonld = True
                self._current_jsonld = []
            else:
                self.skip = True
        elif tag in ("style", "noscript", "svg"):
            self.skip = True
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            if name == "author":
                content = attrs_dict.get("content", "").strip()
                if content and not self.meta_author:
                    self.meta_author = content
        elif tag == "a":
            href = attrs_dict.get("href", "").strip()
            if href:
                self.links.append(href)

    def handle_endtag(self, tag):
        if tag == "script":
            if self.capture_jsonld:
                self.jsonld_blocks.append("".join(self._current_jsonld))
                self._current_jsonld = []
                self.capture_jsonld = False
            self.skip = False
        elif tag in ("style", "noscript", "svg"):
            self.skip = False

    def handle_data(self, data):
        if self.capture_jsonld:
            self._current_jsonld.append(data)
        elif not self.skip:
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


def is_weak_platform_url(raw: str) -> bool:
    normalized = normalize_web(raw)
    if not normalized:
        return False
    netloc = urllib.parse.urlparse(normalized).netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]
    return any(netloc == domain or netloc.endswith("." + domain) for domain in WEAK_PLATFORM_DOMAINS)


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
    if is_safe_candidate(normalized, parsed.netloc):
        urls.append(normalized)
    for path in CANDIDATE_PATHS:
        url = urllib.parse.urljoin(root, path)
        if is_safe_candidate(url, parsed.netloc) and url not in urls:
            urls.append(url)
    return urls[:MAX_PAGES_PER_DOMAIN]


def discover_candidate_links(base_url: str, links: list[str], existing: list[str]) -> list[str]:
    normalized = normalize_web(base_url)
    if not normalized:
        return []
    parsed = urllib.parse.urlparse(normalized)
    discovered = []
    for href in links:
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        absolute = normalize_web(urllib.parse.urljoin(normalized, href))
        if not absolute or absolute in existing or absolute in discovered:
            continue
        if not is_safe_candidate(absolute, parsed.netloc):
            continue
        path = urllib.parse.urlparse(absolute).path.lower()
        compact = path.replace("-", "").replace("_", "")
        if any(keyword in path or keyword in compact for keyword in DISCOVERY_LINK_KEYWORDS):
            discovered.append(absolute)
        if len(discovered) >= MAX_DISCOVERED_LINKS:
            break
    return discovered


def fetch_text(url: str) -> tuple[str, list[str], str, list[str]]:
    """Devuelve (texto_plano, bloques_jsonld, meta_author, links)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        content_type = resp.headers.get("content-type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            return "", [], "", []
        raw = resp.read(800_000).decode(
            resp.headers.get_content_charset() or "utf-8", errors="ignore"
        )
    parser = TextExtractor()
    parser.feed(raw)
    return normalize_space(parser.text()), parser.jsonld_blocks, parser.meta_author, parser.links


# ---------------------------------------------------------------------------
# Extracción de personas desde JSON-LD / schema.org
# ---------------------------------------------------------------------------

def extract_jsonld_persons(jsonld_blocks: list[str], source_url: str) -> list[dict]:
    candidates = []
    for block in jsonld_blocks:
        try:
            data = json.loads(block)
        except (json.JSONDecodeError, ValueError):
            continue
        if isinstance(data, dict):
            _jsonld_visit(data, source_url, candidates)
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    _jsonld_visit(item, source_url, candidates)
    return candidates


def _jsonld_visit(item: dict, source_url: str, candidates: list):
    item_type = item.get("@type", "")
    if isinstance(item_type, list):
        item_type_str = " ".join(item_type)
    else:
        item_type_str = str(item_type)

    if "Person" in item_type_str:
        raw_name = item.get("name", "")
        job_title = (item.get("jobTitle") or item.get("description") or "").strip()
        if raw_name:
            clean = clean_name(raw_name)
            if clean:
                role = role_from_text(job_title)
                confianza = "Alta" if role else "Media"
                add_candidate(candidates, {
                    "nombre": clean,
                    "cargo": job_title or role or "Responsable del negocio",
                    "fuente": source_url,
                    "confianza": confianza,
                    "evidencia": f"JSON-LD: {raw_name} — {job_title}"[:260],
                })

    for prop in ("founder", "member", "employee", "contactPoint", "author"):
        value = item.get(prop)
        if isinstance(value, dict):
            _jsonld_visit(value, source_url, candidates)
        elif isinstance(value, list):
            for v in value:
                if isinstance(v, dict):
                    _jsonld_visit(v, source_url, candidates)

    for node in item.get("@graph", []):
        if isinstance(node, dict):
            _jsonld_visit(node, source_url, candidates)


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

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


def strip_accents(value: str) -> str:
    table = str.maketrans("áéíóúüñÁÉÍÓÚÜÑ", "aeiouunAEIOUUN")
    return value.translate(table)


def has_plausible_first_name(value: str) -> bool:
    value = re.sub(r"^(Dr\.|Dra\.)\s+", "", normalize_space(value))
    words = [strip_accents(w).lower() for w in re.findall(NAME_WORD, value)]
    return any(word in SPANISH_FIRST_NAMES for word in words)


def looks_like_generic_sequence(value: str) -> bool:
    words = [w.strip(".,;:()[]") for w in normalize_space(value).split()]
    if not words:
        return True
    generic_count = sum(1 for word in words if word in GENERIC_NAME_TOKENS)
    if generic_count:
        return True
    if len(words) >= 3 and not has_plausible_first_name(value):
        return True
    return False


def canonical_name(value: str) -> str:
    value = normalize_space(value)
    value = re.sub(r"^(Dr\.|Dra\.)\s+", "", value)
    return value.lower()


def clean_name(value: str) -> str:
    value = normalize_space(value)
    value = re.sub(r"^(Dr\.|Dra\.)\s*", r"\1 ", value)
    value = re.sub(
        r"\s+(Tratamientos|Instalaciones|Inicio|Conoce|Prevención|Endodoncia|Ortodoncia).*$",
        "",
        value,
    )
    value = re.sub(
        r"^(Odont[oó]log[oa]\s+General|Dentista|Directora\s*[-–]\s*Dentista|Director\s*[-–])\s+",
        "",
        value,
    )
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
        if len(words) % 2 == 0:
            half = len(words) // 2
            if [strip_accents(w).lower() for w in words[:half]] == [strip_accents(w).lower() for w in words[half:]]:
                words = words[:half]
        # Rechazar si la primera palabra es claramente un servicio o técnica
        if words and words[0].strip(".,;:") in NOT_FIRST_NAME:
            STATS["candidatos_descartados_basura"] += 1
            return ""
        while words and words[-1].strip(".,;:") in TRAILING_PROFESSION_WORDS:
            words.pop()
        # Filtrar stopwords en lugar de descartar todo el candidato
        clean_words = [w for w in words if w.strip(".,;:") not in NAME_STOPWORDS]
        if len(clean_words) < 2:
            STATS["candidatos_descartados_basura"] += 1
            return ""
        value = " ".join(clean_words[:4])

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
    if looks_like_generic_sequence(value):
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
    if not has_title and not has_plausible_first_name(value):
        STATS["candidatos_descartados_basura"] += 1
        return ""
    return value


def closest_names_to_role(window: str, role_start: int, role_end: int) -> list[str]:
    matches = list(NAME_RE.finditer(window))
    ranked = []
    for match in matches:
        raw = match.group(0)
        name = clean_name(raw)
        if not name or name.startswith(("Dr. ", "Dra. ")):
            continue
        if match.end() <= role_start:
            distance = role_start - match.end()
        elif match.start() >= role_end:
            distance = match.start() - role_end
        else:
            distance = 0
        if distance <= 80:
            ranked.append((distance, name))
    result = []
    for _, name in sorted(ranked, key=lambda item: item[0]):
        if canonical_name(name) not in {canonical_name(existing) for existing in result}:
            result.append(name)
        if len(result) >= 2:
            break
    return result


def source_priority(url: str) -> int:
    path = urllib.parse.urlparse(url).path.lower().strip("/")
    if path in ("quienes-somos", "sobre-nosotros", "nosotros", "sobre-mi", "quien-soy"):
        return 4
    if path in ("equipo", "team", "nuestro-equipo", "staff", "profesionales"):
        return 3
    if path in ("", "/", "la-empresa", "empresa", "el-centro", "nuestro-centro"):
        return 2
    return 1


def confidence_score(value: str) -> int:
    return {"Alta": 3, "Media": 2, "Baja": 1}.get(value, 0)


def role_score(role: str) -> int:
    order = [
        "Propietaria / Odontóloga",
        "Propietario / Odontólogo",
        "Dirección médica / Odontólogo",
        "Dirección médica / Odontóloga",
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
        "Dirección médica",
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


# ---------------------------------------------------------------------------
# Extracción desde texto plano
# ---------------------------------------------------------------------------

def cargo_for_medical_name(name: str, window: str) -> tuple[str, str]:
    name_pos = window.find(name)
    nearby_role_text = ""
    if name_pos >= 0 and not ACADEMIC_CONTEXT_RE.search(window):
        for match in DIRECTIVE_RE.finditer(window):
            if abs(match.start() - name_pos) <= 70:
                nearby_role_text = window[
                    max(0, match.start() - 20): min(len(window), name_pos + len(name) + 40)
                ]
                break
    role = role_from_text(nearby_role_text) if nearby_role_text else ""
    title_is_dra = name.startswith("Dra.")
    professional = "Odontóloga" if title_is_dra else "Odontólogo"
    if re.search(r"Directora?\s*[-–]\s*Dentista", nearby_role_text) or (
        "Dentista" in nearby_role_text and not re.search(r"[Oo]dont[oó]log", nearby_role_text)
    ):
        professional = "Dentista"

    if role == "Dirección médica":
        return f"{role} / {professional}", "Alta"
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
        role = role_from_text(role_match.group(0)) or role_from_text(window)
        if role in ("Doctor", "Doctora"):
            continue
        relative_start = role_match.start() - window_start
        relative_end = role_match.end() - window_start
        for name in closest_names_to_role(window, relative_start, relative_end):
            # Confianza escalonada según importancia del cargo
            if role_score(role) >= role_score("Titular"):
                confianza = "Alta"
            elif role in ("Responsable", "Administrador"):
                confianza = "Media"
            else:
                confianza = "Baja"
            add_candidate(
                candidates,
                {
                    "nombre": name,
                    "cargo": role,
                    "fuente": source_url,
                    "confianza": confianza,
                    "evidencia": short_fragment(text, window_start, window_end),
                },
            )

    # Búsqueda rol-primero: encuentra nombre JUSTO ANTES del rol profesional.
    # Ventana corta (50 chars) para evitar que servicios/técnicas se confundan con nombres.
    for prof_match in STAFF_ROLE_RE.finditer(text):
        window_start = max(0, prof_match.start() - 50)
        window = text[window_start:prof_match.start()]
        if ACADEMIC_CONTEXT_RE.search(window):
            continue
        name_matches = list(NAME_RE.finditer(window))
        if not name_matches:
            continue
        closest = name_matches[-1]  # el nombre más cercano al rol
        name = clean_name(closest.group(0))
        if not name:
            continue
        role_text = prof_match.group(0).capitalize()
        fragment = short_fragment(text, max(0, closest.start() - 20), prof_match.end() + 40)
        add_candidate(
            candidates,
            {
                "nombre": name,
                "cargo": role_text,
                "fuente": source_url,
                "confianza": "Baja",
                "evidencia": fragment,
            },
        )
        if len(candidates) >= 10:
            break

    return candidates[:10]


# ---------------------------------------------------------------------------
# Selección del decisor
# ---------------------------------------------------------------------------

def choose_decisor(candidates: list[dict]) -> dict:
    # Alta confianza con cargo definido
    high = [c for c in candidates if c.get("confianza") == "Alta" and c.get("cargo")]
    if high:
        return sorted(high, key=candidate_rank, reverse=True)[0]
    # Alta confianza sin cargo
    high_any = [c for c in candidates if c.get("confianza") == "Alta"]
    if high_any:
        return sorted(high_any, key=candidate_rank, reverse=True)[0]
    # Media confianza
    medium = [c for c in candidates if c.get("confianza") == "Media"]
    if medium:
        return sorted(medium, key=candidate_rank, reverse=True)[0]
    # No elegir candidatos de baja confianza desde web: nombre fiable o nada.
    return {}


# ---------------------------------------------------------------------------
# Guion y búsquedas recomendadas
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Enriquecimiento de un lead
# ---------------------------------------------------------------------------

SECTOR_KEYWORDS_RE = re.compile(
    r"\b([Ff]isioterapia|[Ff]isioterapeuta|[Cc]l[íi]nica|[Dd]ental|[Cc]entro|"
    r"[Oo]steopat[íi]a|[Tt]aller|[Tt]alleres|[Gg]imnasio|[Aa]cademia|[Óó]ptica|[Oo]ptica|[Ee]st[eé]tica|"
    r"[Pp]eluquer[íi]a|[Cc]onsultorio|[Gg]abinete|[Cc]lube?)\b",
    re.IGNORECASE,
)


def extract_name_from_business(nombre_empresa: str) -> str:
    """Intenta extraer el nombre del propietario del nombre comercial.

    'Fisioterapia Juan Pablo Díaz' → 'Juan Pablo Díaz'
    'Clínica Dental García' → 'García' (solo 1 palabra → descartado)
    """
    for paren in re.findall(r"\(([^()]+)\)", nombre_empresa or ""):
        result = clean_name(paren)
        if result:
            return result

    cleaned = SECTOR_KEYWORDS_RE.sub("", nombre_empresa)
    cleaned = re.sub(r"\b[A-ZÁÉÍÓÚÑ]\.?\s*[A-ZÁÉÍÓÚÑ]\.?(?=\s+[A-ZÁÉÍÓÚÑ])", "", cleaned)
    cleaned = re.sub(r"[|&,;()\[\]]+", " ", cleaned)
    cleaned = normalize_space(cleaned)
    names = [m.group(0) for m in NAME_RE.finditer(cleaned)]
    for name in names:
        result = clean_name(name)
        if result:
            return result
    return ""


def set_not_found(lead: dict, source: str):
    lead["decisor_nombre"] = ""
    lead["decisor_cargo"] = ""
    lead["confianza_decisor"] = "No encontrado"
    lead["fuente_decisor"] = source
    lead["evidencia_decisor"] = ""
    lead["candidatos_decisor"] = []


def apply_business_name_fallback(lead: dict) -> bool:
    nombre_negocio = lead.get("nombre_empresa", "")
    nombre_extraido = extract_name_from_business(nombre_negocio) if nombre_negocio else ""
    if not nombre_extraido:
        return False
    candidate = {
        "nombre": nombre_extraido,
        "cargo": "Posible propietario (nombre del negocio)",
        "fuente": f"Nombre del negocio: {nombre_negocio}",
        "confianza": "Baja",
        "evidencia": "Nombre extraído de la denominación comercial",
    }
    lead["decisor_nombre"] = candidate["nombre"]
    lead["decisor_cargo"] = candidate["cargo"]
    lead["confianza_decisor"] = candidate["confianza"]
    lead["fuente_decisor"] = candidate["fuente"]
    lead["evidencia_decisor"] = candidate["evidencia"]
    lead["candidatos_decisor"] = [candidate]
    return True


def enrich_lead(lead: dict) -> dict:
    web = lead.get("web") or ""
    if not web:
        if not apply_business_name_fallback(lead):
            set_not_found(lead, "No buscado automáticamente: lead sin web y sin nombre de persona claro en el negocio")
        lead["busquedas_recomendadas_decisor"] = recommended_searches(lead)
        lead["guion_recepcion_personalizado"] = guion_recepcion(lead)
        return lead

    if is_weak_platform_url(web):
        if not apply_business_name_fallback(lead):
            set_not_found(lead, "No buscado automáticamente: fuente no oficial o plataforma con login")
        lead["busquedas_recomendadas_decisor"] = recommended_searches(lead)
        lead["guion_recepcion_personalizado"] = guion_recepcion(lead)
        return lead

    candidates = []
    pages_checked = []
    urls_to_check = build_candidate_urls(web)
    checked_set = set()
    index = 0
    while index < len(urls_to_check) and len(checked_set) < MAX_PAGES_PER_DOMAIN:
        url = urls_to_check[index]
        index += 1
        if url in checked_set:
            continue
        checked_set.add(url)
        time.sleep(REQUEST_DELAY_SECONDS)
        try:
            text, jsonld_blocks, meta_author, links = fetch_text(url)
        except (urllib.error.URLError, TimeoutError, ValueError):
            continue
        if not text and not jsonld_blocks and not meta_author:
            continue
        pages_checked.append(url)

        for discovered_url in discover_candidate_links(url, links, urls_to_check):
            if discovered_url not in urls_to_check:
                urls_to_check.append(discovered_url)

        # 1. JSON-LD estructurado (más fiable)
        for c in extract_jsonld_persons(jsonld_blocks, url):
            add_candidate(candidates, c)

        # 2. Meta author
        if meta_author:
            author_clean = clean_name(meta_author)
            if author_clean:
                add_candidate(candidates, {
                    "nombre": author_clean,
                    "cargo": "Responsable del negocio",
                    "fuente": url,
                    "confianza": "Media",
                    "evidencia": f"Meta author: {meta_author}",
                })

        # 3. Análisis de texto plano
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
        if not apply_business_name_fallback(lead):
            lead["decisor_nombre"] = ""
            lead["decisor_cargo"] = ""
            lead["confianza_decisor"] = "No encontrado"
            lead["fuente_decisor"] = (
                "Sin evidencia suficiente en web oficial" if pages_checked else "No encontrado en web oficial"
            )
            lead["evidencia_decisor"] = "Candidatos descartados por baja confianza o por parecer contenido genérico"

    if lead.get("confianza_decisor") != "Baja":
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
        nombre = lead.get("nombre_empresa", f"lead {i+1}")
        print(f"  [{i+1}/{len(leads)}] {nombre}...")
        leads[i] = enrich_lead(lead)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    summary = summarize(leads)
    print()
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
