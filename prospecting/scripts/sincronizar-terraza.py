#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEADS_JSON_PATH = ROOT / "leads" / "esaria-leads.json"
TERRAZA_HTML_PATH = ROOT / "sesion-llamadas-terraza.html"

def clean_phone(phone):
    return re.sub(r"\s+", "", str(phone or ""))

def build_whatsapp_msg(lead):
    name = lead.get("nombre_empresa", "")
    sector = lead.get("sector", "").lower()
    
    if "dental" in sector or "clínica dental" in sector:
        target = "clínicas dentales de Valladolid para reducir cancelaciones y liberar tiempo del equipo en la agenda"
    elif "fisioterapia" in sector or "fisio" in sector:
        target = "clínicas de fisioterapia de Valladolid para automatizar citas y recordatorios para dedicar más tiempo a los pacientes"
    elif "gimnasio" in sector or "gym" in sector or "fitness" in sector:
        target = "gimnasios de Valladolid para automatizar la gestión de altas, citas y comunicaciones con socios"
    elif "taller" in sector or "mecánico" in sector:
        target = "talleres mecánicos de Valladolid para avisar automáticamente del estado del coche a clientes y reducir interrupciones"
    else:
        target = "negocios locales de Valladolid para automatizar tareas prácticas del día a día y liberar tiempo"

    decisor = lead.get("decisor_nombre", "")
    greeting = f"Hola {decisor}" if decisor else "Hola responsable"
    
    return (
        f"{greeting}, soy Javier de EsarIA, acabo de llamarte.\n\n"
        f"Trabajamos con negocios como {name} para {target}.\n\n"
        f"¿Le viene bien esta semana 20 minutos para un diagnóstico gratuito? Sin compromiso.\n\n"
        f"Un saludo,\nJavier — EsarIA"
    )

