#!/usr/bin/env python3
"""
Batch-update frontmatter of the 25 non-AlcoLab PT blog posts:
  1. Normalize `keyword` -> `focusKeyword`
  2. Force the default image (methanol bottles) and a consistent imageAlt
  3. Ensure each post has a focus keyword pulled from the keyword research
  4. Keep status=rascunho, published=false, do not change anything else

The 6 AlcoLab-reserved posts are skipped by design; Diego revises them himself.
"""

import re
import sys
from pathlib import Path

# AlcoLab-reserved slugs (do NOT touch)
ALCOLAB_RESERVED = {
    "alcolab-acessos-internacionais-ferramenta-brasileira-triagem-metanol",
    "alcolab-open-source-escolha-salvar-vidas-agora",
    "alcolab-vs-alternativas-como-testar-metanol-sem-laboratorio",
    "ciencia-por-tras-alcolab-densidade-viscosidade-metanol",
    "como-usar-alcolab-passo-a-passo-triagem-metanol",
    "pesquisadores-brasileiros-criam-app-gratuito-detecta-metanol",
}

# SEO focus keyword per blog slug, derived from the Google Brazil keyword research
FOCUS_KEYWORDS = {
    "alcool-falsificado-viagem-como-se-proteger-destinos-turisticos": "álcool falsificado em viagem",
    "alerta-britanico-metanol-29-paises-lista-risco-fcdo": "alerta de metanol FCDO",
    "arak-metanol-bali-indonesia-o-que-turistas-precisam-saber": "arak metanol Bali",
    "bebida-adulterada-como-se-proteger-onde-denunciar": "bebida adulterada",
    "cachaca-artesanal-controle-qualidade-riscos-metanol": "metanol em cachaça artesanal",
    "cegueira-por-metanol-por-que-intoxicacao-afeta-visao": "cegueira por metanol",
    "como-governos-combatem-metanol-politicas-publicas-regulacao": "políticas públicas metanol",
    "como-identificar-metanol-em-bebida": "como identificar metanol em bebida",
    "como-saber-se-bebida-falsificada-sinais-adulteracao": "como saber se a bebida é falsificada",
    "crise-metanol-brasil-2025-o-que-aconteceu": "crise do metanol Brasil 2025",
    "diferenca-metanol-etanol-tudo-que-voce-precisa-saber": "diferença entre metanol e etanol",
    "fomepizol-antidoto-intoxicacao-metanol-como-funciona": "fomepizol antídoto metanol",
    "hemodialise-tratamento-intoxicacao-metanol-como-hospitais-salvam-vidas": "hemodiálise intoxicação metanol",
    "hooch-india-alcool-ilegal-tragedias-metanol": "hooch metanol Índia",
    "intoxicacao-metanol-no-mundo-crise-saude-publica-185-paises": "intoxicação por metanol no mundo",
    "intoxicacao-metanol-turquia-2025-raki-adulterado": "metanol raki Turquia",
    "maior-surto-metanol-historia-ira-2020-covid-desinformacao": "surto de metanol Irã 2020",
    "metanol-coca-cola-cafe-agua-fake-news-desmentidas": "metanol Coca-Cola fake news",
    "metanol-russia-irkutsk-2016-nova-lei-rastreio-2025": "metanol Rússia Irkutsk",
    "mortes-metanol-laos-vang-vieng-alerta-viajantes": "metanol Laos Vang Vieng",
    "o-que-e-metanol-por-que-perigoso-bebidas": "o que é metanol",
    "por-que-alcool-ilegal-mata-economia-adulteracao-metanol": "álcool ilegal adulteração",
    "quanto-metanol-pode-matar-doses-letais-riscos": "quanto metanol pode matar",
    "sintomas-intoxicacao-metanol-como-reconhecer-sinais": "sintomas de intoxicação por metanol",
    "vigilancia-sanitaria-metanol-desafios-fiscalizacao-brasil": "vigilância sanitária metanol",
}

