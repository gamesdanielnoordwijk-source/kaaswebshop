const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ffe082'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='%23e69634' font-size='16' font-family='Arial'%3EGeen afbeelding%3C/text%3E%3C/svg%3E";

function getParam(naam) {
    return new URLSearchParams(window.location.search).get(naam);
}

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

function laadVeiling(id) {
    const veilingen = JSON.parse(localStorage.getItem("veilingen")) || [];
    return veilingen.find(v => v.id === id) || null;
}

function slaVeilingOp(bijgewerkt) {
    const veilingen = JSON.parse(localStorage.getItem("veilingen")) || [];
    const index = veilingen.findIndex(v => v.id === bijgewerkt.id);
    if (index !== -1) veilingen[index] = bijgewerkt;
    localStorage.setItem("veilingen", JSON.stringify(veilingen));
}

function voegWinnaarToeAanWinkelwagen(v) {
    const gebruiker = localStorage.getItem("huidigeGebruiker");
    if (!gebruiker || gebruiker !== v.winnaar) return;

    const sleutel = `veiling-gewonnen-${v.id}`;
    if (localStorage.getItem(sleutel)) return;

    const winkelwagen = JSON.parse(localStorage.getItem("winkelwagen")) || [];
    winkelwagen.push({
        naam: `${v.naam} (gewonnen veiling)`,
        prijs: `€${v.huidigBod.toFixed(2).replace(".", ",")}`,
        aantal: 1,
        veiling: true
    });
    localStorage.setItem("winkelwagen", JSON.stringify(winkelwagen));
    localStorage.setItem(sleutel, "true");
}

