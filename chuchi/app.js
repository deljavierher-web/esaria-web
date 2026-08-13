document.addEventListener('DOMContentLoaded', () => {
    let allOrders = [];
    let currentFilter = 'all';
    let searchQuery = '';

    const syncStatusEl = document.getElementById('lastUpdate');
    const kpiTotalEl = document.getElementById('kpiTotal');
    const kpiPagadosEl = document.getElementById('kpiPagados');
    const kpiPagadosSubEl = document.getElementById('kpiPagadosSub');
    const kpiPendientesEl = document.getElementById('kpiPendientes');
    const kpiBizumEl = document.getElementById('kpiBizum');
    const kpiEfectivoEl = document.getElementById('kpiEfectivo');
    const progressPercentageEl = document.getElementById('progressPercentage');
    const progressBarFillEl = document.getElementById('progressBarFill');
    const sizesListEl = document.getElementById('sizesList');
    const ordersTableBodyEl = document.getElementById('ordersTableBody');
    const searchInputEl = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');

    async function loadData() {
        // Intenta primero la ruta de producción (data/pedidos.json) y, si no está
        // disponible, usa la copia local en la raíz (pedidos.json).
        const rutas = [`data/pedidos.json`, `pedidos.json`];
        let data = null;

        for (const ruta of rutas) {
            try {
                const response = await fetch(`${ruta}?t=${new Date().getTime()}`);
                if (response.ok) {
                    data = await response.json();
                    break;
                }
            } catch (e) {
                // continúa con la siguiente ruta
            }
        }

        if (!data) {
            console.error('Error al cargar pedidos.json');
            syncStatusEl.textContent = 'Modo vista previa';
            return;
        }

        allOrders = data.pedidos || [];
        updateSyncTime(data.ultima_actualizacion);
        updateKPIs(data.resumen_finanzas, data.resumen_tallas);
        renderSizes(data.resumen_tallas);
        renderTable();
    }

    function updateSyncTime(timeStr) {
        if (timeStr) {
            syncStatusEl.textContent = `Actualizado: ${timeStr}`;
        } else {
            syncStatusEl.textContent = 'Sincronizado';
        }
    }

    function updateKPIs(finanzas, tallas) {
        const total = finanzas ? finanzas.total_pedidos : allOrders.length;
        const pagados = finanzas ? finanzas.pagados : allOrders.filter(o => o.estado_pago === 'Pagado').length;
        const pendientes = finanzas ? finanzas.pendientes : allOrders.filter(o => o.estado_pago === 'Pendiente').length;
        const bizum = finanzas ? finanzas.bizum : allOrders.filter(o => o.metodo_pago === 'Bizum').length;
        const efectivo = finanzas ? finanzas.efectivo : allOrders.filter(o => o.metodo_pago === 'Efectivo').length;

        const percent = total > 0 ? Math.round((pagados / total) * 100) : 0;

        kpiTotalEl.textContent = total;
        kpiPagadosEl.textContent = pagados;
        kpiPagadosSubEl.textContent = `${percent}% del total`;
        kpiPendientesEl.textContent = pendientes;
        kpiBizumEl.textContent = `📲 ${bizum} Bizum`;
        kpiEfectivoEl.textContent = `💵 ${efectivo} Efectivo`;

        progressPercentageEl.textContent = `${percent}%`;
        progressBarFillEl.style.width = `${percent}%`;
    }

    function renderSizes(tallasData) {
        sizesListEl.innerHTML = '';
        const tallas = tallasData ? tallasData.desglose : {};
        const total = tallasData ? tallasData.total_camisetas : 0;

        if (!tallas || Object.keys(tallas).length === 0) {
            sizesListEl.innerHTML = '<div class="loading-state">Sin pedidos registrados</div>';
            return;
        }

        const ordenStandard = ["S", "M", "L", "XL", "2XL", "3XL"];
        const sortedKeys = Object.keys(tallas).sort((a, b) => {
            const idxA = ordenStandard.indexOf(a);
            const idxB = ordenStandard.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach(size => {
            const count = tallas[size];
            const div = document.createElement('div');
            div.className = 'size-item';
            div.innerHTML = `
                <span class="size-badge">${escapeHtml(size)}</span>
                <span class="size-count">${count} u.</span>
            `;
            sizesListEl.appendChild(div);
        });
    }

    function renderTable() {
        ordersTableBodyEl.innerHTML = '';

        const filtered = allOrders.filter(order => {
            const matchesFilter = (currentFilter === 'all') || (order.estado_pago === currentFilter);
            const matchesSearch = order.comprador.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  order.talla.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (filtered.length === 0) {
            ordersTableBodyEl.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-message">No se encontraron pedidos con el filtro actual.</td>
                </tr>
            `;
            return;
        }

        filtered.forEach(order => {
            const tr = document.createElement('tr');
            const isPagado = order.estado_pago === 'Pagado';
            
            tr.innerHTML = `
                <td data-label="Nº">#${order.id}</td>
                <td data-label="Comprador" class="comprador-name">${escapeHtml(order.comprador)}</td>
                <td data-label="Talla"><span class="talla-chip">${escapeHtml(order.talla)}</span></td>
                <td data-label="Método"><span class="badge-method">${order.metodo_pago === 'Bizum' ? '📲 Bizum' : '💵 Efectivo'}</span></td>
                <td data-label="Estado">
                    <span class="badge-status ${isPagado ? 'pagado' : 'pendiente'}">
                        ${isPagado ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                </td>
                <td data-label="Fecha" style="font-size:0.8rem; opacity:0.7;">${escapeHtml(order.fecha_registro)}</td>
            `;
            ordersTableBodyEl.appendChild(tr);
        });
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Event listeners
    searchInputEl.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderTable();
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTable();
        });
    });

    // Initial load & poll every 30s
    loadData();
    setInterval(loadData, 30000);
});
