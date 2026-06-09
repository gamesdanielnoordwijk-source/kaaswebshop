const ADMIN_WACHTWOORD = "1234";
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='55'%3E%3Crect width='70' height='55' fill='%23ffe082'/%3E%3Ctext x='35' y='31' text-anchor='middle' fill='%23e69634' font-size='10' font-family='Arial'%3E?%3C/text%3E%3C/svg%3E";

const overlay = document.getElementById("wachtwoord-overlay");
const wwKnop = document.getElementById("ww-knop");
const wwInvoer = document.getElementById("ww-invoer");
const wwFout = document.getElementById("ww-fout");

function controleerWachtwoord() {
    if (wwInvoer.value === ADMIN_WACHTWOORD) {
        overlay.style.display = "none";
    } else {
        wwFout.textContent = "Verkeerd wachtwoord, probeer opnieuw.";
        wwInvoer.value = "";
        wwInvoer.focus();
    }
}

wwKnop.addEventListener("click", controleerWachtwoord);
wwInvoer.addEventListener("keydown", e => { if (e.key === "Enter") controleerWachtwoord(); });
wwInvoer.focus();

function getVeilingen() {
    return JSON.parse(localStorage.getItem("veilingen")) || [];
}

function slaVeilingenOp(veilingen) {
    localStorage.setItem("veilingen", JSON.stringify(veilingen));
}

function formatTijdResterend(einddatum) {
    const ms = einddatum - Date.now();
    if (ms <= 0) return "Verlopen";
    const uren = Math.floor(ms / 3600000);
    const min = Math.floor((ms % 3600000) / 60000);
    if (uren > 0) return `Nog ${uren}u ${min}m`;
    return `Nog ${min}m`;
}

function renderLijst() {
    const veilingen = getVeilingen();
    const container = document.getElementById("veilingen-lijst");

    if (veilingen.length === 0) {
        container.innerHTML = `<p class="leeg-melding">Nog geen veilingen. Maak er een aan via het formulier hierboven.</p>`;
        return;
    }

    container.innerHTML = veilingen.map((v, i) => {
        const verlopen = Date.now() >= v.einddatum;
        const badge = verlopen
            ? `<span class="badge-verlopen-klein">Gesloten</span>`
            : `<span class="badge-actief-klein">Actief</span>`;
        const winnaarTekst = verlopen && v.winnaar
            ? ` · 🏆 ${v.winnaar}`
            : verlopen && v.biedingen.length === 0
            ? ` · Geen biedingen`
            : ` · ${v.biedingen.length} bieding${v.biedingen.length !== 1 ? "en" : ""}`;

        return `
            <div class="veiling-rij">
                <img src="${v.afbeelding}" alt="${v.naam}" onerror="this.src='${PLACEHOLDER}'">
                <div class="veiling-rij-info">
                    <strong>${v.naam} ${badge}</strong>
                    <span>Startprijs: €${v.startPrijs.toFixed(2).replace(".", ",")} · Huidig bod: €${v.huidigBod.toFixed(2).replace(".", ",")} · ${verlopen ? "Verlopen" : formatTijdResterend(v.einddatum)}${winnaarTekst}</span>
                </div>
                <button class="verwijder-btn" data-index="${i}">🗑 Verwijder</button>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".verwijder-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const index = parseInt(this.getAttribute("data-index"));
            const veilingen = getVeilingen();
            const naam = veilingen[index].naam;
            if (!confirm(`Veiling "${naam}" verwijderen? Dit kan niet ongedaan worden.`)) return;
            veilingen.splice(index, 1);
            slaVeilingenOp(veilingen);
            renderLijst();
        });
    });
}

document.getElementById("v-afbeelding").addEventListener("input", function() {
    const preview = document.getElementById("v-preview");
    const url = this.value.trim();
    if (url) {
        preview.src = url;
        preview.style.display = "block";
        preview.onerror = () => preview.style.display = "none";
    } else {
        preview.style.display = "none";
    }
});

document.getElementById("aanmaken-btn").addEventListener("click", function() {
    const melding = document.getElementById("aanmaken-melding");
    melding.style.display = "none";
    melding.className = "melding";

    const naam = document.getElementById("v-naam").value.trim();
    const beschrijving = document.getElementById("v-beschrijving").value.trim();
    const afbeelding = document.getElementById("v-afbeelding").value.trim();
    const startPrijs = parseFloat(document.getElementById("v-startprijs").value);
    const stap = parseFloat(document.getElementById("v-stap").value);
    const looptijdUur = parseFloat(document.getElementById("v-looptijd").value);

    if (!naam || !beschrijving || !afbeelding) {
        melding.textContent = "Vul naam, beschrijving en afbeelding in.";
        melding.classList.add("fout");
        melding.style.display = "block";
        return;
    }

    if (isNaN(startPrijs) || startPrijs <= 0) {
        melding.textContent = "Voer een geldige startprijs in.";
        melding.classList.add("fout");
        melding.style.display = "block";
        return;
    }

    if (isNaN(stap) || stap <= 0) {
        melding.textContent = "Voer een geldige biedstap in.";
        melding.classList.add("fout");
        melding.style.display = "block";
        return;
    }

    const veilingen = getVeilingen();

    const nieuweVeiling = {
        id: "v" + Date.now(),
        naam,
        afbeelding,
        beschrijving,
        startPrijs,
        huidigBod: startPrijs,
        minimumStap: stap,
        einddatum: Date.now() + looptijdUur * 3600000,
        biedingen: [],
        winnaar: null
    };

    veilingen.push(nieuweVeiling);
    slaVeilingenOp(veilingen);

    melding.textContent = `✅ Veiling "${naam}" aangemaakt!`;
    melding.classList.add("succes");
    melding.style.display = "block";

    document.getElementById("v-naam").value = "";
    document.getElementById("v-beschrijving").value = "";
    document.getElementById("v-afbeelding").value = "";
    document.getElementById("v-startprijs").value = "";
    document.getElementById("v-stap").value = "";
    document.getElementById("v-looptijd").value = "24";
    document.getElementById("v-preview").style.display = "none";

    renderLijst();
});

renderLijst();
