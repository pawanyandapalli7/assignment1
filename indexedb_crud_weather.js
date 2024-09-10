// Name of the database
const dbName = "WeatherDB";

// Create or open the database
function openDatabase(callback) {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore("WeatherData", { keyPath: "id", autoIncrement: true });
        console.log("Database upgraded or created.");
    };

    request.onsuccess = function(event) {
        console.log("Database opened successfully.");
        callback(null, event.target.result); // Pass the database to the callback
    };

    request.onerror = function(event) {
        console.error("Error opening database:", event.target.error);
        callback(event.target.error); // Pass the error to the callback
    };
}

// Create data
function createData(db, data, callback) {
    const transaction = db.transaction(["WeatherData"], "readwrite");
    const store = transaction.objectStore("WeatherData");
    const request = store.add(data);

    request.onsuccess = function(event) {
        console.log("Data added successfully.");
        callback(null, event.target.result); // Pass the ID of the added record to the callback
    };

    request.onerror = function(event) {
        console.error("Error adding data:", event.target.error);
        callback(event.target.error); // Pass the error to the callback
    };
}

// Read data
function readData(db, id, callback) {
    const transaction = db.transaction(["WeatherData"], "readonly");
    const store = transaction.objectStore("WeatherData");
    const request = store.get(id);

    request.onsuccess = function(event) {
        console.log("Data retrieved successfully.");
        callback(null, event.target.result); // Pass the retrieved data to the callback
    };

    request.onerror = function(event) {
        console.error("Error retrieving data:", event.target.error);
        callback(event.target.error); // Pass the error to the callback
    };
}

// Example usage
openDatabase(function(error, db) {
    if (error) {
        console.error("Failed to open database:", error);
        return;
    }

    // Create various types of data
    createData(db, {
        temperature: 22,
        condition: "Sunny",
        isRaining: false,
        windSpeed: 5.0,
        timestamp: new Date().toISOString(),
        tags: ["weather", "sunny", "summer"], // Array
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" // Example base64 image data
    }, function(error, id) {
        if (error) {
            console.error("Failed to create data:", error);
            return;
        }

        console.log("Data created with ID:", id);

        // Retrieve the data
        readData(db, id, function(error, data) {
            if (error) {
                console.error("Failed to retrieve data:", error);
            } else {
                console.log("Retrieved data:", data);
                
                // Display the image in the console (for debugging)
                if (data.image) {
                    const img = new Image();
                    img.src = data.image;
                    document.body.appendChild(img); // Add image to the body for visualization
                    console.log("Image data:", data.image);
                }
            }
        });
    });
});
