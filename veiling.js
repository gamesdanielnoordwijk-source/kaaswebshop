/* Verwijder oude geseedde veilingen die automatisch waren aangemaakt */
if (localStorage.getItem("veilingen-geseed")) {
    localStorage.removeItem("veilingen");
    localStorage.removeItem("veilingen-geseed");
}

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='180'%3E%3Crect width='260' height='180' fill='%23ffe082'/%3E%3Ctext x='130' y='95' text-anchor='middle' fill='%23e69634' font-size='14' font-family='Arial'%3EGeen afbeelding%3C/text%3E%3C/svg%3E";

function formatTijd(ms) {
    if (ms <= 0) return "Verlopen";
    const totaalSec = Math.floor(ms / 1000);
    const dagen = Math.floor(totaalSec / 86400);
    const uren = Math.floor((totaalSec % 86400) / 3600);
    const min = Math.floor((totaalSec % 3600) / 60);
    const sec = totaalSec % 60;

    if (dagen > 0) return `${dagen}d ${uren}u ${min}m ${sec}s`;
    if (uren > 0) return `${uren}u ${min}m ${sec}s`;
    return `${min}m ${sec}s`;
}

function controleerWinnaars() {
    const veilingen = JSON.parse(localStorage.getItem("veilingen")) || [];
    let gewijzigd = false;

    veilingen.forEach(v => {
        if (!v.winnaar && Date.now() >= v.einddatum && v.biedingen.length > 0) {
            v.winnaar = v.biedingen[0].gebruiker;
            gewijzigd = true;
        }
    });

    if (gewijzigd) localStorage.setItem("veilingen", JSON.stringify(veilingen));
}

function renderVeilingen() {
    controleerWinnaars();
    const veilingen = JSON.parse(localStorage.getItem("veilingen")) || [];
    const container = document.getElementById("veilingen-container");
    container.innerHTML = "";

    if (veilingen.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 20px;">
                <p style="font-size:48px;margin:0;">🧀</p>
                <h3 style="margin:12px 0 8px;">Nog geen veilingen</h3>
                <p style="color:#666;margin:0 0 20px;">Er zijn momenteel geen actieve veilingen.<br>Klik op de knop hieronder om er een aan te maken.</p>
                <a href="veiling-beheer.html" style="background:linear-gradient(135deg,#ff9800,#ff6f00);color:white;padding:14px 24px;border-radius:14px;font-weight:bold;font-size:16px;text-decoration:none;display:inline-block;box-shadow:0 5px 15px rgba(0,0,0,0.15);">⚙️ Veilingen beheren</a>
            </div>
        `;
        return;
    }

    veilingen.forEach(v => {
        const nu = Date.now();
        const resterend = v.einddatum - nu;
        const verlopen = resterend <= 0;

        const kaart = document.createElement("div");
        kaart.classList.add("veiling-kaart");

        const badgeHTML = verlopen
            ? `<span class="badge-verlopen">Gesloten</span>`
            : `<span class="badge-actief">● Actief</span>`;

        const winHtml = verlopen && v.winnaar
            ? `<div style="color:#2e7d32;font-weight:bold;margin:6px 0;">🏆 Gewonnen door: ${v.winnaar}</div>`
            : verlopen && v.biedingen.length === 0
            ? `<div style="color:#888;margin:6px 0;">Geen biedingen</div>`
            : "";

        kaart.innerHTML = `
            <img src="${v.afbeelding}" alt="${v.naam}" onerror="this.src='${PLACEHOLDER}'">
            ${badgeHTML}
            <h2 style="margin:8px 0;font-size:20px;">${v.naam}</h2>
            <div class="huidig-bod">€${v.huidigBod.toFixed(2).replace(".", ",")}</div>
            <div class="countdown ${verlopen ? "verlopen" : ""}" id="cd-${v.id}">
                ${verlopen ? "⏰ Verlopen" : "⏳ " + formatTijd(resterend)}
            </div>
            ${winHtml}
            <div class="aantal-biedingen">${v.biedingen.length} bieding${v.biedingen.length !== 1 ? "en" : ""}</div>
            <a href="veiling-detail.html?id=${v.id}" class="bied-knop ${verlopen ? "disabled" : ""}">
                ${verlopen ? "Bekijk resultaat" : "🔨 Bied mee"}
            </a>
        `;

        container.appendChild(kaart);
    });
}

renderVeilingen();

setInterval(() => {
    const veilingen = JSON.parse(localStorage.getItem("veilingen")) || [];
    controleerWinnaars();

    veilingen.forEach(v => {
        const el = document.getElementById("cd-" + v.id);
        if (!el) return;
        const resterend = v.einddatum - Date.now();
        if (resterend <= 0) {
            el.textContent = "⏰ Verlopen";
            el.classList.add("verlopen");
        } else {
            el.textContent = "⏳ " + formatTijd(resterend);
        }
    });
}, 1000);
