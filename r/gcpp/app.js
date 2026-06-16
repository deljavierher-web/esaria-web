/* Repaso GCPP — app de estudio móvil · EsarIA (privado) */
'use strict';

/* ============================ DATOS ============================ */

// --- FLASHCARDS ---
const CARDS = [
  {cat:'Calidad', q:'¿Qué es la normalización?', a:'Proceso de elaborar y publicar normas técnicas (UNE, EN, ISO) para que productos, servicios y procesos sean compatibles, seguros e intercambiables. La elaboran organismos como ISO, CEN o AENOR.'},
  {cat:'Calidad', q:'¿Qué es la certificación?', a:'Proceso por el que un organismo independiente (tercera parte, acreditado por ENAC) verifica mediante auditoría que un producto, sistema o persona cumple una norma, y emite un certificado.'},
  {cat:'Calidad', q:'Diferencia normalización vs certificación', a:'Normalización CREA las reglas (la norma). Certificación COMPRUEBA que se cumplen y da el certificado. Cadena: ENAC acredita → AENOR certifica → la empresa cumple la norma.'},
  {cat:'Calidad', q:'Las 4 etapas de la evolución de la calidad', a:'1) Inspección del PRODUCTO (final) → 2) Control del PROCESO (estadístico) → 3) ASEGURAMIENTO de la calidad (prevención, ISO 9000) → 4) Calidad TOTAL (TQM, toda la organización).'},
  {cat:'Calidad', q:'¿Qué significa TQM?', a:'Total Quality Management (Gestión de la Calidad Total): la calidad implica a toda la organización y a todas las personas, con mejora continua y orientación al cliente.'},
  {cat:'Calidad', q:'Gurús: Deming', a:'Ciclo PHVA y los 14 puntos. La calidad mejora reduciendo la variabilidad. La dirección es responsable del 85% de los problemas.'},
  {cat:'Calidad', q:'Gurús: Juran', a:'Calidad = "adecuación al uso". Trilogía de Juran: planificación, control y mejora de la calidad.'},
  {cat:'Calidad', q:'Gurús: Ishikawa', a:'Diagrama causa-efecto (espina de pez) y los círculos de calidad. Calidad orientada al cliente.'},
  {cat:'Calidad', q:'Gurús: Crosby', a:'"Cero defectos" y "hacerlo bien a la primera". Calidad = cumplir los requisitos. La calidad es gratis (lo caro es la no calidad).'},
  {cat:'Calidad', q:'Familia ISO 9000: ¿qué es cada una?', a:'ISO 9000 = fundamentos y vocabulario. ISO 9001 = requisitos (la ÚNICA certificable). ISO 9004 = directrices para el éxito sostenido / mejora.'},
  {cat:'Calidad', q:'¿Qué es el ciclo PHVA?', a:'Planificar – Hacer – Verificar – Actuar. Rueda de Deming/Shewhart, base de la mejora continua de ISO 9001.'},
  {cat:'Calidad', q:'Los 7 principios de la gestión de la calidad (ISO 9001:2015)', a:'1) Enfoque al cliente 2) Liderazgo 3) Compromiso de las personas 4) Enfoque a procesos 5) Mejora 6) Decisiones basadas en evidencias 7) Gestión de las relaciones.'},
  {cat:'Calidad', q:'Proceso vs procedimiento', a:'PROCESO = conjunto de actividades que transforman entradas en salidas con valor. PROCEDIMIENTO = forma especificada (el documento) de cómo realizar una actividad.'},
  {cat:'Calidad', q:'Los 3 niveles del mapa de procesos', a:'Estratégicos (dirección), Clave/operativos (los que aportan valor al cliente) y de Soporte/apoyo (dan recursos a los demás).'},
  {cat:'Calidad', q:'La pirámide documental del SGC (de arriba a abajo)', a:'1) Política de calidad → 2) Manual de calidad → 3) Procedimientos → 4) Instrucciones de trabajo → 5) Registros (la base, evidencias).'},
  {cat:'Calidad', q:'¿Qué es EFQM?', a:'Modelo Europeo de Excelencia. Sirve para autoevaluar la organización (no es certificable como ISO 9001); busca la excelencia mediante criterios de agentes y resultados.'},
  {cat:'Herramientas', q:'Las 7 herramientas básicas de la calidad', a:'Diagrama causa-efecto (Ishikawa), hoja de recogida de datos, histograma, diagrama de Pareto, diagrama de dispersión/correlación, gráficos de control y estratificación (o diagrama de flujo).'},
  {cat:'Herramientas', q:'¿Qué dice el principio de Pareto?', a:'Regla 80/20: el 80% de los problemas (efectos) proviene del 20% de las causas. Prioriza los "pocos vitales".'},
  {cat:'Herramientas', q:'Las 6M del diagrama de Ishikawa', a:'Mano de obra, Maquinaria, Materiales, Método, Medio ambiente y Medición. Son las familias de causas del problema.'},
  {cat:'Herramientas', q:'¿Para qué sirven Cp y Cpk?', a:'Miden la capacidad del proceso (si las piezas caben en las tolerancias). Cp = capacidad potencial; Cpk = capacidad real (tiene en cuenta el centrado). Cpk ≥ 1,33 ≈ proceso capaz.'},
  {cat:'Herramientas', q:'¿Qué es el análisis DAFO?', a:'Debilidades y Fortalezas (internas) + Amenazas y Oportunidades (externas). Herramienta de diagnóstico estratégico.'},
  {cat:'Herramientas', q:'Las 5S (japonés → español)', a:'Seiri=Clasificar, Seiton=Ordenar, Seiso=Limpiar, Seiketsu=Estandarizar, Shitsuke=Disciplina. Truco: "Carlos Ordenó Limpiar El Departamento".'},
  {cat:'Herramientas', q:'Los 4 costes de la calidad', a:'De CONFORMIDAD: prevención y evaluación. De NO conformidad: fallos internos (antes de entregar) y fallos externos (los detecta el cliente, los más caros).'},
  {cat:'PRL', q:'¿Qué ley regula la PRL en España?', a:'Ley 31/1995, de 8 de noviembre, de Prevención de Riesgos Laborales (LPRL).'},
  {cat:'PRL', q:'Peligro vs riesgo', a:'PELIGRO = fuente capaz de causar daño. RIESGO = probabilidad de que el peligro se materialice en daño × su gravedad.'},
  {cat:'PRL', q:'Accidente de trabajo vs enfermedad profesional', a:'Accidente = lesión súbita con ocasión del trabajo. Enfermedad profesional = la contraída por la exposición lenta a agentes del trabajo (recogida en el cuadro oficial).'},
  {cat:'PRL', q:'Método de evaluación de riesgos del INSST', a:'Nivel de Riesgo = Probabilidad × Consecuencias. Cruza la probabilidad (baja/media/alta) con la severidad para priorizar (trivial → intolerable).'},
  {cat:'PRL', q:'Colores y formas de la señalización de seguridad', a:'Prohibición: rojo, redonda. Obligación: azul, redonda. Advertencia/peligro: amarillo, triangular. Salvamento/socorro: verde, cuadrada. Equipos contra incendios: rojo.'},
  {cat:'PRL', q:'¿Qué es un EPI y la jerarquía preventiva?', a:'EPI = Equipo de Protección Individual (último recurso). Jerarquía: 1º evitar el riesgo, 2º protección colectiva, 3º EPI (protección individual).'},
  {cat:'MedioAmb', q:'ISO 14001 vs EMAS', a:'Ambos son SGMA. ISO 14001 = norma internacional certificable. EMAS = Reglamento (CE) 1221/2009, más exigente: exige declaración ambiental pública verificada y registro oficial.'},
  {cat:'MedioAmb', q:'Aspecto ambiental vs impacto ambiental', a:'ASPECTO = elemento de la actividad que interactúa con el medio (un vertido, un ruido). IMPACTO = el cambio real que produce en el medio (contaminación del agua).'},
  {cat:'Residuos', q:'¿Qué es la lista LER y qué significa el asterisco (*)?', a:'LER = Lista Europea de Residuos, código de 6 cifras que identifica cada residuo. El asterisco (*) marca que es un residuo PELIGROSO.'},
  {cat:'Residuos', q:'Jerarquía de gestión de residuos (de mejor a peor)', a:'1) Prevención → 2) Preparación para la reutilización → 3) Reciclado → 4) Otra valorización (p.ej. energética) → 5) Eliminación (vertedero, lo último).'},
  {cat:'Residuos', q:'Ley de residuos vigente y Reglamento CLP', a:'Ley 7/2022 de residuos y suelos contaminados para una economía circular. Reglamento CLP = clasificación, etiquetado y envasado de sustancias y mezclas químicas (los pictogramas de peligro).'},
];