def main():
    if not LEADS_JSON_PATH.exists():
        print(f"Error: No existe el archivo {LEADS_JSON_PATH}")
        return

    with open(LEADS_JSON_PATH, "r", encoding="utf-8") as f:
        raw_leads = json.load(f)

    processed_leads = []
    
    for lead in raw_leads:
        if not lead.get("telefono"):
            continue
            
        uid = lead.get("_uid", lead.get("id"))
        name = lead.get("nombre_empresa", "")
        sector = lead.get("sector", "")
        phone_display = lead.get("telefono", "")
        phone = clean_phone(phone_display)
        estado = lead.get("estado", "Nuevo")
        historial = lead.get("historial", [])
        
        # Determine lead type for the campaign
        # If it was called yesterday but not finalized, it's follow-up
        lead_type = "new"
        context = ""
        priority = "normal"
        
        # Analyze history to classify
        last_result = ""
        last_notes = ""
        if historial:
            last_event = historial[-1]
            last_result = last_event.get("resultado", "")
            last_notes = last_event.get("notas", last_event.get("notes", ""))

        # Customize ByM as high priority
        if "bym" in name.lower() or "blázquez y maidagan" in name.lower():
            priority = "high"

        # Classification rules:
        if estado == "Descartado":
            lead_type = "done"
            context = f"❌ Descartado. Razón: {last_result} - {last_notes}"
        elif estado == "Llamado":
            # If called, check outcome
            if last_result in ["No contesta", "Volver a llamar", "Ocupado"]:
                lead_type = "followup"
                if priority == "high":
                    context = f"⭐ MEJOR OPORTUNIDAD. Manu (responsable) receptivo. Nota de ayer: {last_notes}"
                else:
                    context = f"🔄 Reintentar. Historial de ayer: [{last_result}] {last_notes}"
            else:
                lead_type = "done"
                context = f"✅ Ya llamado ayer. Resultado: {last_result}. {last_notes}"
        else:
            # Nuevo
            lead_type = "new"
            decisor_name = lead.get("decisor_nombre", "")
            rating = lead.get("rating", "")
            resenas = lead.get("num_resenas", "")
            opt = lead.get("oportunidad_automatizacion", "")
            
            parts = []
            if decisor_name:
                parts.append(f"Decisor: {decisor_name}")
            if rating:
                parts.append(f"{rating}★ ({resenas} reseñas)")
            if opt:
                parts.append(opt)
            context = " · ".join(parts) if parts else "Lead nuevo listo para llamar."

        # Guion de recepción
        decisor_name = lead.get("decisor_nombre", "")
        if decisor_name:
            guion = f"Hola, buenos días. ¿Podría hablar un momento con {decisor_name}? Soy Javier, de EsarIA."
        else:
            guion = "Hola, buenos días. ¿Podría hablar con la persona que lleva la gestión del negocio? Soy Javier, de EsarIA."

        processed_leads.append({
            "id": uid,
            "name": name,
            "sector": sector,
            "phone": phone,
            "phoneDisplay": phone_display,
            "type": lead_type,
            "priority": priority,
            "context": context,
            "guionRecepcion": guion,
            "whatsappMsg": build_whatsapp_msg(lead)
        })

    # Sort leads so follow-up is first, then new ones
    # High priority first
    def sort_key(l):
        type_score = 0 if l["type"] == "followup" else (1 if l["type"] == "new" else 2)
        prio_score = 0 if l["priority"] == "high" else 1
        return (type_score, prio_score, l["name"])

    processed_leads.sort(key=sort_key)

    # Let's count how many are in each tab
    followup_count = sum(1 for l in processed_leads if l["type"] == "followup")
    new_count = sum(1 for l in processed_leads if l["type"] == "new")
    done_count = sum(1 for l in processed_leads if l["type"] == "done")
    
    print(f"Total leads procesados: {len(processed_leads)}")
    print(f"- Seguimientos: {followup_count}")
    print(f"- Nuevos: {new_count}")
    print(f"- Hechos/Descartados: {done_count}")

    # Now read HTML and replace the LEADS array
    if not TERRAZA_HTML_PATH.exists():
        print(f"Error: No existe {TERRAZA_HTML_PATH}")
        return

    html_content = TERRAZA_HTML_PATH.read_text(encoding="utf-8")

    # We need to replace:
    # const LEADS = [ ... ];
    # and update the badges in the HTML:
    # id="badgeFollowup">X</span>
    # id="badgeNew">Y</span>

    leads_js = json.dumps(processed_leads, ensure_ascii=False, indent=2)
    
    # Replace LEADS constant
    pattern = r"const LEADS = \[[\s\S]*?\];"
    html_content = re.sub(pattern, lambda m: f"const LEADS = {leads_js};", html_content)
    
    # Replace follow-up badge in template HTML
    html_content = re.sub(
        r'id="badgeFollowup">\d+</span>',
        f'id="badgeFollowup">{followup_count}</span>',
        html_content
    )
    # Replace new badge in template HTML
    html_content = re.sub(
        r'id="badgeNew">\d+</span>',
        f'id="badgeNew">{new_count}</span>',
        html_content
    )
    # Replace done badge in template HTML
    html_content = re.sub(
        r'id="badgeDone">\d+</span>',
        f'id="badgeDone">{done_count}</span>',
        html_content
    )

    TERRAZA_HTML_PATH.write_text(html_content, encoding="utf-8")
    print("¡sesion-llamadas-terraza.html actualizado con éxito!")

    # Sincronizar el archivo app/leads-campana.js para que el CRM de escritorio esté alineado
    payload = {
        "version": "sincronizado-esaria-leads",
        "nombre": "Campaña Sincronizada",
        "leads": raw_leads
    }
    leads_campana_path = ROOT / "app" / "leads-campana.js"
    leads_campana_path.write_text(
        "window.ESARIA_CAMPAIGN = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8"
    )
    print("¡app/leads-campana.js sincronizado con éxito!")

if __name__ == "__main__":
    main()
