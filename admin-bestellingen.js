document.addEventListener("DOMContentLoaded", function () {

const ADMIN_WACHTWOORD = "1234";

const overlay = document.getElementById("wachtwoord-overlay");
const wwKnop = document.getElementById("ww-knop");
const wwInvoer = document.getElementById("ww-invoer");
const wwFout = document.getElementById("ww-fout");

function controleerWachtwoord() {
    if (wwInvoer.value === ADMIN_WACHTWOORD) {
        overlay.style.display = "none";
        renderBestellingen();
    } else {
        wwFout.textContent = "Verkeerd wachtwoord, probeer opnieuw.";
        wwInvoer.value = "";
        wwInvoer.focus();
    }
}

wwKnop.addEventListener("click", controleerWachtwoord);
wwInvoer.addEventListener("keydown", function(e) { if (e.key === "Enter") controleerWachtwoord(); });
wwInvoer.focus();


function laadBestellingen() {
    return JSON.parse(localStorage.getItem("bestellingen")) || {};
}

function renderBestellingen() {
    const bestellingen = laadBestellingen();
    const container = document.getElementById("bestellingen-container");
    const telElem = document.getElementById("totaal-bestellingen");

    const alleBestellingen = [];
    for (const gebruiker in bestellingen) {
        bestellingen[gebruiker].forEach(b => {
            alleBestellingen.push({ gebruiker, ...b });
        });
    }

    alleBestellingen.sort((a, b) => new Date(b.datum) - new Date(a.datum));
    telElem.textContent = alleBestellingen.length;

    if (alleBestellingen.length === 0) {
        container.innerHTML = `<div class="leeg">📭 Nog geen bestellingen geplaatst.</div>`;
        return;
    }

    container.innerHTML = alleBestellingen.map((b, i) => `
        <div class="bestelling-kaart">
            <div class="bestelling-header">
                <span class="bestelling-nr">Bestelling #${alleBestellingen.length - i}</span>
                <span class="bestelling-datum">${b.datum}</span>
                <span class="bestelling-totaal">${b.totaal}</span>
            </div>
            <div class="bestelling-body">
                <div class="klant-info">
                    <strong>👤 Klant</strong>
                    <p>${b.klant.naam}</p>
                    <p>${b.klant.email}</p>
                    <p>${b.klant.adres}, ${b.klant.postcode} ${b.klant.plaats}</p>
                    <p style="font-size:12px;color:#888;">Account: ${b.gebruiker}</p>
                </div>
                <div class="items-lijst">
                    <strong>🛒 Items</strong>
                    ${b.items.map(item => `
                        <div class="bestelling-item">
                            <span>${item.naam}${item.veiling ? " 🏆" : ""}</span>
                            <span>${item.veiling ? "" : `x${item.aantal} · `}${item.prijs}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `).join("");
}

}); 
