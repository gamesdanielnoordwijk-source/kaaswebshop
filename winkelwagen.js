let winkelwagen = JSON.parse(localStorage.getItem("winkelwagen")) || [];

const container = document.getElementById("winkelwagen-container");
const totaalElem = document.getElementById("totaalprijs");

function berekenTotaal() {
    let totaal = 0;
    winkelwagen.forEach(item => {
        let nummerPrijs = parseFloat(item.prijs.replace("€", "").replace(",", "."));
        totaal += nummerPrijs * item.aantal;
    });
    totaalElem.innerText = "Totaal: €" + totaal.toFixed(2).replace(".", ",");
}

function toonWinkelwagen() {
    container.innerHTML = "";

    if (winkelwagen.length === 0) {
        container.innerHTML = "<p>Je winkelwagen is leeg.</p>";
        berekenTotaal();
        return;
    }

    winkelwagen.forEach((item, index) => {
        if (!item.aantal) item.aantal = 1;

        const div = document.createElement("div");
        div.classList.add("winkelwagen-item");
        const veilingItem = item.veiling === true;
        div.innerHTML = `
            <div class="item-info">
                <h2>${item.naam}</h2>
                <p>Prijs: ${item.prijs}</p>
            </div>
            <div class="item-controls">
                ${veilingItem
                    ? `<span style="font-size:13px;color:#e69634;font-style:italic;">🏆 Veilingitem (aantal vast)</span>`
                    : `<button class="minder" data-index="${index}">-</button>
                       <span>${item.aantal}</span>
                       <button class="meer" data-index="${index}">+</button>`
                }
                <button class="verwijder-knop" data-index="${index}">Verwijderen</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll(".meer").forEach(knop => {
        knop.addEventListener("click", function() {
            let index = this.getAttribute("data-index");
            winkelwagen[index].aantal++;
            updateWinkelwagen();
        });
    });

    document.querySelectorAll(".minder").forEach(knop => {
        knop.addEventListener("click", function() {
            let index = this.getAttribute("data-index");
            if (winkelwagen[index].aantal > 1) {
                winkelwagen[index].aantal--;
            } else {
                winkelwagen.splice(index, 1);
            }
            updateWinkelwagen();
        });
    });

    document.querySelectorAll(".verwijder-knop").forEach(knop => {
        knop.addEventListener("click", function() {
            let index = this.getAttribute("data-index");
            winkelwagen.splice(index, 1);
            updateWinkelwagen();
        });
    });

    berekenTotaal();
}

function updateWinkelwagen() {
    localStorage.setItem("winkelwagen", JSON.stringify(winkelwagen));
    toonWinkelwagen();
}

toonWinkelwagen();