// --- TEST (opción múltiple) ---
const TEST = [
  {cat:'Calidad', q:'¿Cuál de las normas ISO 9000 es la única CERTIFICABLE?', o:['ISO 9000','ISO 9001','ISO 9004','ISO 14001'], c:1,
   e:'La 9001 contiene los requisitos auditables. La 9000 es vocabulario y la 9004 son directrices de mejora.'},
  {cat:'Calidad', q:'La diferencia clave entre normalización y certificación es:', o:['Son sinónimos','Normalizar crea la norma; certificar comprueba que se cumple','Certificar crea la norma','Solo cambia el organismo'], c:1,
   e:'Normalización = redactar la norma (AENOR/ISO). Certificación = auditar y dar el sello (entidad acreditada por ENAC).'},
  {cat:'Calidad', q:'¿Qué organismo ACREDITA en España a las entidades certificadoras?', o:['AENOR','ENAC','ISO','CEN'], c:1,
   e:'ENAC acredita → AENOR (u otra) certifica → la empresa cumple. AENOR además elabora las normas UNE.'},
  {cat:'Calidad', q:'El ciclo de mejora continua PHVA significa:', o:['Producir-Hacer-Vender-Auditar','Planificar-Hacer-Verificar-Actuar','Prevenir-Hacer-Validar-Archivar','Planificar-Homologar-Verificar-Activar'], c:1,
   e:'Planificar–Hacer–Verificar–Actuar. Es la rueda de Deming, base de ISO 9001.'},
  {cat:'Calidad', q:'¿Cuál NO es uno de los 7 principios de la gestión de la calidad?', o:['Enfoque al cliente','Liderazgo','Cero defectos','Mejora'], c:2,
   e:'"Cero defectos" es de Crosby, no es uno de los 7 principios. Los principios incluyen enfoque al cliente, liderazgo, compromiso de las personas, enfoque a procesos, mejora, decisiones basadas en evidencias y gestión de relaciones.'},
  {cat:'Calidad', q:'"Calidad = adecuación al uso" es la definición de:', o:['Crosby','Deming','Juran','Ishikawa'], c:2,
   e:'Es la definición de Juran, autor también de la trilogía (planificar, controlar, mejorar).'},
  {cat:'Calidad', q:'En la pirámide documental, ¿qué está en la CIMA?', o:['Los registros','Los procedimientos','La política de calidad','El manual de calidad'], c:2,
   e:'Arriba la política de calidad → manual → procedimientos → instrucciones → registros (base).'},
  {cat:'Calidad', q:'Un PROCEDIMIENTO es:', o:['Un conjunto de actividades que transforman entradas en salidas','La forma especificada de realizar una actividad','Un registro de calidad','El mapa de procesos'], c:1,
   e:'El procedimiento es el "cómo" (documento). El proceso es la transformación de entradas en salidas con valor.'},
  {cat:'Herramientas', q:'El diagrama de Pareto se basa en la regla:', o:['50/50','90/10','80/20','70/30'], c:2,
   e:'80/20: el 80% de los efectos viene del 20% de las causas (los "pocos vitales").'},
  {cat:'Herramientas', q:'Las 6M del diagrama de Ishikawa son Mano de obra, Maquinaria, Materiales, Método, Medición y…', o:['Mercado','Medio ambiente','Mantenimiento','Mejora'], c:1,
   e:'La sexta M es Medio ambiente (entorno de trabajo).'},
  {cat:'Herramientas', q:'¿Qué herramienta sirve para ver la capacidad real de un proceso?', o:['DAFO','Cpk','Pareto','5S'], c:1,
   e:'Cpk mide la capacidad real (con centrado). Cpk ≥ 1,33 indica un proceso capaz.'},
  {cat:'Herramientas', q:'La tercera S (Seiso) corresponde a:', o:['Clasificar','Ordenar','Limpiar','Disciplina'], c:2,
   e:'Seiri=Clasificar, Seiton=Ordenar, Seiso=Limpiar, Seiketsu=Estandarizar, Shitsuke=Disciplina.'},
  {cat:'Herramientas', q:'¿Cuáles son los costes de NO conformidad?', o:['Prevención y evaluación','Fallos internos y fallos externos','Inspección y auditoría','Formación y mantenimiento'], c:1,
   e:'No conformidad = fallos internos (antes de entregar) + fallos externos (los ve el cliente, los más caros). Conformidad = prevención + evaluación.'},
  {cat:'Herramientas', q:'En el DAFO, las Debilidades y Fortalezas son factores…', o:['Externos','Internos','Del cliente','De la competencia'], c:1,
   e:'Debilidades y Fortalezas = internas. Amenazas y Oportunidades = externas.'},
  {cat:'PRL', q:'La Prevención de Riesgos Laborales se regula por la:', o:['Ley 7/2022','Ley 31/1995','RD 485/1997','ISO 45001'], c:1,
   e:'Ley 31/1995 (LPRL). El RD 485/1997 regula en concreto la señalización.'},
  {cat:'PRL', q:'Según el método del INSST, el nivel de riesgo se calcula como:', o:['Peligro + Daño','Probabilidad × Consecuencias','Coste / Beneficio','Frecuencia − Gravedad'], c:1,
   e:'Nivel de Riesgo = Probabilidad × Consecuencias (gravedad). Sirve para priorizar las medidas.'},
  {cat:'PRL', q:'Una señal AZUL y REDONDA indica:', o:['Prohibición','Obligación','Advertencia','Salvamento'], c:1,
   e:'Azul redonda = obligación (p.ej. uso obligatorio de casco). Rojo redonda = prohibición.'},
  {cat:'PRL', q:'Una señal TRIANGULAR AMARILLA es de:', o:['Obligación','Prohibición','Advertencia/peligro','Equipos contra incendios'], c:2,
   e:'Amarilla triangular = advertencia/peligro. Verde = salvamento/socorro. Rojo = prohibición o incendios.'},
  {cat:'PRL', q:'En la jerarquía preventiva, el EPI es:', o:['La primera medida','La protección colectiva','El último recurso, protección individual','Una obligación solo del empresario'], c:2,
   e:'Primero evitar el riesgo, luego protección colectiva y, por último, el EPI (individual).'},
  {cat:'MedioAmb', q:'¿Qué SGMA es MÁS exigente y exige declaración ambiental pública verificada?', o:['ISO 14001','ISO 9001','EMAS','LER'], c:2,
   e:'EMAS (Reglamento CE 1221/2009) exige declaración ambiental verificada y registro; va más allá de ISO 14001.'},
  {cat:'MedioAmb', q:'El cambio real que una actividad produce en el medio se llama:', o:['Aspecto ambiental','Impacto ambiental','Vertido','Foco contaminante'], c:1,
   e:'Aspecto = lo que interactúa (vertido, ruido). Impacto = el efecto real (agua contaminada).'},
  {cat:'Residuos', q:'En la lista LER, un asterisco (*) junto al código indica que el residuo es:', o:['Reciclable','Peligroso','Urbano','Inerte'], c:1,
   e:'El (*) marca residuo peligroso. El código LER tiene 6 cifras.'},
  {cat:'Residuos', q:'En la jerarquía de residuos, ¿qué opción es la PRIORITARIA?', o:['Reciclado','Eliminación en vertedero','Prevención','Valorización energética'], c:2,
   e:'Orden: Prevención > preparación para reutilización > reciclado > otra valorización > eliminación (lo último).'},
  {cat:'Residuos', q:'El Reglamento CLP se refiere a:', o:['Clasificación, etiquetado y envasado de sustancias químicas','El control de la calidad del aire','La ley de residuos','La acreditación de laboratorios'], c:0,
   e:'CLP = Classification, Labelling and Packaging: los pictogramas y etiquetas de peligro de productos químicos.'},
  {cat:'Calidad', q:'El modelo EFQM se utiliza principalmente para:', o:['Certificar productos con marcado CE','Autoevaluar la organización buscando la excelencia','Gestionar residuos peligrosos','Evaluar riesgos laborales'], c:1,
   e:'EFQM = modelo europeo de excelencia, para autoevaluación. No es certificable como la ISO 9001.'},
];

