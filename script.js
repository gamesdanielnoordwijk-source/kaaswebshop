document.addEventListener("DOMContentLoaded", async function() {

    let winkelwagen = JSON.parse(localStorage.getItem("winkelwagen")) || [];
    
    // ============================================
    // PRODUCTEN LADEN VAN SUPABASE
    // ============================================
    async function laadProducten() {
        const loading = document.getElementById("loading");
        const container = document.getElementById("producten-container");
        
        try {
            // Fetch producten van Supabase (veilingen tabel)
            const { data: producten, error } = await supabase
                .from('veilingen')
                .select('*');
            
            if (error) {
                console.error('Fout bij laden producten:', error);
                loading.innerHTML = '❌ Fout bij laden producten';
                return;
            }
            
            loading.style.display = 'none';
            
            // Zet HTML om naar DOM
            container.innerHTML = '';
            
            producten.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.dataset.categorie = product.categorie || 'kaas';
                productDiv.dataset.prijs = product.prijs || 0;
                productDiv.dataset.id = product.id;
                
                productDiv.innerHTML = `
                    <img src="${product.afbeelding || 'https://via.placeholder.com/250x165'}" alt="${product.naam || 'Product'}">
                    <h2>${product.naam || 'Onbekend product'}</h2>
                    <p class="prijs">€${parseFloat(product.prijs || 0).toFixed(2)}</p>
                    <p>${product.beschrijving || ''}</p>
                    <button class="koop-knop">Toevoegen aan winkelwagen</button>
                `;
                
                container.appendChild(productDiv);
            });
            
            // Event listeners toevoegen aan nieuwe knoppen
            voegKoopKnopListenersTo();
            
        } catch (err) {
            console.error('Fout:', err);
            loading.innerHTML = '❌ Connectie fout';
        }
    }
    
    // Laad producten bij pagina laden
    laadProducten();
    
    // ============================================
    // WINKELWAGEN FUNCTIONALITEIT
    // ============================================
    function voegKoopKnopListenersTo() {
        let knoppen = document.querySelectorAll(".koop-knop");
        
        knoppen.forEach(function(knop) {
            knop.addEventListener("click", function() {
                let product = knop.parentElement;
                let naam = product.querySelector("h2").innerText;
                let prijs = product.querySelector(".prijs").innerText;
                let id = product.dataset.id;
                let item = { id, naam, prijs, aantal: 1 };
                
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
    }

    // ============================================
    // LOGIN & REGISTRATIE (Supabase Auth)
    // ============================================
    let loginKnop = document.getElementById("login-knop");
    let popup = document.getElementById("login-popup");
    let closeBtn = document.getElementById("close-popup");
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

    // ============================================
    // LOGIN MET SUPABASE
    // ============================================
    let loginBtn = document.getElementById("login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async function() {
            let gebruikersnaam = document.getElementById("gebruikersnaam").value;
            let wachtwoord = document.getElementById("wachtwoord").value;
            let fout = document.getElementById("login-fout");

            try {
                // Check in gebruikers tabel
                const { data: gebruiker, error } = await supabase
                    .from('gebruikers')
                    .select('*')
                    .eq('gebruikersnaam', gebruikersnaam)
                    .eq('wachtwoord', wachtwoord)
                    .single();

                if (error || !gebruiker) {
                    if (fout) fout.innerText = "Verkeerde gegevens!";
                    return;
                }

                localStorage.setItem("ingelogd", "true");
                localStorage.setItem("huidigeGebruiker", gebruikersnaam);
                localStorage.setItem("gebruikerId", gebruiker.id);
                popup.style.display = "none";
                updateLoginUI();
                alert("Ingelogd als " + gebruikersnaam + "!");
            } catch (err) {
                console.error('Login fout:', err);
                if (fout) fout.innerText = "Fout bij inloggen!";
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
            localStorage.removeItem("gebruikerId");
            updateLoginUI();
        });
    }

    if (openRegister && registerPopup) {
        openRegister.onclick = () => registerPopup.style.display = "flex";
    }

    if (closeRegister) {
        closeRegister.onclick = () => registerPopup.style.display = "none";
    }

    // ============================================
    // REGISTRATIE MET SUPABASE
    // ============================================
    let registerBtn = document.getElementById("register-btn");

    if (registerBtn) {
        registerBtn.addEventListener("click", async function() {
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

            try {
                // Check of gebruiker al bestaat
                const { data: bestaatAl } = await supabase
                    .from('gebruikers')
                    .select('id')
                    .eq('gebruikersnaam', gebruikersnaam)
                    .single();

                if (bestaatAl) {
                    if (fout) {
                        fout.style.display = "block";
                        fout.innerText = "Gebruikersnaam al in gebruik!";
                    }
                    return;
                }

                // Voeg nieuwe gebruiker toe aan Supabase
                const { data: nuweGebruiker, error } = await supabase
                    .from('gebruikers')
                    .insert([{
                        gebruikersnaam,
                        wachtwoord,
                        naam,
                        adres,
                        email
                    }])
                    .select();

                if (error) {
                    console.error('Registratie fout:', error);
                    if (fout) fout.innerText = "Fout bij registratie!";
                    return;
                }

                localStorage.setItem("ingelogd", "true");
                localStorage.setItem("huidigeGebruiker", gebruikersnaam);
                localStorage.setItem("gebruikerId", nuweGebruiker[0].id);

                updateLoginUI();
                alert("Account aangemaakt!");

                if (registerPopup) registerPopup.style.display = "none";
            } catch (err) {
                console.error('Fout:', err);
                if (fout) fout.innerText = "Fout bij registratie!";
            }
        });
    }

    // ============================================
    // FILTERING EN SORTEREN
    // ============================================
    const zoekInput = document.getElementById("zoek-input");
    const categorieFilter = document.getElementById("categorie-filter");
    const minPrijsInput = document.getElementById("min-prijs");
    const maxPrijsInput = document.getElementById("max-prijs");
    const sortSelect = document.getElementById("sort-prijs");

    function filterProducten() {
        const container = document.getElementById("producten-container");
        const producten = container.querySelectorAll(".product");
        
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

            zichtbareProducten.forEach(product => container.appendChild(product));
        }
    }

    if (zoekInput) zoekInput.addEventListener("input", filterProducten);
    if (categorieFilter) categorieFilter.addEventListener("change", filterProducten);
    if (minPrijsInput) minPrijsInput.addEventListener("input", filterProducten);
    if (maxPrijsInput) maxPrijsInput.addEventListener("input", filterProducten);
    if (sortSelect) sortSelect.addEventListener("change", filterProducten);

});
