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
function saveData(sensorReading, imageData, notes) {
    const transaction = db.transaction(["AgriData"], "readwrite");
    const objectStore = transaction.objectStore("AgriData");
    
    const data = {
        sensorReading: sensorReading,
        image: imageData,
        notes: notes,
        timestamp: new Date().toISOString()
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
            div.innerHTML = `
                <p><strong>Sensor Reading:</strong> ${item.sensorReading}</p>
                <p><strong>Notes:</strong> ${item.notes}</p>
                <p><strong>Timestamp:</strong> ${item.timestamp}</p>
                ${item.image ? `<img src="${item.image}" alt="Agricultural Image" style="max-width: 200px;">` : ''}
                <hr>
            `;
            dataDisplay.appendChild(div);
        });
    };
}

// Event listener for form submission
document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const sensorReading = document.getElementById("sensorReading").value;
    const imageFile = document.getElementById("imageUpload").files[0];
    const notes = document.getElementById("notes").value;

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveData(sensorReading, e.target.result, notes);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveData(sensorReading, null, notes);
    }

    // Clear form fields
    document.getElementById("dataForm").reset();
});

// Initial display of data
document.addEventListener("DOMContentLoaded", function() {
    if (db) {
        displayData();
    }
});