DEFAULT_IMAGE = "/images/blog/default.jpg"
DEFAULT_IMAGE_ALT = (
    "Três garrafas de vidro com uma central rotulada METANOL e pictogramas "
    "GHS de periculosidade, ilustrando o risco da adulteração de bebidas"
)


def split_frontmatter(text: str):
    """Returns (frontmatter_lines, body) where frontmatter_lines is a list of
    the YAML lines between the two '---' fences, and body is the markdown after.
    Raises if the file has no frontmatter."""
    if not text.startswith("---"):
        raise ValueError("missing opening ---")
    # Find the second '---' on its own line
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not m:
        raise ValueError("missing closing ---")
    fm_text = m.group(1)
    body = text[m.end():]
    return fm_text.splitlines(), body


def serialize_frontmatter(fm_lines):
    return "---\n" + "\n".join(fm_lines) + "\n---\n"


def update_field(fm_lines, key, value, quote=True):
    """Set or append a scalar frontmatter field. Preserves existing order when
    possible. Value is YAML-escaped with double quotes if quote=True."""
    new_value = f'"{value}"' if quote else value
    pattern = re.compile(rf"^{re.escape(key)}\s*:\s*.*$")
    for i, line in enumerate(fm_lines):
        if pattern.match(line):
            fm_lines[i] = f"{key}: {new_value}"
            return fm_lines
    fm_lines.append(f"{key}: {new_value}")
    return fm_lines


def remove_field(fm_lines, key):
    pattern = re.compile(rf"^{re.escape(key)}\s*:\s*.*$")
    return [l for l in fm_lines if not pattern.match(l)]


def get_field(fm_lines, key):
    pattern = re.compile(rf"^{re.escape(key)}\s*:\s*(.*)$")
    for line in fm_lines:
        m = pattern.match(line)
        if m:
            val = m.group(1).strip()
            # Strip surrounding quotes
            if (val.startswith('"') and val.endswith('"')) or (
                val.startswith("'") and val.endswith("'")
            ):
                val = val[1:-1]
            return val
    return None


def process_file(path: Path) -> bool:
    slug = path.stem
    if slug in ALCOLAB_RESERVED:
        print(f"SKIP (AlcoLab reserved): {slug}")
        return False
    if slug not in FOCUS_KEYWORDS:
        print(f"WARN: no focus keyword mapping for {slug} — skipping")
        return False

    text = path.read_text(encoding="utf-8")
    try:
        fm_lines, body = split_frontmatter(text)
    except ValueError as e:
        print(f"ERROR {slug}: {e}")
        return False

    # Migrate `keyword:` → `focusKeyword:` if present
    legacy_keyword = get_field(fm_lines, "keyword")
    if legacy_keyword is not None:
        fm_lines = remove_field(fm_lines, "keyword")

    # Force default image + alt
    fm_lines = update_field(fm_lines, "image", DEFAULT_IMAGE)
    fm_lines = update_field(fm_lines, "imageAlt", DEFAULT_IMAGE_ALT)

    # Set focusKeyword (the mapped value always wins over legacy)
    fm_lines = update_field(fm_lines, "focusKeyword", FOCUS_KEYWORDS[slug])

    # Ensure rascunho + not published (user asked nothing should go live yet)
    fm_lines = update_field(fm_lines, "status", "rascunho")
    fm_lines = update_field(fm_lines, "published", "false", quote=False)

    new_text = serialize_frontmatter(fm_lines) + body
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"UPDATED: {slug}")
        return True
    else:
        print(f"noop: {slug}")
        return False


def main():
    root = Path(__file__).resolve().parent.parent / "content" / "blog" / "pt"
    files = sorted(root.glob("*.md"))
    updated = 0
    for f in files:
        if process_file(f):
            updated += 1
    print(f"\nTotal updated: {updated}/{len(files)}")


if __name__ == "__main__":
    main()