// --- DESARROLLO ---
const DEV = [
  {q:'Explica las diferencias entre normalización y certificación.',
   a:'<b>Normalización</b>: proceso de elaborar y publicar <b>normas</b> técnicas (UNE, EN, ISO) que fijan requisitos para que productos, procesos y servicios sean compatibles y seguros. La realizan organismos como ISO, CEN o AENOR.<br><br><b>Certificación</b>: proceso por el que una <b>entidad independiente acreditada</b> (por ENAC) verifica mediante auditoría que algo cumple una norma y emite un <b>certificado</b>.<br><br><span class="key">Clave:</span> la normalización <b>crea las reglas</b>; la certificación <b>comprueba que se cumplen</b>. Cadena: <b>ENAC acredita → AENOR certifica → la empresa cumple</b>. Sin normalización no habría nada que certificar.'},
  {q:'Describe las 4 etapas de la evolución de la calidad.',
   a:'<ul><li><b>1. Inspección del producto:</b> se controla el producto final y se separan los defectuosos.</li><li><b>2. Control del proceso:</b> control estadístico durante la fabricación para prevenir defectos.</li><li><b>3. Aseguramiento de la calidad:</b> sistema documentado y preventivo (familia ISO 9000) para dar confianza.</li><li><b>4. Calidad total (TQM):</b> implica a toda la organización y a todas las personas, con mejora continua y orientación al cliente.</li></ul><span class="key">Idea:</span> se pasa de <b>detectar</b> errores a <b>prevenirlos</b> e implicar a todos.'},
  {q:'Explica el ciclo PHVA y su relación con la mejora continua.',
   a:'El <b>PHVA</b> (rueda de Deming) tiene 4 fases:<ul><li><b>Planificar:</b> fijar objetivos y procesos para lograrlos.</li><li><b>Hacer:</b> implantar lo planificado.</li><li><b>Verificar:</b> medir y comparar resultados con los objetivos.</li><li><b>Actuar:</b> corregir y estandarizar lo que funciona.</li></ul>Al repetir el ciclo de forma continua, cada vuelta deja el proceso un poco mejor: es la base de la <b>mejora continua</b> de la ISO 9001.'},
  {q:'Enumera y explica brevemente los 7 principios de la gestión de la calidad.',
   a:'<ul><li><b>Enfoque al cliente:</b> satisfacer y superar sus necesidades.</li><li><b>Liderazgo:</b> la dirección marca el rumbo e implica.</li><li><b>Compromiso de las personas:</b> personal competente y motivado.</li><li><b>Enfoque a procesos:</b> gestionar las actividades como procesos enlazados.</li><li><b>Mejora:</b> objetivo permanente de la organización.</li><li><b>Decisiones basadas en evidencias:</b> decidir con datos.</li><li><b>Gestión de las relaciones:</b> con proveedores y partes interesadas.</li></ul>'},
  {q:'Diferencia entre proceso y procedimiento, y los 3 niveles del mapa de procesos.',
   a:'<b>Proceso:</b> conjunto de actividades relacionadas que transforman <b>entradas en salidas con valor</b>.<br><b>Procedimiento:</b> la <b>forma especificada</b> (documento) de cómo realizar una actividad — el "cómo".<br><br><b>Mapa de procesos (3 niveles):</b><ul><li><b>Estratégicos:</b> de dirección y planificación.</li><li><b>Clave / operativos:</b> los que aportan valor directo al cliente.</li><li><b>Soporte / apoyo:</b> dan recursos a los demás (mantenimiento, RRHH, compras).</li></ul>'},
  {q:'Explica el principio de Pareto y el diagrama de Ishikawa.',
   a:'<b>Pareto (80/20):</b> el 80% de los problemas procede del 20% de las causas. El diagrama ordena las causas de mayor a menor para atacar primero las "pocas vitales".<br><br><b>Ishikawa (causa-efecto / espina de pez):</b> representa todas las causas de un problema agrupadas en las <b>6M</b>: Mano de obra, Maquinaria, Materiales, Método, Medición y Medio ambiente. Sirve para encontrar la causa raíz.'},
  {q:'Describe los 4 tipos de costes de la calidad con un ejemplo de cada uno.',
   a:'<b>De conformidad (invertir en calidad):</b><ul><li><b>Prevención:</b> evitar fallos. Ej.: formación, mantenimiento preventivo.</li><li><b>Evaluación:</b> comprobar. Ej.: inspecciones, auditorías, calibración.</li></ul><b>De no conformidad (la "no calidad"):</b><ul><li><b>Fallos internos:</b> detectados antes de entregar. Ej.: chatarra, reprocesos.</li><li><b>Fallos externos:</b> los detecta el cliente. Ej.: devoluciones, garantías, pérdida de imagen — <b>los más caros</b>.</li></ul><span class="key">Conclusión:</span> invertir en prevención reduce mucho los costes totales.'},
  {q:'¿Qué es la PRL? Cita la ley, define peligro y riesgo y explica cómo se evalúa un riesgo.',
   a:'La <b>PRL</b> es el conjunto de actividades para proteger la seguridad y salud de los trabajadores. Se regula por la <b>Ley 31/1995</b> de Prevención de Riesgos Laborales.<br><br><b>Peligro:</b> fuente capaz de causar un daño. <b>Riesgo:</b> probabilidad de que ese peligro se materialice, por su gravedad.<br><br><b>Evaluación (método INSST):</b> <b>Nivel de Riesgo = Probabilidad × Consecuencias</b>. Se cruza la probabilidad con la severidad para clasificar el riesgo (de trivial a intolerable) y priorizar las medidas preventivas.'},
  {q:'Explica la señalización de seguridad: colores, formas y significado.',
   a:'<ul><li><b>Prohibición:</b> roja, redonda, con barra (p.ej. prohibido fumar).</li><li><b>Obligación:</b> azul, redonda (p.ej. uso obligatorio de casco/EPI).</li><li><b>Advertencia / peligro:</b> amarilla, triangular (p.ej. riesgo eléctrico).</li><li><b>Salvamento / socorro:</b> verde, cuadrada/rectangular (salidas, botiquín).</li><li><b>Lucha contra incendios:</b> roja, cuadrada (extintores, BIE).</li></ul>Regulado por el <b>RD 485/1997</b>.'},
  {q:'Compara ISO 14001 y EMAS, y explica la jerarquía de gestión de residuos.',
   a:'<b>ISO 14001:</b> norma internacional de Sistema de Gestión Ambiental, certificable por tercera parte.<br><b>EMAS</b> (Reglamento CE 1221/2009): <b>más exigente</b>; además de un SGMA, exige una <b>declaración ambiental pública verificada</b> y el registro oficial.<br><br><b>Jerarquía de residuos (Ley 7/2022), de mejor a peor:</b><ol><li>Prevención</li><li>Preparación para la reutilización</li><li>Reciclado</li><li>Otra valorización (p.ej. energética)</li><li>Eliminación (vertedero) — lo último</li></ol>Recuerda: en la lista <b>LER</b> el asterisco (*) marca residuo <b>peligroso</b>.'},
];

