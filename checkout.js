document.addEventListener("DOMContentLoaded", function() {

    let gebruiker = localStorage.getItem("huidigeGebruiker");

    if (!gebruiker) {
        alert("Je moet eerst inloggen!");
        window.location.href = "index.html";
        return;
    }

    let winkelwagen = JSON.parse(localStorage.getItem("winkelwagen")) || [];
    let totaalElem = document.getElementById("checkout-totaal");

    function berekenTotaal() {
        let totaal = 0;
        winkelwagen.forEach(item => {
            let prijs = parseFloat(item.prijs.replace("€", "").replace(",", "."));
            totaal += prijs * (item.aantal || 1);
        });
        totaalElem.innerText = "Totaal: €" + totaal.toFixed(2).replace(".", ",");
    }

    berekenTotaal();

    /* FIX: || {} vervangen door || [] zodat .find() werkt op een array */
    let accounts = JSON.parse(localStorage.getItem("gebruikers")) || [];
    let data = accounts.find(g => g.gebruikersnaam === gebruiker);

    if (data) {
        document.getElementById("naam").value = data.naam || "";
        document.getElementById("adres").value = data.adres || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("postcode").value = data.postcode || "";
        document.getElementById("plaats").value = data.plaats || "";
    }

    document.getElementById("checkout-form").addEventListener("submit", function(e) {
        e.preventDefault();

        let naam = document.getElementById("naam").value;
        let adres = document.getElementById("adres").value;
        let email = document.getElementById("email").value;
        let postcode = document.getElementById("postcode").value;
        let plaats = document.getElementById("plaats").value;

        if (!naam || !adres || !email || !postcode || !plaats) {
            alert("Vul alles in!");
            return;
        }

        /* FIX: gebruikersdata updaten in de "gebruikers" array (niet als object
           opslaan onder "accounts" — dat was een andere sleutel dan bij het lezen) */
        let gebruikers = JSON.parse(localStorage.getItem("gebruikers")) || [];
        let index = gebruikers.findIndex(g => g.gebruikersnaam === gebruiker);

        if (index !== -1) {
            gebruikers[index] = { ...gebruikers[index], naam, adres, email, postcode, plaats };
        }

        localStorage.setItem("gebruikers", JSON.stringify(gebruikers));

        let bestellingen = JSON.parse(localStorage.getItem("bestellingen")) || {};

        if (!bestellingen[gebruiker]) {
            bestellingen[gebruiker] = [];
        }

        bestellingen[gebruiker].push({
            klant: { naam, adres, email, postcode, plaats },
            items: winkelwagen,
            totaal: totaalElem.innerText,
            datum: new Date().toLocaleString()
        });

        localStorage.setItem("bestellingen", JSON.stringify(bestellingen));

        alert("Bestelling geplaatst!");

        localStorage.removeItem("winkelwagen");

        window.location.href = "index.html";
    });

});
