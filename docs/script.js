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

// Funktion: URL-Parameter auslesen und in Kleinbuchstaben umwandeln
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param)?.toLowerCase(); // Umwandlung in Kleinbuchstaben
}

// Funktion: Daten von der API abrufen
async function fetchData(abbreviation) {
    try {
        const apiKey = await getApiKey(); // API-Key holen
        const response = await fetch(`${API_URL}?apikey=${apiKey}`);
        const data = await response.json();

        // Vergleich: API-Daten ebenfalls in Kleinbuchstaben umwandeln
        return data.find(item => item["abkuerzung"].toLowerCase() === abbreviation);
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

    // Links mit Symbolen
    const linksList = document.getElementById("thema-links-list");
    linksList.innerHTML = ""; // Vorherige Inhalte löschen
    const links = ["geodaten_shop", "metadaten", "mapbs", "geobasisdaten", "wms", "wfs", "wmts"];
    const icons = {
        "geodaten_shop": "shopping_cart", // Material Icon für Geodaten-Shop
        "metadaten": "description", // Material Icon für Metadaten
        "mapbs": "map", // Material Icon für MapBS
        "geobasisdaten": "gavel", // Material Icon für Geobasisdaten
        "wms": "public", // Material Icon für WMS
        "wfs": "public", // Material Icon für WFS
        "wmts": "public" // Material Icon für WMTS
    };

    links.forEach(linkType => {
        if (data[linkType]) {
            const li = document.createElement("li");

            // Symbol hinzufügen
            const iconSpan = document.createElement("span");
            iconSpan.className = "material-icons";
            iconSpan.textContent = icons[linkType] || "link"; // Fallback-Icon

            // Link hinzufügen
            const a = document.createElement("a");
            a.href = data[linkType];
            a.textContent = linkType.replace("_", " "); // Ersetze "_" durch Leerzeichen für Lesbarkeit
            a.target = "_blank";

            li.appendChild(iconSpan); // Icon hinzufügen
            li.appendChild(a); // Link hinzufügen
            linksList.appendChild(li);
        }
    });

    // Zugriff-Link (Kategorie + URL + Schloss-Icon)
    if (data["zugriff"] && data["zugriff"].includes(":")) {
        const [category, url] = data["zugriff"].split(":").map(s => s.trim());
        const li = document.createElement("li");

        // Symbol für Kategorie hinzufügen
        const iconSpan = document.createElement("span");
        iconSpan.className = "material-icons category-icon";
        iconSpan.textContent = category === "Kategorie A" ? "lock_open" : "lock";

        // Link hinzufügen
        const a = document.createElement("a");
        a.href = url;
        a.textContent = category;
        a.target = "_blank";

        li.appendChild(iconSpan); // Icon hinzufügen
        li.appendChild(a); // Link hinzufügen
        linksList.appendChild(li);
    }

    // Aktualisierungsdatum
    document.getElementById("update-date").textContent = data["aktualisierung"];

    // Bild
    const img = document.getElementById("thema-image");
    if (data["bild_url"]) {
        img.src = data["bild_url"];
        img.style.display = "block";
        img.style.maxWidth = "400px"; // Bildbreite begrenzen
        img.style.height = "auto"; // Verhältnis beibehalten
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
