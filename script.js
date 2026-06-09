document.addEventListener("DOMContentLoaded", function() {

    let winkelwagen = JSON.parse(localStorage.getItem("winkelwagen")) || [];
    let knoppen = document.querySelectorAll(".koop-knop");

    knoppen.forEach(function(knop) {
        knop.addEventListener("click", function() {
            let product = knop.parentElement;
            let naam = product.querySelector("h2").innerText;
            let prijs = product.querySelector(".prijs").innerText;
            let item = { naam, prijs, aantal: 1 };

            winkelwagen.push(item);
            localStorage.setItem("winkelwagen", JSON.stringify(winkelwagen));

            let img = product.querySelector("img");
            let clone = img.cloneNode(true);
            let rect = img.getBoundingClientRect();

            clone.style.position = "absolute";
            clone.style.left = rect.left + window.scrollX + "px";
            clone.style.top = rect.top + window.scrollY + "px";
            clone.style.width = rect.width + "px";
            clone.style.transition = "all 0.8s ease";
            clone.style.zIndex = "9999";

            document.body.appendChild(clone);

            let cart = document.getElementById("winkelwagen-knop");
            if (cart) {
                let cartRect = cart.getBoundingClientRect();
                setTimeout(() => {
                    clone.style.left = cartRect.left + window.scrollX + "px";
                    clone.style.top = cartRect.top + window.scrollY + "px";
                    clone.style.width = "20px";
                    clone.style.opacity = "0.3";
                }, 10);
            }

            setTimeout(() => clone.remove(), 800);

            let melding = document.getElementById("melding");
            if (melding) {
                melding.style.display = "block";
                setTimeout(() => melding.style.display = "none", 2000);
            }
        });
    });

    let loginKnop = document.getElementById("login-knop");
    let popup = document.getElementById("login-popup");
    let closeBtn = document.getElementById("close-popup");

    /* FIX: registerPopup gedeclareerd VÓÓR de window click-handler */
    let openRegister = document.getElementById("open-register");
    let registerPopup = document.getElementById("register-popup");
    let closeRegister = document.getElementById("close-register");

    if (loginKnop && popup) {
        loginKnop.addEventListener("click", function(e) {
            e.preventDefault();
            popup.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            popup.style.display = "none";
        });
    }

    window.addEventListener("click", function(e) {
        if (e.target === popup) {
            popup.style.display = "none";
        }
        if (e.target === registerPopup) {
            registerPopup.style.display = "none";
        }
    });

    let loginBtn = document.getElementById("login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", function() {
            let gebruikersnaam = document.getElementById("gebruikersnaam").value;
            let wachtwoord = document.getElementById("wachtwoord").value;
            let fout = document.getElementById("login-fout");

            let gebruikers = JSON.parse(localStorage.getItem("gebruikers")) || [];
            let gebruiker = gebruikers.find(g =>
                g.gebruikersnaam === gebruikersnaam &&
                g.wachtwoord === wachtwoord
            );

            if (gebruiker) {
                localStorage.setItem("ingelogd", "true");
                localStorage.setItem("huidigeGebruiker", gebruikersnaam);
                popup.style.display = "none";
                updateLoginUI();
                alert("Ingelogd als " + gebruikersnaam + "!");
            } else {
                if (fout) fout.innerText = "Verkeerde gegevens!";
            }
        });
    }

    function updateLoginUI() {
        let knop = document.getElementById("login-knop");
        let ingelogd = localStorage.getItem("ingelogd");
        let naam = localStorage.getItem("huidigeGebruiker");
        if (knop) {
            knop.innerText = (ingelogd === "true" && naam)
                ? "🔓 " + naam
                : "🔓";
        }
    }

    updateLoginUI();

    if (loginKnop) {
        loginKnop.addEventListener("dblclick", function() {
            localStorage.removeItem("ingelogd");
            localStorage.removeItem("huidigeGebruiker");
            updateLoginUI();
        });
    }

    if (openRegister && registerPopup) {
        openRegister.onclick = () => registerPopup.style.display = "flex";
    }

    if (closeRegister) {
        closeRegister.onclick = () => registerPopup.style.display = "none";
    }

    let registerBtn = document.getElementById("register-btn");

    if (registerBtn) {
        registerBtn.addEventListener("click", function() {
            let gebruikersnaam = document.getElementById("reg-gebruikersnaam")?.value;
            let wachtwoord = document.getElementById("reg-wachtwoord")?.value;
            let naam = document.getElementById("reg-naam")?.value;
            let adres = document.getElementById("reg-adres")?.value;
            let email = document.getElementById("reg-email")?.value;
            let fout = document.getElementById("register-fout");

            if (!gebruikersnaam || !wachtwoord || !naam || !adres || !email) {
                if (fout) fout.innerText = "Vul alles in!";
                return;
            }

            let gebruikers = JSON.parse(localStorage.getItem("gebruikers")) || [];
            let bestaatAl = gebruikers.find(g => g.gebruikersnaam === gebruikersnaam);

            if (bestaatAl) {
                if (fout) {
                    fout.style.display = "block";
                    fout.innerText = "Gebruikersnaam al in gebruik!";
                }
                return;
            }

            gebruikers.push({ gebruikersnaam, wachtwoord, naam, adres, email });
            localStorage.setItem("gebruikers", JSON.stringify(gebruikers));
            localStorage.setItem("ingelogd", "true");
            localStorage.setItem("huidigeGebruiker", gebruikersnaam);

            updateLoginUI();
            alert("Account aangemaakt!");

            if (registerPopup) registerPopup.style.display = "none";
        });
    }

    /* FIX: filterProducten slechts één keer gedefinieerd, met de juiste
       container class ".producten" (niet ".producten-container") */
    const zoekInput = document.getElementById("zoek-input");
    const categorieFilter = document.getElementById("categorie-filter");
    const minPrijsInput = document.getElementById("min-prijs");
    const maxPrijsInput = document.getElementById("max-prijs");
    const sortSelect = document.getElementById("sort-prijs");
    const producten = document.querySelectorAll(".product");

    function filterProducten() {
        let zoek = zoekInput.value.toLowerCase();
        let categorie = categorieFilter.value;
        let minPrijs = parseFloat(minPrijsInput.value) || 0;
        let maxPrijs = parseFloat(maxPrijsInput.value) || Infinity;
        let zichtbareProducten = [];

        producten.forEach(product => {
            let naam = product.querySelector("h2").innerText.toLowerCase();
            let prijs = parseFloat(product.dataset.prijs);
            let cat = product.dataset.categorie;

            let matchZoek = naam.includes(zoek);
            let matchCategorie = (categorie === "alles" || cat === categorie);
            let matchPrijs = prijs >= minPrijs && prijs <= maxPrijs;

            if (matchZoek && matchCategorie && matchPrijs) {
                product.style.display = "block";
                zichtbareProducten.push(product);
            } else {
                product.style.display = "none";
            }
        });

        let sort = sortSelect.value;

        if (sort !== "geen") {
            zichtbareProducten.sort((a, b) => {
                let prijsA = parseFloat(a.dataset.prijs);
                let prijsB = parseFloat(b.dataset.prijs);
                if (sort === "laag-hoog") return prijsA - prijsB;
                if (sort === "hoog-laag") return prijsB - prijsA;
                return 0;
            });

            let container = document.querySelector(".producten");
            zichtbareProducten.forEach(product => container.appendChild(product));
        }
    }

    if (zoekInput) zoekInput.addEventListener("input", filterProducten);
    if (categorieFilter) categorieFilter.addEventListener("change", filterProducten);
    if (minPrijsInput) minPrijsInput.addEventListener("input", filterProducten);
    if (maxPrijsInput) maxPrijsInput.addEventListener("input", filterProducten);
    if (sortSelect) sortSelect.addEventListener("change", filterProducten);

});
