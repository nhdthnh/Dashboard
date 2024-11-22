import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDP136PkU8msSFMCKUhbNPcoKv52SAwcgg",
    authDomain: "webserver-948ed.firebaseapp.com",
    projectId: "webserver-948ed",
    storageBucket: "webserver-948ed.appspot.com",
    messagingSenderId: "596097188935",
    appId: "1:596097188935:web:0cc7f99eb0fc742c0bdd62",
    measurementId: "G-RGZR1Q5S8S"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const username = localStorage.getItem('loggedInUser');
console.log(username);
if (username) {
    // Hiển thị username trong dropdown
    document.getElementById('dropdownUsername').textContent = `Welcome, ${username}`;
} else {
    // Nếu không có username trong local storage, chuyển hướng về trang đăng nhập
    window.location.href = 'login.html';
}

// Define a global variable for location
const locationPath = "LOCATION 1"; // New variable for location

const temperatureRef = ref(db, `user/${username}/${locationPath}/Sensor/temperature`);
const humidityRef = ref(db, `user/${username}/${locationPath}/Sensor/humidity`);
const mq135Ref = ref(db, `user/${username}/${locationPath}/Sensor/mq135`);

let count_temp = 0; // Initialize count to track the number of readings
let count_humid = 0;
let count_mq135 = 0;
let temperature_avg = 0, humidity_avg = 0, mq135_avg = 0; // Move these outside the interval
let previousTemperature = null, previousHumidity = null, previousMq135 = null; // Store previous values



// Function to push averages and shift data
function pushData() {
    // Shift historical data first
    for (let i = 7; i >= 2; i--) { // Start from Day 7 down to Day 2
        const currentDayRef = ref(db, `user/${username}/${locationPath}/History/Day ${i}`);
        const nextDayRef = ref(db, `user/${username}/${locationPath}/History/Day ${i - 1}`);
        get(currentDayRef).then(snapshot => {
            if (snapshot.exists()) {
                set(nextDayRef, snapshot.val()).then(() => {
                    console.log(`Day ${i} data moved to Day ${i - 1}`);
                });
            }
        });
    }

    // Push new average values to Day 7
    set(ref(db, `user/${username}/${locationPath}/History/Day 7`), {
        humidity_avg: humidity_avg,
        mq135_avg: mq135_avg,
        temperature_avg: temperature_avg,
    }).then(() => {
        console.log("Pushing to Day 7:", {
            humidity_avg: humidity_avg,
            mq135_avg: mq135_avg,
            temperature_avg: temperature_avg,
            temperature: temperature,
            humidity: humidity,
            mq135: mq135
        });
    });
}

// Attach pushData to the window object
window.pushData = pushData;

// Listen for key presses


// Function to print the current date in day/month/year format
function printCurrentDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
    const year = currentDate.getFullYear(); // Get full year
    console.log(`Current Date: ${day}/${month}/${year}`); // Print date
}

// Call the function to print the current date
printCurrentDate();

const interval = setInterval(() => {
    const currentTime = new Date();
    
    // Check if it's 11:59 PM
    if (currentTime.getHours() === 20 && currentTime.getMinutes() === 20) {
        // Push average values to Day 7
        for (let i = 7; i >= 2; i--) { // Start from Day 7 down to Day 2
            const currentDayRef = ref(db, `user/${username}/${locationPath}/History/Day ${i}`);
            const nextDayRef = ref(db, `user/${username}/${locationPath}/History/Day ${i - 1}`);
            get(currentDayRef).then(snapshot => {
                if (snapshot.exists()) {
                    set(nextDayRef, snapshot.val()).then(() => {
                        console.log(`Day ${i} data moved to Day ${i - 1}`);
                    });
                }
            });
        }
    
        // Push new average values to Day 7
        set(ref(db, `user/${username}/${locationPath}/History/Day 7`), {
            humidity_avg: humidity_avg,
            mq135_avg: mq135_avg,
            temperature_avg: temperature_avg,
            temperature: temperature,
            humidity: humidity,
            mq135: mq135
        }).then(() => {
            console.log("Pushing to Day 7:", {
                humidity_avg: humidity_avg,
                mq135_avg: mq135_avg,
                temperature_avg: temperature_avg,
                temperature: temperature,
                humidity: humidity,
                mq135: mq135
            });
        });
    }

    // Get values from sensors
    let temperature = 0, humidity = 0, mq135 = 0; // Initialize variables to 0
    get(temperatureRef).then(snapshot => {
        if (snapshot.exists()) {
            temperature = snapshot.val(); // Assign value to variable
            console.log(`Temperature: ${temperature}`); // Log temperature value
            // Check if the temperature has changed
            if (temperature !== previousTemperature) {
                // Update average only if the value has changed
                if (count_temp === 0) {
                    temperature_avg = temperature; // Set initial average
                } else {
                    temperature_avg = (temperature_avg * count_temp + temperature) / (count_temp + 1); // Update average
                }
                count_temp++; // Increment count only if value has changed
                previousTemperature = temperature; // Update previous value
            }
            console.log(`Temperature avg: ${count_temp > 0 ? temperature_avg : temperature}`); // Log temperature average
        }
    });
    get(humidityRef).then(snapshot => {
        if (snapshot.exists()) {
            humidity = snapshot.val(); // Assign value to variable
            console.log(`Humidity: ${humidity}`); // Log humidity value
            // Check if the humidity has changed
            if (humidity !== previousHumidity) {
                // Update average only if the value has changed
                if (count_humid === 0) {
                    humidity_avg = humidity; // Set initial average
                } else {
                    humidity_avg = (humidity_avg * count_humid + humidity) / (count_humid + 1); // Update average
                }
                count_humid++; // Increment count only if value has changed
                previousHumidity = humidity; // Update previous value
            }
            console.log(`Humid avg: ${count_humid > 0 ? humidity_avg : humidity}`); // Log average humidity
        }
    });
    get(mq135Ref).then(snapshot => {
        if (snapshot.exists()) {
            mq135 = snapshot.val(); // Assign value to variable
            console.log(`MQ135: ${mq135}`); // Log mq135 value
            // Check if the mq135 has changed
            if (mq135 !== previousMq135) {
                // Update average only if the value has changed
                if (count_mq135 === 0) {
                    mq135_avg = mq135; // Set initial average
                } else {
                    mq135_avg = (mq135_avg * count_mq135 + mq135) / (count_mq135 + 1); // Update average
                }
                count_mq135++; // Increment count only if value has changed
                previousMq135 = mq135; // Update previous value
            }
            console.log(`MQ135 avg: ${count_humid > 0 ? mq135_avg : mq135}`); // Log average mq135
        }
    });
    window.addEventListener('keydown', (event) => {
        // Check if the "p" key is pressed
        if (event.key === 'p') {
            pushData(); // Call pushData when "p" is pressed
        }
    });
}, 5000); // Run every 10 seconds