function renderDetail(v) {
    const container = document.getElementById("veiling-detail");
    const nu = Date.now();
    const resterend = v.einddatum - nu;
    const verlopen = resterend <= 0;

    let winHtml = "";
    if (verlopen) {
        if (v.winnaar) {
            voegWinnaarToeAanWinkelwagen(v);
            const ikWon = localStorage.getItem("huidigeGebruiker") === v.winnaar;
            winHtml = `<div class="winnaar-banner">🏆 Gewonnen door: ${v.winnaar} met €${v.huidigBod.toFixed(2).replace(".", ",")}${ikWon ? " — <a href='winkelwagen.html' style='color:#fff;text-decoration:underline;'>Ga naar winkelwagen →</a>" : ""}</div>`;
        } else {
            winHtml = `<div class="winnaar-banner" style="background:linear-gradient(135deg,#9e9e9e,#757575);">Geen biedingen — veiling gesloten</div>`;
        }
    }

    const gebruiker = localStorage.getItem("huidigeGebruiker");
    const ingelogd = localStorage.getItem("ingelogd") === "true" && gebruiker;
    const minimumVolgend = (v.huidigBod + v.minimumStap).toFixed(2);

    let biedSectie = "";
    if (!verlopen) {
        if (ingelogd) {
            biedSectie = `
                <div class="bied-sectie">
                    <h3>Doe een bod</h3>
                    <p style="margin:0 0 12px;color:#555;">Minimum bod: <strong>€${minimumVolgend.replace(".", ",")}</strong> (stap: €${v.minimumStap.toFixed(2).replace(".", ",")})</p>
                    <div class="bied-rij">
                        <input type="number" id="bod-input" placeholder="Jouw bod in €" step="${v.minimumStap}" min="${minimumVolgend}">
                        <button id="bied-knop">🔨 Bied</button>
                    </div>
                    <div class="melding-inline" id="bied-melding"></div>
                </div>
            `;
        } else {
            biedSectie = `
                <div class="bied-sectie">
                    <p style="margin:0;"><strong>Log in</strong> om mee te bieden. <a href="index.html" style="color:#e65100;">Ga naar de shop</a> en log in via de knop rechtsboven.</p>
                </div>
            `;
        }
    }

    const biedingenHtml = v.biedingen.length === 0
        ? `<p style="color:#888;">Nog geen biedingen. Wees de eerste!</p>`
        : v.biedingen.map((b, i) => `
            <div class="bied-item">
                <span class="bied-naam">${i === 0 ? "🥇 " : ""}${b.gebruiker}</span>
                <span class="bied-bedrag">€${b.bod.toFixed(2).replace(".", ",")}</span>
                <span class="bied-tijd">${b.datum}</span>
            </div>
        `).join("");

    container.innerHTML = `
        <img src="${v.afbeelding}" alt="${v.naam}" onerror="this.src='${PLACEHOLDER}'">
        <h2 style="font-size:28px;margin:0 0 6px;">${v.naam}</h2>
        <p style="color:#555;margin:0 0 14px;">${v.beschrijving}</p>

        <div style="margin-bottom:10px;">
            <span style="font-size:16px;color:#888;">Huidig hoogste bod:</span>
            <div class="huidig-bod-groot" id="huidig-bod-display">€${v.huidigBod.toFixed(2).replace(".", ",")}</div>
        </div>

        <div class="countdown-groot ${verlopen ? "verlopen" : ""}" id="countdown-display">
            ${verlopen ? "⏰ Veiling gesloten" : "⏳ " + formatTijd(resterend)}
        </div>

        ${winHtml}
        ${biedSectie}

        <div class="biedingen-lijst">
            <h3>Biedgeschiedenis</h3>
            <div id="biedingen-lijst">${biedingenHtml}</div>
        </div>
    `;

    if (!verlopen && ingelogd) {
        document.getElementById("bied-knop").addEventListener("click", function() {
            const input = document.getElementById("bod-input");
            const melding = document.getElementById("bied-melding");
            const bod = parseFloat(input.value);

            melding.style.display = "none";
            melding.className = "melding-inline";

            if (isNaN(bod) || bod <= 0) {
                melding.textContent = "Voer een geldig bedrag in.";
                melding.classList.add("fout");
                melding.style.display = "block";
                return;
            }

            const minBod = v.huidigBod + v.minimumStap;
            if (bod < minBod) {
                melding.textContent = `Bod moet minimaal €${minBod.toFixed(2).replace(".", ",")} zijn.`;
                melding.classList.add("fout");
                melding.style.display = "block";
                return;
            }

            const gebruikerNaam = localStorage.getItem("huidigeGebruiker");
            const huidigVerlopen = v.einddatum - Date.now() <= 0;
            if (huidigVerlopen) {
                melding.textContent = "De veiling is inmiddels gesloten.";
                melding.classList.add("fout");
                melding.style.display = "block";
                return;
            }

            v.huidigBod = bod;
            v.biedingen.unshift({
                gebruiker: gebruikerNaam,
                bod: bod,
                datum: new Date().toLocaleString("nl-NL")
            });

            slaVeilingOp(v);

            melding.textContent = `✅ Bod van €${bod.toFixed(2).replace(".", ",")} geplaatst!`;
            melding.classList.add("succes");
            melding.style.display = "block";

            input.value = "";

            document.getElementById("huidig-bod-display").textContent = `€${bod.toFixed(2).replace(".", ",")}`;

            const nieuwMinimum = (bod + v.minimumStap).toFixed(2);
            input.min = nieuwMinimum;
            input.step = v.minimumStap;
            document.querySelector(".bied-sectie p strong").textContent = `€${nieuwMinimum.replace(".", ",")}`;

            const biedingenContainer = document.getElementById("biedingen-lijst");
            const nieuwItem = document.createElement("div");
            nieuwItem.className = "bied-item";
            nieuwItem.innerHTML = `
                <span class="bied-naam">🥇 ${gebruikerNaam}</span>
                <span class="bied-bedrag">€${bod.toFixed(2).replace(".", ",")}</span>
                <span class="bied-tijd">${new Date().toLocaleString("nl-NL")}</span>
            `;

            const oudeEerste = biedingenContainer.querySelector(".bied-item");
            if (oudeEerste) {
                oudeEerste.querySelector(".bied-naam").textContent = oudeEerste.querySelector(".bied-naam").textContent.replace("🥇 ", "");
            }

            biedingenContainer.insertBefore(nieuwItem, biedingenContainer.firstChild);
        });
    }
}

const id = getParam("id");

if (!id) {
    document.getElementById("veiling-detail").innerHTML = "<p>Geen veiling gevonden. <a href='veiling.html'>Terug naar veilingen</a></p>";
} else {
    const v = laadVeiling(id);
    if (!v) {
        document.getElementById("veiling-detail").innerHTML = "<p>Veiling bestaat niet. <a href='veiling.html'>Terug naar veilingen</a></p>";
    } else {
        renderDetail(v);

        setInterval(() => {
            const bijgewerkt = laadVeiling(id);
            if (!bijgewerkt) return;

            const resterend = bijgewerkt.einddatum - Date.now();
            const el = document.getElementById("countdown-display");
            if (!el) return;

            if (resterend <= 0) {
                el.textContent = "⏰ Veiling gesloten";
                el.classList.add("verlopen");
                if (!bijgewerkt.winnaar && bijgewerkt.biedingen.length > 0) {
                    bijgewerkt.winnaar = bijgewerkt.biedingen[0].gebruiker;
                    slaVeilingOp(bijgewerkt);
                    voegWinnaarToeAanWinkelwagen(bijgewerkt);
                    renderDetail(bijgewerkt);
                }
            } else {
                el.textContent = "⏳ " + formatTijd(resterend);
            }
        }, 1000);
    }
}
