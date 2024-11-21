import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDP136PkU8msSFMCKUhbNPcoKv52SAwcgg",
    authDomain: "webserver-948ed.firebaseapp.com",
    projectId: "webserver-948ed",
    storageBucket: "webserver-948ed.appspot.com",
    messagingSenderId: "596097188935",
    appId: "1:596097188935:web:0cc7f99eb0fc742c0bdd62",
    measurementId: "G-RGZR1Q5S8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const dailyData = {
    "humidity_avg": 0,
    "mq135_avg": 0,
    "temperature_avg": 0
};

// Hiển thị danh sách locations
function displayLocations() {
    const locationsRef = ref(db, 'user/nhdthnh');
    onValue(locationsRef, (snapshot) => {
        const locationsList = document.getElementById('locationsList');
        locationsList.innerHTML = '';
        
        snapshot.forEach((childSnapshot) => {
            const locationKey = childSnapshot.key;
            const locationData = childSnapshot.val();
            
            if(locationKey.startsWith('LOCATION')) {
                const row = document.createElement('tr');
                console.log(`${locationKey} status:`, locationData.status);
                const isActive = locationData.status === "1" || locationData.status === 1;
                row.innerHTML = `
                    <td>${locationKey}</td>
                    <td>
                        <span class="badge ${isActive ? 'bg-success' : 'bg-danger'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteLocation('${locationKey}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                locationsList.appendChild(row);
            }
        });
    });
}

// Xóa location
window.deleteLocation = async function(locationKey) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete ${locationKey}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const locationRef = ref(db, `user/nhdthnh/${locationKey}`);
            await remove(locationRef);
            await Swal.fire(
                'Deleted!',
                'Location has been deleted successfully.',
                'success'
            );
        } catch(error) {
            await Swal.fire(
                'Error!',
                'Error deleting location: ' + error.message,
                'error'
            );
        }
    }
}

// Thêm location mới
document.getElementById('addLocationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const locationName = document.getElementById('locationName').value;
    const locationsRef = ref(db, 'user/nhdthnh');
    
    try {
        const newLocationKey = `LOCATION ${locationName}`;
        const newLocationRef = ref(db, `user/nhdthnh/${newLocationKey}`);
        
        const snapshot = await get(locationsRef);
        if (snapshot.hasChild(newLocationKey)) {
            await Swal.fire(
                'Error!',
                'This location already exists!',
                'error'
            );
            return;
        }
        
        // Tạo cấu trúc dữ liệu đầy đủ
        const newLocationData = {
            History: {
                "Day 1": dailyData,
                "Day 2": dailyData,
                "Day 3": dailyData,
                "Day 4": dailyData,
                "Day 5": dailyData,
                "Day 6": dailyData,
                "Day 7": dailyData
            },
            Relay: {
                "device 1": 1,
                "device 2": 1,
                "device 3": 1,
                "device 4": 1
            },
            Sensor: {
                "flame": 1,
                "humidity": 0,
                "mq135": 0,
                "temperature": 0
            },
            Threshold: {
                "airQualityThreshold": 0,
                "humidityThreshold": 0,
                "temperatureThreshold": 0
            },
            status: "0"
        };
        
        await set(newLocationRef, newLocationData);
        await Swal.fire(
            'Success!',
            'Location added successfully!',
            'success'
        );
        document.getElementById('locationName').value = '';
    } catch(error) {
        await Swal.fire(
            'Error!',
            'Error adding location: ' + error.message,
            'error'
        );
    }
});

// Khởi tạo hiển thị khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    displayLocations();
}); 