// Open or create the IndexedDB database
const dbName = "AgricultureDB";
const dbVersion = 1;

let db;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = function(event) {
    console.error("Database error:", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database opened successfully");
    displayData();
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("AgriData", { keyPath: "id", autoIncrement: true });
    console.log("Object store created");
};

// Function to save data
function saveData(sensorReading, gpsCoordinates, timestamp, imageData, notes) {
    const transaction = db.transaction(["AgriData"], "readwrite");
    const objectStore = transaction.objectStore("AgriData");
    
    const data = {
        sensorReading: sensorReading.split(',').map(Number),
        gpsCoordinates: gpsCoordinates,
        timestamp: timestamp,
        image: imageData,
        notes: notes
    };

    const request = objectStore.add(data);

    request.onsuccess = function(event) {
        console.log("Data added successfully");
        displayData();
    };

    request.onerror = function(event) {
        console.error("Error adding data:", event.target.error);
    };
}

// Function to display data
function displayData() {
    const transaction = db.transaction(["AgriData"], "readonly");
    const objectStore = transaction.objectStore("AgriData");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const data = event.target.result;
        const dataDisplay = document.getElementById("dataDisplay");
        dataDisplay.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            const formattedDate = new Date(item.timestamp).toLocaleString();
            div.innerHTML = `
                <p><strong>Sensor Reading:</strong> ${item.sensorReading.join(', ')}</p>
                <p><strong>GPS Coordinates:</strong> ${item.gpsCoordinates ? item.gpsCoordinates.join(', ') : 'Not available'}</p>
                <p><strong>Timestamp:</strong> ${formattedDate}</p>
                <p><strong>Notes:</strong> ${item.notes}</p>
                ${item.image ? `<img src="${item.image}" alt="Agricultural Image" style="max-width: 200px;">` : ''}
            `;
            dataDisplay.appendChild(div);
        });
    };
}

// Function to get current position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => resolve([position.coords.latitude, position.coords.longitude]),
                error => reject(error)
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

// Event listener for form submission
document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const sensorReading = document.getElementById("sensorReading").value;
    const imageFile = document.getElementById("imageUpload").files[0];
    const notes = document.getElementById("notes").value;

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Get current GPS coordinates
    getCurrentPosition()
        .then(coordinates => {
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    saveData(sensorReading, coordinates, timestamp, e.target.result, notes);
                };
                reader.readAsDataURL(imageFile);
            } else {
                saveData(sensorReading, coordinates, timestamp, null, notes);
            }
        })
        .catch(error => {
            console.error("Error getting GPS coordinates:", error);
            // If GPS fails, save with null coordinates
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    saveData(sensorReading, null, timestamp, e.target.result, notes);
                };
                reader.readAsDataURL(imageFile);
            } else {
                saveData(sensorReading, null, timestamp, null, notes);
            }
        });

    // Clear form fields
    document.getElementById("dataForm").reset();
});

// Initial display of data
document.addEventListener("DOMContentLoaded", function() {
    if (db) {
        displayData();
    }
});