/* ============================ NAVEGACIÓN ============================ */
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

$$('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    $$('.panel').forEach(p=>p.classList.remove('on'));
    $('#p-'+t.dataset.go).classList.add('on');
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

/* ============================ TARJETAS ============================ */
const cats = ['Todas',...[...new Set(CARDS.map(c=>c.cat))]];
let cFilter='Todas', cIdx=0, cDeck=CARDS;

function buildFilter(){
  const bar=$('#cardFilter');
  bar.innerHTML='';
  cats.forEach(cat=>{
    const b=document.createElement('button');
    b.className='fbtn'+(cat===cFilter?' active':'');
    b.textContent=cat==='MedioAmb'?'Medio Amb.':cat;
    b.onclick=()=>{cFilter=cat;cIdx=0;applyFilter();};
    bar.appendChild(b);
  });
}
function applyFilter(){
  cDeck = cFilter==='Todas'?CARDS:CARDS.filter(c=>c.cat===cFilter);
  buildFilter(); renderCard();
}
function renderCard(){
  const c=cDeck[cIdx];
  $('#card').classList.remove('flip');
  // pequeño retardo para que no se vea el texto de la cara trasera al cambiar
  setTimeout(()=>{
    $('#cFrontCat').textContent = c.cat==='MedioAmb'?'Medio Ambiente':c.cat;
    $('#cFront').textContent=c.q;
    $('#cBack').textContent=c.a;
  },120);
  $('#cCount').textContent=`Tarjeta ${cIdx+1} de ${cDeck.length}`;
  $('#cCat').textContent=cFilter==='Todas'?'Todas las categorías':'';
  $('#cBar').style.width=((cIdx+1)/cDeck.length*100)+'%';
}
$('#card').addEventListener('click',()=>$('#card').classList.toggle('flip'));
$('#cNext').onclick=()=>{cIdx=(cIdx+1)%cDeck.length;renderCard();};
$('#cPrev').onclick=()=>{cIdx=(cIdx-1+cDeck.length)%cDeck.length;renderCard();};
applyFilter();

/* ============================ TEST ============================ */
let tDeck=[], tIdx=0, tScore=0, tAnswered=false;

function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function startTest(){
  tDeck=shuffle(TEST); tIdx=0; tScore=0;
  $('#testEnd').style.display='none';
  $('#testRun').style.display='block';
  renderQ();
}
function renderQ(){
  tAnswered=false;
  const q=tDeck[tIdx];
  $('#tCat').textContent=q.cat==='MedioAmb'?'Medio Ambiente':q.cat;
  $('#tQ').textContent=q.q;
  $('#tCount').textContent=`Pregunta ${tIdx+1} de ${tDeck.length}`;
  $('#tScore').textContent=`Aciertos: ${tScore}`;
  $('#tBar').style.width=(tIdx/tDeck.length*100)+'%';
  const exp=$('#tExp'); exp.classList.remove('on'); exp.textContent='';
  $('#tNext').style.display='none';
  const box=$('#tOpts'); box.innerHTML='';
  const letters=['A','B','C','D'];
  q.o.forEach((opt,i)=>{
    const b=document.createElement('button');
    b.className='opt';
    b.innerHTML=`<span class="k">${letters[i]}</span>${opt}`;
    b.onclick=()=>answer(i,b);
    box.appendChild(b);
  });
}
function answer(i,btn){
  if(tAnswered)return; tAnswered=true;
  const q=tDeck[tIdx];
  const opts=$$('#tOpts .opt');
  opts.forEach((o,k)=>{
    o.disabled=true;
    if(k===q.c)o.classList.add('correct');
    if(k===i && i!==q.c)o.classList.add('wrong');
  });
  if(i===q.c)tScore++;
  $('#tScore').textContent=`Aciertos: ${tScore}`;
  const exp=$('#tExp');
  exp.innerHTML=(i===q.c?'✅ ¡Correcto! ':'❌ Casi. ')+q.e;
  exp.classList.add('on');
  $('#tNext').style.display='block';
  $('#tNext').textContent = tIdx===tDeck.length-1 ? 'Ver resultado →' : 'Siguiente →';
}
$('#tNext').onclick=()=>{
  if(tIdx===tDeck.length-1){endTest();}
  else{tIdx++;renderQ();}
};
function endTest(){
  $('#tBar').style.width='100%';
  $('#testRun').style.display='none';
  const pct=Math.round(tScore/tDeck.length*100);
  let msg,emoji;
  if(pct>=90){msg='¡Crack! Llevas el examen dominado.';emoji='🏆';}
  else if(pct>=70){msg='Muy bien. Repasa solo lo que has fallado.';emoji='💪';}
  else if(pct>=50){msg='Vas por buen camino. Otra vuelta a las tarjetas y subes.';emoji='📈';}
  else{msg='Tranqui: repasa las tarjetas y vuelve. Aún hay tiempo.';emoji='📚';}
  const end=$('#testEnd');
  end.style.display='block';
  end.innerHTML=`
    <div class="box score">
      <div style="font-size:2.4rem">${emoji}</div>
      <div class="big">${tScore}/${tDeck.length}</div>
      <div class="msg">${pct}% de aciertos · ${msg}</div>
      <div class="row">
        <button class="btn btn-ghost btn-sm" id="tCards">Ir a tarjetas</button>
        <button class="btn btn-primary btn-sm" id="tAgain">Repetir test 🔁</button>
      </div>
    </div>`;
  $('#tAgain').onclick=startTest;
  $('#tCards').onclick=()=>{document.querySelector('.tab[data-go="cards"]').click();};
  window.scrollTo({top:0,behavior:'smooth'});
}
startTest();

/* ============================ DESARROLLO ============================ */
(function buildDev(){
  const list=$('#devList');
  DEV.forEach((d,i)=>{
    const det=document.createElement('details');
    det.className='dev';
    det.innerHTML=`
      <summary><span class="n">${i+1}.</span><span>${d.q}</span><span class="chev">▾</span></summary>
      <div class="ans">${d.a}</div>`;
    list.appendChild(det);
  });
})();
