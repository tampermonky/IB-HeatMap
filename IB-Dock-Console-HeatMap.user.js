// ==UserScript==
// @name         IB Dock Console HeatMap
// @namespace    http://tampermonkey.net/
// @version      2.0.5
// @description  Dock Console heatmap using Export Inbound Volume CSV with editable chute mapping, manifested/completed sections, settings page, late arrival flag, and summary controls.
// @author       eydel@
// @match        https://drive.harmony.a2z.com/dock-console*
// @updateURL    https://tamarin.aces.amazon.dev/scripts/ib-dock-console-heatmap/install.user.js
// @downloadURL  https://tamarin.aces.amazon.dev/scripts/ib-dock-console-heatmap/install.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_VERSION = '2.0.5';
    const LAST_UPDATED = '2026-05-11 00:00 CT';

    const STORAGE_KEY = 'dockConsoleHeatmapSettingsV10';
    const DNR_KEY = 'dockConsoleHeatmapDoNotRunV10';
    const VIEW_KEY = 'dockConsoleHeatmapViewModeV10';
    const FOCUS_KEY = 'dockConsoleHeatmapFocusZoneV10';
    const BIG_TEXT_KEY = 'dockConsoleHeatmapBigTextV10';
    const COMPLETED_OPEN_KEY = 'dockConsoleHeatmapCompletedOpenV10';
    const MANIFESTED_OPEN_KEY = 'dockConsoleHeatmapManifestedOpenV10';

    const DEFAULT_SETTINGS = {
        activeDockDoors: [
            'DD120', 'DD121', 'DD122', 'DD123', 'DD124', 'DD125',
            'DD126', 'DD127', 'DD128', 'DD129', 'DD130', 'DD131'
        ],

        includeCompletedInSummary: false,

        futureCptTime: '07:00',
        lateArrivalCutoffTime: '',

        columns: {
            vrid: 'A',
            status: 'B',
            location: 'C',
            loadRoute: 'D',
            loadArrival: 'E',
            chute: 'J',
            packageCount: 'M',
            cpt: 'O'
        },

        zones: [
            {
                name: "3000's Evens",
                chutes: [
                    'S013004', 'S013006', 'S013008', 'S013010', 'S013012', 'S013014',
                    'S013018', 'S013020', 'S013022', 'S013024', 'S013026', 'S013028',
                    'S013032', 'S013034', 'S013036', 'S013038', 'S013040', 'S013044',
                    'S013048', 'S013050', 'S013052', 'S013054', 'S013056', 'S013058',
                    'S013062', 'S013064', 'S013080', 'S013082', 'S013084', 'S013086',
                    'S013088', 'S013042'
                ]
            },
            {
                name: "3000's Odds",
                chutes: [
                    'S013003', 'S013005', 'S013007', 'S013009', 'S013011', 'S013013',
                    'S013015', 'S013017', 'S013019', 'S013021', 'S013023', 'S013025',
                    'S013027', 'S013029', 'S013031', 'S013033', 'S013035', 'S013039',
                    'S013041', 'S013043', 'S013045', 'S013047', 'S013049', 'S013051',
                    'S013053', 'S013055', 'S013057', 'S013059', 'S013061', 'S013063',
                    'S013079', 'S013081', 'S013083', 'S013085', 'S013087', 'S013037'
                ]
            },
            {
                name: "2000's Evens",
                chutes: [
                    'S012002', 'S012004', 'S012006', 'S012008', 'S012014', 'S012016',
                    'S012018', 'S012020', 'S012022', 'S012024', 'S012026', 'S012028',
                    'S012030', 'S012032', 'S012034', 'S012036', 'S012038', 'S012044',
                    'S012046', 'S012048', 'S012050', 'S012052', 'S012056', 'S012058',
                    'S012060', 'S012062', 'S012064', 'S012066', 'S012068', 'S012042'
                ]
            },
            {
                name: "2000's Odds",
                chutes: [
                    'S012001', 'S012003', 'S012005', 'S012007', 'S012023', 'S012025',
                    'S012027', 'S012029', 'S012031', 'S012033', 'S012035', 'S012037',
                    'S012039', 'S012041', 'S012043', 'S012045', 'S012047', 'S012051',
                    'S012053', 'S012055', 'S012057', 'S012059', 'S012061', 'S012063',
                    'S012065', 'S012067', 'S012049'
                ]
            },
            {
                name: 'D2C Evens',
                chutes: [
                    'S011002', 'S011004', 'S011006', 'S011008', 'S011010', 'S011012',
                    'S011014', 'S011016', 'S011018', 'S011020', 'S011022', 'S011024',
                    'S011026', 'S011028', 'S011030', 'S011032', 'S011034', 'S011038',
                    'S011040', 'S011042', 'S011044', 'S011046', 'S011048', 'S011050',
                    'S011052', 'S011054', 'S011056', 'S011058', 'S011060', 'S011062',
                    'S011064', 'S011066', 'S011068', 'S011070', 'S011072', 'S011074',
                    'S011036'
                ]
            },
            {
                name: 'D2C Odds',
                chutes: [
                    'S011001', 'S011003', 'S011005', 'S011007', 'S011009', 'S011011',
                    'S011013', 'S011015', 'S011017', 'S011019', 'S011021', 'S011023',
                    'S011025', 'S011027', 'S011029', 'S011031', 'S011033', 'S011037',
                    'S011039', 'S011041', 'S011043', 'S011045', 'S011047', 'S011049',
                    'S011051', 'S011053', 'S011055', 'S011057', 'S011059', 'S011061',
                    'S011063', 'S011065', 'S011067', 'S011069', 'S011071', 'S011073',
                    'S011035'
                ]
            },
            {
                name: 'NC',
                chutes: ['NONCON', 'NONE', 'NON-CON', 'NC']
            }
        ]
    };

    let settings = loadSettings();
    let doNotRun = loadDoNotRun();
    let parsedRows = [];
    let lastFileName = '';
    let tvMode = localStorage.getItem(VIEW_KEY) === 'true';
    let bigTextMode = localStorage.getItem(BIG_TEXT_KEY) === 'true';
    let focusZone = localStorage.getItem(FOCUS_KEY) || 'All Zones';
    let completedOpen = localStorage.getItem(COMPLETED_OPEN_KEY) === 'true';
    let manifestedOpen = localStorage.getItem(MANIFESTED_OPEN_KEY) === 'true';
    let activePage = 'heatmap';

    function cloneDefaultSettings() {
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            const defaults = cloneDefaultSettings();

            return {
                ...defaults,
                ...saved,
                columns: {
                    ...defaults.columns,
                    ...(saved.columns || {})
                },
                zones: Array.isArray(saved.zones) && saved.zones.length
                    ? saved.zones
                    : defaults.zones
            };
        } catch {
            return cloneDefaultSettings();
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function loadDoNotRun() {
        try {
            return JSON.parse(localStorage.getItem(DNR_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveDoNotRun() {
        localStorage.setItem(DNR_KEY, JSON.stringify(doNotRun));
    }

    function cleanText(value) {
        return String(value ?? '').trim();
    }

    function normalize(value) {
        return cleanText(value)
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/^SO/, 'S0');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function colLetterToIndex(letter) {
        letter = String(letter || '').toUpperCase().trim();

        let index = 0;

        for (let i = 0; i < letter.length; i++) {
            index = index * 26 + (letter.charCodeAt(i) - 64);
        }

        return index - 1;
    }

    function parseNumber(value) {
        if (value == null) return 0;

        const num = Number(String(value).replace(/,/g, '').trim());

        return Number.isFinite(num) ? num : 0;
    }

    function parseDate(value) {
        if (!value) return null;

        const raw = String(value).trim().replace('@', ' ').replace(/\s+/g, ' ');
        const date = new Date(raw);

        return isNaN(date.getTime()) ? null : date;
    }

    function parseTimeToMinutes(value) {
        const text = cleanText(value);

        if (!text) return null;

        const match = text.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

        if (!match) return null;

        return Number(match[1]) * 60 + Number(match[2]);
    }

    function formatTimeFromDate(date) {
        if (!date) return '';

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function fmt(num) {
        return Math.round(num || 0).toLocaleString();
    }

    function pct(n, d) {
        return d ? Math.round((n / d) * 100) : 0;
    }

    function splitList(text) {
        return String(text || '')
            .split(/[\n,]+/)
            .map(x => x.trim())
            .filter(Boolean);
    }

    function getFutureWindow() {
        const now = new Date();
        const minutes = parseTimeToMinutes(settings.futureCptTime || '07:00') ?? 420;

        const start = new Date(now);
        start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

        if (now < start) {
            start.setDate(start.getDate() - 1);
        }

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        return { start, end };
    }

    function isLateArrival(arrivalDate) {
        if (!arrivalDate) return false;

        const cutoffMinutes = parseTimeToMinutes(settings.lateArrivalCutoffTime);

        if (cutoffMinutes == null) return false;

        const arrivalMinutes = arrivalDate.getHours() * 60 + arrivalDate.getMinutes();

        return arrivalMinutes > cutoffMinutes;
    }

    function parseCSV(text) {
        const rows = [];
        let row = [];
        let cell = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const next = text[i + 1];

            if (ch === '"' && inQuotes && next === '"') {
                cell += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                row.push(cell);
                cell = '';
            } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
                if (cell.length || row.length) {
                    row.push(cell);
                    rows.push(row);
                    row = [];
                    cell = '';
                }

                if (ch === '\r' && next === '\n') i++;
            } else {
                cell += ch;
            }
        }

        if (cell.length || row.length) {
            row.push(cell);
            rows.push(row);
        }

        return rows;
    }

    function getAreaForChute(rawChute) {
        const chute = normalize(rawChute);

        if (!chute || chute === 'BLANK' || chute === '(BLANK)') {
            return 'Not Allocated';
        }

        for (const zone of settings.zones) {
            const list = (zone.chutes || []).map(normalize);

            if (list.includes(chute)) {
                return zone.name;
            }
        }

        return 'Not Allocated';
    }

    function addRowToMap(map, key, rowData) {
        if (!map[key]) {
            map[key] = {
                key,
                dnrKey: rowData.dnrKey || key,
                sectionType: rowData.sectionType || '',
                location: rowData.location || '',
                loadRoutes: new Set(),
                vrids: new Set(),
                arrivals: new Set(),
                hasLateArrival: false,
                areas: {},
                total: 0,
                current: 0,
                future: 0,
                notAllocatedChutes: new Set()
            };
        }

        const item = map[key];

        if (rowData.loadRoute) item.loadRoutes.add(rowData.loadRoute);
        if (rowData.vrid) item.vrids.add(rowData.vrid);
        if (rowData.arrivalDisplay) item.arrivals.add(rowData.arrivalDisplay);

        if (rowData.lateArrival) item.hasLateArrival = true;

        item.areas[rowData.area] = (item.areas[rowData.area] || 0) + rowData.pkg;
        item.total += rowData.pkg;

        if (rowData.area === 'Not Allocated') {
            item.notAllocatedChutes.add(rowData.chuteRaw || '(blank)');
        }

        if (rowData.cpt && rowData.cpt >= rowData.endTime) {
            item.future += rowData.pkg;
        } else {
            item.current += rowData.pkg;
        }
    }

    function finalizeRows(map, activeSet) {
        return Object.values(map).map(item => {
            let topArea = '';
            let topValue = -1;

            Object.entries(item.areas).forEach(([area, val]) => {
                if (val > topValue) {
                    topArea = area;
                    topValue = val;
                }
            });

            const isManifested = item.sectionType === 'manifested';

            return {
                ...item,
                active: item.location ? activeSet.has(normalize(item.location)) : false,
                doNotRun: isManifested
                    ? !!doNotRun[item.dnrKey]
                    : item.location
                        ? !!doNotRun[item.location]
                        : false,
                loadRouteDisplay: Array.from(item.loadRoutes).join(', '),
                vridDisplay: Array.from(item.vrids).join(', '),
                arrivalDisplay: Array.from(item.arrivals).join(', '),
                trailerCount: item.vrids.size,
                topArea
            };
        });
    }

    function buildData(csvRows) {
        const c = settings.columns;

        const idx = {
            vrid: colLetterToIndex(c.vrid),
            status: colLetterToIndex(c.status || 'B'),
            location: colLetterToIndex(c.location),
            loadRoute: colLetterToIndex(c.loadRoute),
            loadArrival: colLetterToIndex(c.loadArrival || 'E'),
            chute: colLetterToIndex(c.chute),
            packageCount: colLetterToIndex(c.packageCount),
            cpt: colLetterToIndex(c.cpt)
        };

        const { end } = getFutureWindow();
        const activeSet = new Set(settings.activeDockDoors.map(x => normalize(x)));

        const ddMap = {};
        const completedMap = {};
        const manifestedMap = {};

        for (const row of csvRows.slice(1)) {
            const vrid = cleanText(row[idx.vrid]);
            const status = cleanText(row[idx.status]).toUpperCase();
            const location = cleanText(row[idx.location]).toUpperCase();
            const loadRoute = cleanText(row[idx.loadRoute]);
            const arrivalDate = parseDate(row[idx.loadArrival]);
            const chuteRaw = cleanText(row[idx.chute]);
            const pkg = parseNumber(row[idx.packageCount]);
            const cpt = parseDate(row[idx.cpt]);

            if (!pkg) continue;

            const area = getAreaForChute(chuteRaw);
            const lateArrival = isLateArrival(arrivalDate);
            const arrivalDisplay = formatTimeFromDate(arrivalDate);

            const baseRowData = {
                vrid,
                status,
                location,
                loadRoute,
                arrivalDisplay,
                lateArrival,
                chuteRaw,
                pkg,
                cpt,
                area,
                endTime: end
            };

            if (location) {
                addRowToMap(ddMap, location, {
                    ...baseRowData,
                    sectionType: 'dd',
                    dnrKey: location
                });
            } else if (status === 'COMPLETED') {
                const key = `COMPLETED|${loadRoute || 'NO ROUTE'}|${vrid || 'NO VRID'}`;

                addRowToMap(completedMap, key, {
                    ...baseRowData,
                    sectionType: 'completed',
                    dnrKey: key
                });
            } else if (status === 'MANIFESTED') {
                const key = `MANIFESTED|${loadRoute || 'NO ROUTE'}|${vrid || 'NO VRID'}`;

                addRowToMap(manifestedMap, key, {
                    ...baseRowData,
                    sectionType: 'manifested',
                    dnrKey: key
                });
            }
        }

        const ddRows = finalizeRows(ddMap, activeSet);
        const completedRows = finalizeRows(completedMap, activeSet);
        const manifestedRows = finalizeRows(manifestedMap, activeSet);

        return {
            main: sortRows(ddRows.filter(x => x.active)),
            yard: sortRows(ddRows.filter(x => !x.active)),
            manifested: sortRows(manifestedRows),
            completed: sortRows(completedRows)
        };
    }

    function sortRows(rows) {
        if (focusZone && focusZone !== 'All Zones') {
            return rows.sort((a, b) => (b.areas[focusZone] || 0) - (a.areas[focusZone] || 0));
        }

        return rows.sort((a, b) => {
            const aKey = a.location || a.loadRouteDisplay || a.vridDisplay || '';
            const bKey = b.location || b.loadRouteDisplay || b.vridDisplay || '';

            return aKey.localeCompare(bKey);
        });
    }

    function createPanel() {
        const style = document.createElement('style');

        style.textContent = `
            #sat9HeatmapToggle {
                position: fixed;
                left: 20px;
                bottom: 20px;
                z-index: 999999;
                background: linear-gradient(135deg, #0b3d66, #1667a8);
                color: white;
                border: 0;
                border-radius: 10px;
                padding: 10px 14px;
                font-weight: 900;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(0, 0, 0, .28);
                letter-spacing: .3px;
            }

            #sat9HeatmapPanel {
                position: fixed;
                left: 20px;
                bottom: 70px;
                width: 1380px;
                max-width: calc(100vw - 40px);
                height: 84vh;
                z-index: 999998;
                background: #f6f8fb;
                border: 1px solid #214c74;
                border-radius: 12px;
                box-shadow: 0 15px 40px rgba(0, 0, 0, .38);
                display: none;
                overflow: hidden;
                font-family: Arial, sans-serif;
                color: #1b2530;
            }

            #sat9HeatmapPanel.tv-mode {
                background: #0b1622;
                color: #eaf2fa;
                border-color: #49a6ff;
            }

            #sat9HeatmapPanel.big-text {
                font-size: 15px;
            }

            #sat9HeatmapHeader {
                background: linear-gradient(135deg, #082c4b, #0d5a92);
                color: white;
                padding: 8px 12px;
                min-height: 26px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .hm-header-left {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
            }

            .hm-header-title {
                font-size: 16px;
                font-weight: 900;
                white-space: nowrap;
            }

            .hm-header-sub {
                font-size: 12px;
                font-weight: 700;
                opacity: .82;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .hm-header-right {
                display: flex;
                align-items: center;
                gap: 10px;
                white-space: nowrap;
                font-size: 12px;
                font-weight: 800;
                opacity: .9;
            }

            #sat9HeatmapBody {
                padding: 10px;
                overflow: auto;
                height: calc(100% - 43px);
            }

            .hm-actions {
                display: flex;
                gap: 8px;
                align-items: center;
                flex-wrap: wrap;
                background: #fff;
                border: 1px solid #d7e0ea;
                border-radius: 10px;
                padding: 8px;
                margin-bottom: 10px;
            }

            .tv-mode .hm-actions {
                background: #111f2d;
                border-color: #274862;
            }

            .hm-actions button,
            .hm-actions label,
            .hm-actions select,
            .hm-settings-actions button,
            .hm-section-toggle {
                background: #0d5a92;
                color: white;
                border: 0;
                border-radius: 8px;
                padding: 7px 10px;
                font-weight: 800;
                cursor: pointer;
                font-size: 12px;
            }

            .hm-actions button.active-page {
                background: #071b34;
            }

            .hm-actions select {
                background: #ffffff;
                color: #0d4e7c;
                border: 1px solid #0d5a92;
            }

            .tv-mode .hm-actions select {
                background: #102235;
                color: #ffffff;
                border: 1px solid #49a6ff;
            }

            .hm-actions input[type="file"] {
                display: none;
            }

            .hm-note {
                font-size: 12px;
                color: #52606d;
            }

            .tv-mode .hm-note {
                color: #b8c7d5;
            }

            .hm-page {
                display: none;
            }

            .hm-page.active {
                display: block;
            }

            .hm-kpis {
                display: grid;
                grid-template-columns: repeat(6, minmax(120px, 1fr));
                gap: 8px;
                margin: 8px 0 12px;
            }

            .hm-kpi {
                background: #ffffff;
                border: 1px solid #d7e0ea;
                border-radius: 10px;
                padding: 8px 9px;
            }

            .tv-mode .hm-kpi {
                background: #111f2d;
                border-color: #274862;
            }

            .hm-kpi-label {
                font-size: 11px;
                color: #52606d;
                text-transform: uppercase;
                font-weight: 800;
            }

            .tv-mode .hm-kpi-label {
                color: #9fb1c3;
            }

            .hm-kpi-value {
                font-size: 19px;
                font-weight: 900;
                margin-top: 3px;
            }

            .hm-section-title-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin: 13px 0 7px;
            }

            .hm-section-title {
                font-weight: 900;
                color: #0b4d7a;
                font-size: 16px;
            }

            .tv-mode .hm-section-title {
                color: #66c2ff;
            }

            .hm-table-wrap {
                overflow: auto;
                border: 1px solid #d7e0ea;
                border-radius: 10px;
                background: #ffffff;
                margin-bottom: 12px;
            }

            .tv-mode .hm-table-wrap {
                background: #101d2a;
                border-color: #274862;
            }

            table.hm-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                font-size: 12px;
                min-width: 1260px;
            }

            .big-text table.hm-table {
                font-size: 14px;
            }

            .hm-table th {
                background: #163f63;
                color: white;
                padding: 7px 6px;
                border-right: 1px solid rgba(255, 255, 255, .15);
                position: sticky;
                top: 0;
                z-index: 2;
                text-align: center;
            }

            .hm-table td {
                padding: 6px;
                border-bottom: 1px solid #e5ebf1;
                border-right: 1px solid #edf2f7;
                text-align: right;
                white-space: nowrap;
                background: #ffffff;
            }

            .hm-table td.left {
                text-align: left;
            }

            .tv-mode .hm-table td {
                background: #142334;
                color: #edf6ff;
                border-color: #274862;
            }

            .hm-table tr.summary td {
                background: #e7f1fb;
                font-weight: 900;
                position: sticky;
                top: 31px;
                z-index: 1;
            }

            .tv-mode .hm-table tr.summary td {
                background: #243b53;
                color: #ffffff;
            }

            .hm-table tr.dnr td {
                background: #d9d9d9 !important;
                color: #666666 !important;
                text-decoration: line-through;
            }

            .hm-focus-cell {
                background: #fff1b8 !important;
                color: #111111 !important;
            }

            .hm-late-flag {
                display: inline-block;
                margin-left: 6px;
                background: #d92323;
                color: #ffffff;
                border-radius: 999px;
                padding: 2px 7px;
                font-size: 11px;
                font-weight: 900;
                text-decoration: none !important;
            }

            .hm-settings-page {
                background: #ffffff;
                border: 1px solid #d7e0ea;
                padding: 14px;
                border-radius: 10px;
                margin-bottom: 12px;
            }

            .tv-mode .hm-settings-page {
                background: #111f2d;
                border-color: #274862;
            }

            .hm-settings-section {
                border: 1px solid #d7e0ea;
                border-radius: 10px;
                padding: 12px;
                margin: 12px 0;
                background: #f9fbfd;
            }

            .tv-mode .hm-settings-section {
                background: #102235;
                border-color: #274862;
            }

            .hm-settings-section-title {
                font-size: 15px;
                font-weight: 900;
                color: #0b4d7a;
                margin-bottom: 8px;
            }

            .tv-mode .hm-settings-section-title {
                color: #66c2ff;
            }

            .hm-settings-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }

            .hm-settings-grid.two {
                grid-template-columns: repeat(2, 1fr);
            }

            .hm-settings input,
            .hm-settings textarea,
            .hm-settings-page input,
            .hm-settings-page textarea {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #c8d4df;
                border-radius: 6px;
                padding: 6px;
                font-size: 12px;
                color: #1b2530;
                background: #ffffff;
            }

            .hm-settings-page input[type="checkbox"] {
                width: auto;
                margin-right: 6px;
            }

            .big-text .hm-settings-page input,
            .big-text .hm-settings-page textarea {
                font-size: 14px;
            }

            .tv-mode .hm-settings-page input,
            .tv-mode .hm-settings-page textarea {
                color: #ffffff;
                background: #102235;
                border-color: #274862;
            }

            .hm-settings textarea,
            .hm-settings-page textarea {
                height: 76px;
                resize: vertical;
            }

            .hm-zone-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(260px, 1fr));
                gap: 12px;
            }

            .hm-zone-card {
                border: 1px solid #d7e0ea;
                background: #ffffff;
                border-radius: 10px;
                padding: 10px;
            }

            .tv-mode .hm-zone-card {
                background: #0b1622;
                border-color: #274862;
            }

            .hm-settings-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                position: sticky;
                bottom: 0;
                background: inherit;
                padding-top: 10px;
            }

            .hm-danger {
                background: #071b34 !important;
            }

            .hm-close-btn {
                background: #ffffff;
                color: #0d4e7c;
                border: 0;
                border-radius: 6px;
                padding: 5px 9px;
                font-weight: 900;
                cursor: pointer;
            }

            .hm-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 999px;
                background: #dceeff;
                color: #0b4d7a;
                font-weight: 800;
                font-size: 11px;
            }

            .hm-top-area {
                font-weight: 900;
            }

            .hm-not-allocated-box {
                background: #ffffff;
                border: 1px solid #d7e0ea;
                border-radius: 10px;
                padding: 10px;
                margin-bottom: 10px;
            }

            .tv-mode .hm-not-allocated-box {
                background: #111f2d;
                border-color: #274862;
            }
        `;

        document.head.appendChild(style);

        const toggle = document.createElement('button');
        toggle.id = 'sat9HeatmapToggle';
        toggle.textContent = 'HEATMAP';
        document.body.appendChild(toggle);

        const panel = document.createElement('div');
        panel.id = 'sat9HeatmapPanel';

        if (tvMode) panel.classList.add('tv-mode');
        if (bigTextMode) panel.classList.add('big-text');

        panel.innerHTML = `
            <div id="sat9HeatmapHeader">
                <div class="hm-header-left">
                    <div class="hm-header-title">IB Dock Console HeatMap</div>
                    <div class="hm-header-sub" id="hmHeaderSub">CSV Import</div>
                </div>

                <div class="hm-header-right">
                    <span>V${SCRIPT_VERSION}</span>
                    <span>Last Updated: ${LAST_UPDATED}</span>
                    <button id="sat9HeatmapClose" class="hm-close-btn">X</button>
                </div>
            </div>

            <div id="sat9HeatmapBody">
                <div class="hm-actions">
                    <button id="sat9HeatmapPageBtn" class="active-page">Heatmap</button>
                    <button id="sat9SettingsPageBtn">Settings</button>

                    <label for="sat9CsvFile">Upload Export Inbound Volume CSV</label>
                    <input id="sat9CsvFile" type="file" accept=".csv,text/csv">

                    <select id="hmFocusZone"></select>

                    <button id="sat9TvModeBtn">${tvMode ? 'Standard View' : 'TV / Dark View'}</button>
                    <button id="sat9TextSizeBtn">${bigTextMode ? 'Normal Text Size' : 'Big Text Size'}</button>
                    <button id="sat9ClearDnrBtn">Clear Do Not Run</button>

                    <span class="hm-note">
                        CSV is processed locally. Settings open on their own page.
                    </span>
                </div>

                <div id="sat9HeatmapPage" class="hm-page active">
                    <div id="sat9HeatmapOutput">
                        <div class="hm-note">
                            Upload your Export Inbound Volume CSV to build the heatmap.
                        </div>
                    </div>
                </div>

                <div id="sat9SettingsPage" class="hm-page">
                    <div id="sat9SettingsBox" class="hm-settings-page"></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        toggle.onclick = () => {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        };

        document.getElementById('sat9HeatmapClose').onclick = () => {
            panel.style.display = 'none';
        };

        document.getElementById('sat9CsvFile').addEventListener('change', handleFile);
        document.getElementById('sat9HeatmapPageBtn').onclick = () => showPage('heatmap');
        document.getElementById('sat9SettingsPageBtn').onclick = () => showPage('settings');
        document.getElementById('sat9TvModeBtn').onclick = toggleTvMode;
        document.getElementById('sat9TextSizeBtn').onclick = toggleTextSize;

        document.getElementById('sat9ClearDnrBtn').onclick = () => {
            doNotRun = {};
            saveDoNotRun();
            render();
        };

        buildFocusDropdown();
        buildSettingsBox();
    }

    function showPage(page) {
        activePage = page;

        document.getElementById('sat9HeatmapPage').classList.toggle('active', page === 'heatmap');
        document.getElementById('sat9SettingsPage').classList.toggle('active', page === 'settings');

        document.getElementById('sat9HeatmapPageBtn').classList.toggle('active-page', page === 'heatmap');
        document.getElementById('sat9SettingsPageBtn').classList.toggle('active-page', page === 'settings');
    }

    function buildFocusDropdown() {
        const select = document.getElementById('hmFocusZone');

        if (!select) return;

        const zones = ['All Zones', ...settings.zones.map(z => z.name), 'Not Allocated'];

        select.innerHTML = zones.map(z =>
            `<option value="${escapeHtml(z)}" ${focusZone === z ? 'selected' : ''}>Focus: ${escapeHtml(z)}</option>`
        ).join('');

        if (!zones.includes(focusZone)) {
            focusZone = 'All Zones';
            localStorage.setItem(FOCUS_KEY, focusZone);
        }

        select.value = focusZone;

        select.onchange = () => {
            focusZone = select.value;
            localStorage.setItem(FOCUS_KEY, focusZone);
            render();
        };
    }

    function toggleTvMode() {
        tvMode = !tvMode;

        localStorage.setItem(VIEW_KEY, String(tvMode));

        document.getElementById('sat9HeatmapPanel').classList.toggle('tv-mode', tvMode);

        document.getElementById('sat9TvModeBtn').textContent = tvMode
            ? 'Standard View'
            : 'TV / Dark View';
    }

    function toggleTextSize() {
        bigTextMode = !bigTextMode;

        localStorage.setItem(BIG_TEXT_KEY, String(bigTextMode));

        document.getElementById('sat9HeatmapPanel').classList.toggle('big-text', bigTextMode);

        document.getElementById('sat9TextSizeBtn').textContent = bigTextMode
            ? 'Normal Text Size'
            : 'Big Text Size';
    }

    function resetSettings() {
        if (!confirm('Reset saved heatmap settings back to the default setup?')) return;

        localStorage.removeItem(STORAGE_KEY);

        settings = loadSettings();

        buildFocusDropdown();
        buildSettingsBox();
        render();
    }

    function handleFile(event) {
        const file = event.target.files[0];

        if (!file) return;

        lastFileName = file.name;

        const reader = new FileReader();

        reader.onload = e => {
            parsedRows = parseCSV(e.target.result);
            render();
            showPage('heatmap');
        };

        reader.readAsText(file);
    }

    function buildSettingsBox() {
        const box = document.getElementById('sat9SettingsBox');

        box.innerHTML = `
            <div class="hm-section-title">Settings</div>

            <div class="hm-note">
                Use this page to control what is included in the summary, column mapping, late arrival flag, active dock doors, and zone chute lists.
            </div>

            <div class="hm-settings-section">
                <div class="hm-settings-section-title">General</div>

                <div class="hm-settings-grid two">
                    <label>
                        <input id="hmIncludeCompleted" type="checkbox" ${settings.includeCompletedInSummary ? 'checked' : ''}>
                        Include Completed trailers in top summary total
                    </label>

                    <label>Future CPT Time
                        <input id="hmFutureCptTime" type="time" value="${escapeHtml(settings.futureCptTime || '07:00')}">
                    </label>

                    <label>Late Arrival Cutoff Time
                        <input id="hmLateArrivalCutoffTime" type="time" value="${escapeHtml(settings.lateArrivalCutoffTime || '')}">
                    </label>

                    <div class="hm-note">
                        Late Arrival Cutoff is optional. If blank, no red late flag will show.
                    </div>
                </div>
            </div>

            <div class="hm-settings-section">
                <div class="hm-settings-section-title">Column Mapping</div>

                <div class="hm-settings-grid">
                    <label>VRID
                        <input id="hmColVrid" value="${escapeHtml(settings.columns.vrid)}">
                    </label>

                    <label>Status
                        <input id="hmColStatus" value="${escapeHtml(settings.columns.status || 'B')}">
                    </label>

                    <label>Location / DD
                        <input id="hmColLocation" value="${escapeHtml(settings.columns.location)}">
                    </label>

                    <label>Load Route
                        <input id="hmColRoute" value="${escapeHtml(settings.columns.loadRoute)}">
                    </label>

                    <label>Load Arrival Time
                        <input id="hmColLoadArrival" value="${escapeHtml(settings.columns.loadArrival || 'E')}">
                    </label>

                    <label>Chute
                        <input id="hmColChute" value="${escapeHtml(settings.columns.chute)}">
                    </label>

                    <label>Package Count
                        <input id="hmColPkg" value="${escapeHtml(settings.columns.packageCount)}">
                    </label>

                    <label>CPT
                        <input id="hmColCpt" value="${escapeHtml(settings.columns.cpt)}">
                    </label>
                </div>
            </div>

            <div class="hm-settings-section">
                <div class="hm-settings-section-title">Active Dock Doors</div>

                <div class="hm-note">One dock door per line or comma-separated.</div>
                <textarea id="hmActiveDD">${escapeHtml(settings.activeDockDoors.join('\n'))}</textarea>
            </div>

            <div class="hm-settings-section">
                <div class="hm-settings-section-title">Zone Chute Lists</div>

                <div class="hm-note">
                    One chute per line or comma-separated. Any chute removed from these lists will show under Not Allocated.
                </div>

                <div id="hmZoneEditors" class="hm-zone-grid"></div>
            </div>

            <div class="hm-settings-actions">
                <button id="hmSaveSettings">Save Settings</button>
                <button id="sat9ResetBtn" class="hm-danger">Reset Settings</button>
            </div>
        `;

        const grid = document.getElementById('hmZoneEditors');

        settings.zones.forEach((zone, i) => {
            const card = document.createElement('div');
            card.className = 'hm-zone-card';

            card.innerHTML = `
                <label><b>Zone Name</b>
                    <input data-zone-name="${i}" value="${escapeHtml(zone.name)}">
                </label>

                <div class="hm-note">${(zone.chutes || []).length} chute(s)</div>

                <textarea data-zone-chutes="${i}">${escapeHtml((zone.chutes || []).join('\n'))}</textarea>
            `;

            grid.appendChild(card);
        });

        document.getElementById('hmSaveSettings').onclick = saveSettingsFromUI;
        document.getElementById('sat9ResetBtn').onclick = resetSettings;
    }

    function saveSettingsFromUI() {
        settings.includeCompletedInSummary = document.getElementById('hmIncludeCompleted').checked;
        settings.futureCptTime = document.getElementById('hmFutureCptTime').value || '07:00';
        settings.lateArrivalCutoffTime = document.getElementById('hmLateArrivalCutoffTime').value || '';

        settings.activeDockDoors = splitList(document.getElementById('hmActiveDD').value)
            .map(x => x.toUpperCase());

        settings.columns = {
            vrid: document.getElementById('hmColVrid').value.trim().toUpperCase(),
            status: document.getElementById('hmColStatus').value.trim().toUpperCase(),
            location: document.getElementById('hmColLocation').value.trim().toUpperCase(),
            loadRoute: document.getElementById('hmColRoute').value.trim().toUpperCase(),
            loadArrival: document.getElementById('hmColLoadArrival').value.trim().toUpperCase(),
            chute: document.getElementById('hmColChute').value.trim().toUpperCase(),
            packageCount: document.getElementById('hmColPkg').value.trim().toUpperCase(),
            cpt: document.getElementById('hmColCpt').value.trim().toUpperCase()
        };

        settings.zones = settings.zones.map((zone, i) => ({
            name: document.querySelector(`[data-zone-name="${i}"]`).value.trim() || zone.name,
            chutes: splitList(document.querySelector(`[data-zone-chutes="${i}"]`).value)
                .map(x => x.toUpperCase())
        }));

        saveSettings();

        buildFocusDropdown();
        buildSettingsBox();

        alert('Settings saved. Heatmap has been rebuilt using the updated settings.');

        render();
        showPage('heatmap');
    }

    function getRowsForTopSummary(data) {
        const baseRows = [
            ...data.main,
            ...data.yard,
            ...data.manifested
        ].filter(x => !x.doNotRun);

        if (settings.includeCompletedInSummary) {
            return [...baseRows, ...data.completed];
        }

        return baseRows;
    }

    function render() {
        const output = document.getElementById('sat9HeatmapOutput');

        if (!output) return;

        if (!parsedRows.length) {
            output.innerHTML = `
                <div class="hm-note">
                    Upload your Export Inbound Volume CSV to build the heatmap.
                </div>
            `;
            return;
        }

        const data = buildData(parsedRows);

        const summaryRows = getRowsForTopSummary(data);
        const total = summaryRows.reduce((sum, x) => sum + x.total, 0);
        const current = summaryRows.reduce((sum, x) => sum + x.current, 0);
        const future = summaryRows.reduce((sum, x) => sum + x.future, 0);

        const ibTotal = data.main.filter(x => !x.doNotRun).reduce((sum, x) => sum + x.total, 0);
        const yardTotal = data.yard.filter(x => !x.doNotRun).reduce((sum, x) => sum + x.total, 0);
        const manifestedTotal = data.manifested.filter(x => !x.doNotRun).reduce((sum, x) => sum + x.total, 0);
        const completedTotal = data.completed.reduce((sum, x) => sum + x.total, 0);

        const allRows = [...data.main, ...data.yard, ...data.manifested, ...data.completed];
        const lateCount = allRows.filter(x => x.hasLateArrival).length;

        const focusTotal = focusZone === 'All Zones'
            ? total
            : summaryRows.reduce((sum, x) => sum + (x.areas[focusZone] || 0), 0);

        document.getElementById('hmHeaderSub').textContent = lastFileName
            ? `Loaded: ${lastFileName}`
            : 'CSV Import';

        output.innerHTML = `
            <div class="hm-kpis">
                <div class="hm-kpi">
                    <div class="hm-kpi-label">Total Included Pkg</div>
                    <div class="hm-kpi-value">${fmt(total)}</div>
                </div>

                <div class="hm-kpi">
                    <div class="hm-kpi-label">IB / Yard</div>
                    <div class="hm-kpi-value">${fmt(ibTotal)} / ${fmt(yardTotal)}</div>
                </div>

                <div class="hm-kpi">
                    <div class="hm-kpi-label">Manifested</div>
                    <div class="hm-kpi-value">${fmt(manifestedTotal)}</div>
                </div>

                <div class="hm-kpi">
                    <div class="hm-kpi-label">Completed</div>
                    <div class="hm-kpi-value">${fmt(completedTotal)}</div>
                </div>

                <div class="hm-kpi">
                    <div class="hm-kpi-label">Current / Future</div>
                    <div class="hm-kpi-value">${fmt(current)} / ${fmt(future)}</div>
                </div>

                <div class="hm-kpi">
                    <div class="hm-kpi-label">Focus / Late</div>
                    <div class="hm-kpi-value">${focusZone === 'All Zones' ? 'All' : fmt(focusTotal)} / ${fmt(lateCount)}</div>
                </div>
            </div>

            <div class="hm-note">
                Completed is ${settings.includeCompletedInSummary ? '<b>included</b>' : '<b>not included</b>'} in the top summary total.
                Manifested rows can be excluded using Do Not Run.
            </div>

            ${renderTable('IB Area Heatmap', data.main, { showLocation: true, showDoNotRun: true })}
            ${renderTable('Yard / PS Trailer View', data.yard, { showLocation: true, showDoNotRun: true })}
            ${renderTable('Manifested', data.manifested, {
                showLocation: false,
                showDoNotRun: true,
                collapsible: true,
                open: manifestedOpen,
                key: 'manifested'
            })}
            ${renderTable('Completed', data.completed, {
                showLocation: false,
                showDoNotRun: false,
                collapsible: true,
                open: completedOpen,
                key: 'completed'
            })}
            ${renderNotAllocated(data)}
        `;

        document.querySelectorAll('.hm-dnr').forEach(cb => {
            cb.onchange = e => {
                const dnrKey = e.target.dataset.dnrKey;

                doNotRun[dnrKey] = e.target.checked;

                if (!doNotRun[dnrKey]) delete doNotRun[dnrKey];

                saveDoNotRun();
                render();
            };
        });

        document.querySelectorAll('.hm-section-toggle').forEach(btn => {
            btn.onclick = e => {
                const section = e.target.dataset.section;

                if (section === 'completed') {
                    completedOpen = !completedOpen;
                    localStorage.setItem(COMPLETED_OPEN_KEY, String(completedOpen));
                }

                if (section === 'manifested') {
                    manifestedOpen = !manifestedOpen;
                    localStorage.setItem(MANIFESTED_OPEN_KEY, String(manifestedOpen));
                }

                render();
            };
        });
    }

    function getTableSummary(rows, displayZones) {
        const summary = Object.fromEntries(displayZones.map(z => [z, 0]));

        let total = 0;
        let current = 0;
        let future = 0;

        rows.forEach(r => {
            if (r.doNotRun) return;

            displayZones.forEach(z => {
                summary[z] += r.areas[z] || 0;
            });

            total += r.total;
            current += r.current;
            future += r.future;
        });

        return { summary, total, current, future };
    }

    function renderTable(title, rows, options = {}) {
        const showLocation = options.showLocation !== false;
        const showDoNotRun = options.showDoNotRun === true;
        const collapsible = options.collapsible === true;
        const open = options.open === true;
        const sectionKey = options.key || '';

        const zoneNames = settings.zones.map(z => z.name);
        const includeNotAllocated = rows.some(r => r.areas['Not Allocated']);
        const displayZones = includeNotAllocated
            ? [...zoneNames, 'Not Allocated']
            : zoneNames;

        const tableSummary = getTableSummary(rows, displayZones);

        const headers = [
            ...(showDoNotRun ? ['Do Not Run'] : []),
            ...(showLocation ? ['Location'] : []),
            'Load Route',
            'VRID',
            'Arrival',
            ...displayZones,
            'Total',
            'Top Area',
            '% Current',
            'Current / Future',
            '# Trailers'
        ];

        const firstSummaryCells = `
            ${showDoNotRun ? '<td></td>' : ''}
            ${showLocation ? '<td class="left">TOTAL</td>' : '<td class="left">TOTAL</td>'}
            <td></td>
            <td></td>
            <td></td>
        `;

        const summaryRow = `
            <tr class="summary">
                ${firstSummaryCells}

                ${displayZones.map(z => {
                    const cls = z === focusZone ? 'hm-focus-cell' : '';
                    return `<td class="${cls}">${fmt(tableSummary.summary[z])}</td>`;
                }).join('')}

                <td>${fmt(tableSummary.total)}</td>
                <td></td>
                <td>${pct(tableSummary.current, tableSummary.total)}%</td>
                <td>${fmt(tableSummary.current)} / ${fmt(tableSummary.future)}</td>
                <td></td>
            </tr>
        `;

        const body = rows.map(r => {
            const trailerCount = r.trailerCount > 1
                ? `<span class="hm-badge">${r.trailerCount}</span>`
                : '';

            const lateFlag = r.hasLateArrival
                ? `<span class="hm-late-flag">🚩 Late</span>`
                : '';

            return `
                <tr class="${r.doNotRun ? 'dnr' : ''}">
                    ${showDoNotRun ? `
                        <td>
                            <input class="hm-dnr" type="checkbox" data-dnr-key="${escapeHtml(r.dnrKey || r.location)}" ${r.doNotRun ? 'checked' : ''}>
                        </td>
                    ` : ''}

                    ${showLocation ? `
                        <td class="left"><b>${escapeHtml(r.location)}</b></td>
                    ` : ''}

                    <td class="left">${escapeHtml(r.loadRouteDisplay || '')}</td>
                    <td class="left">${escapeHtml(r.vridDisplay || '')}</td>
                    <td class="left">${escapeHtml(r.arrivalDisplay || '')}${lateFlag}</td>

                    ${displayZones.map(z => {
                        const v = r.areas[z] || 0;
                        const isFocus = z === focusZone;
                        const cls = isFocus ? 'hm-focus-cell' : '';
                        return `<td class="${cls}">${fmt(v)}</td>`;
                    }).join('')}

                    <td><b>${fmt(r.total)}</b></td>
                    <td class="left hm-top-area">${escapeHtml(r.topArea || '')}</td>
                    <td>${pct(r.current, r.total)}%</td>
                    <td>${fmt(r.current)} / ${fmt(r.future)}</td>
                    <td>${trailerCount}</td>
                </tr>
            `;
        }).join('');

        const titleButton = collapsible
            ? `<button class="hm-section-toggle" data-section="${escapeHtml(sectionKey)}">${open ? 'Hide Details' : 'Show Details'}</button>`
            : '';

        const visibleBody = collapsible && !open
            ? ''
            : body;

        return `
            <div class="hm-section-title-row">
                <div class="hm-section-title">${escapeHtml(title)}</div>
                ${titleButton}
            </div>

            <div class="hm-table-wrap">
                <table class="hm-table">
                    <thead>
                        <tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
                    </thead>

                    <tbody>
                        ${summaryRow}
                        ${visibleBody || (!collapsible || open ? `<tr><td colspan="${headers.length}" class="left">No data found.</td></tr>` : '')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderNotAllocated(data) {
        const chutes = new Set();

        [...data.main, ...data.yard, ...data.manifested, ...data.completed].forEach(r => {
            r.notAllocatedChutes.forEach(c => chutes.add(c));
        });

        if (!chutes.size) return '';

        return `
            <div class="hm-section-title-row">
                <div class="hm-section-title">Not Allocated Chutes</div>
            </div>

            <div class="hm-not-allocated-box">
                <div class="hm-note">
                    Found in CSV but not mapped:
                    <b>${Array.from(chutes).map(escapeHtml).join(', ')}</b>
                </div>
            </div>
        `;
    }

    createPanel();

})();