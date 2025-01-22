// Basis-URL der API
const API_URL = "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100410/exports/json";

// Funktion: API-Key aus config.json abrufen
async function getApiKey() {
    try {
        const response = await fetch("config.json"); // Lade die Konfigurationsdatei
        const config = await response.json();
        return config.apiKey;
    } catch (error) {
        console.error("Fehler beim Abrufen des API-Keys:", error);
    }
}

// Funktion: URL-Parameter auslesen
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Funktion: Daten von der API abrufen
async function fetchData(abbreviation) {
    try {
        const apiKey = await getApiKey(); // API-Key holen
        const response = await fetch(`${API_URL}?apikey=${apiKey}`);
        const data = await response.json();

        // Finde das passende Thema anhand der Abkürzung (Abkuerzung in der API)
        console.log(abbreviation)
        return data.find(item => item["abkuerzung"] === abbreviation);
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
    }
}

// Funktion: Daten in die Seite einfügen
function renderData(data) {
    if (!data) {
        document.getElementById("thema-title").textContent = "Thema nicht gefunden";
        return;
    }

    // Titel und Beschreibung
    document.getElementById("thema-title").textContent = data["thema"];
    document.getElementById("thema-description").textContent = data["beschreibung"];

    // Ebenen
    const ebenList = document.getElementById("thema-eben-list");
    ebenList.innerHTML = ""; // Vorherige Inhalte löschen
    const ebenen = data["ebenen"] ? data["ebenen"].split(";") : [];
    ebenen.forEach(ebene => {
        const li = document.createElement("li");
        li.textContent = ebene;
        ebenList.appendChild(li);
    });

    // Links
    const linksList = document.getElementById("thema-links-list");
    linksList.innerHTML = ""; // Vorherige Inhalte löschen
    const links = ["geodaten-shop", "metadaten", "wms", "wfs", "wmts"];
    links.forEach(linkType => {
        if (data[linkType]) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = data[linkType];
            a.textContent = linkType;
            a.target = "_blank";
            li.appendChild(a);
            linksList.appendChild(li);
        }
    });

    // Aktualisierungsdatum
    document.getElementById("update-date").textContent = data["aktualisierung"];

    // Bild
    const img = document.getElementById("thema-image");
    if (data["bild-url"]) {
        img.src = data["bild-url"];
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }
}

// Hauptfunktion: Seite initialisieren
async function init() {
    const abbreviation = getUrlParam("param"); // Abkürzung aus der URL holen
    if (!abbreviation) {
        document.getElementById("thema-title").textContent = "Kein Thema ausgewählt";
        return;
    }

    const data = await fetchData(abbreviation); // Daten abrufen
    renderData(data); // Daten in die Seite einfügen
}

// Seite initialisieren
init();
