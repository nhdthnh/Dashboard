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
if (!username) {
    // Nếu không có username trong local storage, chuyển hướng về trang đăng nhập
    window.location.href = 'login.html';
}
// Xử lý chuyển đổi theme
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateThemeIcon();
    saveThemePreference();
});

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

function saveThemePreference() {
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Kiểm tra và áp dụng theme đã lưu
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
    body.classList.add('dark-mode');
    updateThemeIcon();
}

// Thay đổi để cập nhật dữ liệu từ Firebase mỗi 5 giây
const updateInterval = 5000; // 5 giây
const locationRef = ref(db, `user/${username}/LOCATION 1/Sensor`);

// Declare flameAlertTimeout at a higher scope
let flameAlertTimeout; // Declare the variable

setInterval(() => {
    // Lấy giá trị mới từ Firebase
    get(locationRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Update the UI with the fetched data
            const temperatureElement = document.getElementById('temperature');
            const humidityElement = document.getElementById('humidity');
            const mq135Element = document.getElementById('mq135');
            const flameElement = document.getElementById('flame');
            if (temperatureElement) {
                temperatureElement.textContent = `${data.temperature}°C`;
            }
            if (humidityElement) {
                humidityElement.textContent = `${data.humidity}%`;
            }
            if (mq135Element) {
                mq135Element.textContent = `${data.mq135} PPM`;
            }
            if (flameElement) {
                flameElement.textContent = data.flame === 0 ? "YES" : "NO";

                if (data.flame === 1) {
                    // Check if the alert has been shown in the last 10 seconds
                    const currentTime = Date.now();
                    if (!flameAlertTimeout || currentTime - flameAlertTimeout >= 10000) {
                        flameAlertTimeout = currentTime; // Update the last alert time
                        Swal.fire({
                            title: 'Alert!',
                            text: 'Flame detected in LOCATION 1!',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                        const timestamp = new Date().toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit', // Thêm giây vào định dạng
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).replace(/\//g, '-'); // Replace slashes with dashes
    
                        // Create a reference with the formatted timestamp
                        const logRef = ref(db, `user/${username}/LOG/${timestamp}`); 
                        set(logRef, `Flame detected LOCATION 1`); // Push the log entry
                    }
                }
            }
            
        }
    });
}, updateInterval);

// Listen for real-time updates for LOCATION 1
onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('temperature').textContent = `${data.temperature}°C`;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('mq135').textContent = `${data.mq135} PPM`;
        
        // Call updateDeviceStatuses whenever data changes
        updateDeviceStatuses(); // Ensure device statuses are updated in real-time
    }
});


function updateDeviceStatuses() {
    const deviceIds = ['device 1', 'device 2', 'device 3', 'device 4']; // Cập nhật ID để khớp với đường dẫn Firebase

    deviceIds.forEach(deviceId => {
        const deviceRef = ref(db, `user/${username}/LOCATION 1/Relay/${deviceId}`); // Tham chiếu chính xác đến thiết bị
        console.log(db);
        get(deviceRef).then(snapshot => {
            if (snapshot.exists()) {
                const deviceStatus = snapshot.val(); // Lấy giá trị trạng thái
                console.log(`Device ID: ${deviceId}, Status: ${deviceStatus}`); // Kiểm tra giá trị trạng thái
                const statusText = deviceStatus === 1 ? "OFF" : "ON"; // Chỉnh sửa để khớp với văn bản trong HTML
                
                const deviceElement = document.getElementById(deviceId.replace(" ", "")); // Xóa khoảng trắng cho ID HTML
                if (deviceElement) {
                    deviceElement.innerText = statusText;
                } else {
                    console.error(`Không tìm thấy phần tử với ID ${deviceId.replace(" ", "")}.`);
                }
            } else {
                console.log("Không có tài liệu nào!");
            }
        }).catch(error => {
            console.error("Lỗi khi lấy tài liệu:", error);
        });
    });
}


const locationRef2 = ref(db, `user/${username}/LOCATION 2/Sensor`);
setInterval(() => {
    // Lấy giá trị mới từ Firebase
    get(locationRef2).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Update the UI with the fetched data
            const temperatureElement2 = document.getElementById('temperature2');
            const humidityElement2 = document.getElementById('humidity2');
            const mq135Element2 = document.getElementById('mq135_2');
            const flameElement2 = document.getElementById('flame2');
            if (temperatureElement2) {
                temperatureElement2.textContent = `${data.temperature}°C`;
            }
            if (humidityElement2) {
                humidityElement2.textContent = `${data.humidity}%`;
            }
            if (mq135Element2) {
                mq135Element2.textContent = `${data.mq135} PPM`;
            }
            if (flameElement2) {
                flameElement2.textContent = data.flame === 1 ? "YES" : "NO";  // Thay flame2 thành flame
                
                if (data.flame === 1) {  // Giữ nguyên vì đã đúng
                    // Check if the alert has been shown in the last 10 seconds
                    const currentTime = Date.now();
                    if (!flameAlertTimeout || currentTime - flameAlertTimeout >= 10000) {
                        flameAlertTimeout = currentTime;
                        Swal.fire({
                            title: 'Alert!',
                            text: 'Flame detected in LOCATION 2!',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                        const timestamp = new Date().toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit', // Thêm giây vào định dạng
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).replace(/\//g, '-'); // Replace slashes with dashes
    
                        // Create a reference with the formatted timestamp
                        const logRef = ref(db, `user/${username}/LOG/${timestamp}`); 
                        set(logRef, `Flame detected LOCATION 2`); // Push the log entry
                    }
                }
            }
        }
    });
}, updateInterval);




onValue(locationRef2, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('temperature2').textContent = `${data.temperature}°C`;
        document.getElementById('humidity2').textContent = `${data.humidity}%`;
        document.getElementById('mq135_2').textContent = `${data.mq135} PPM`;
        // // Call updateDeviceStatuses whenever data changes
        updateDeviceStatuses2(); // Ensure device statuses are updated in real-time
    }
});


function updateDeviceStatuses2() {
    const deviceIds = ['device 1', 'device 2', 'device 3', 'device 4']; // Cập nhật ID để khớp với đường dẫn Firebase

    deviceIds.forEach(deviceId => {
        const deviceRef = ref(db, `user/${username}/LOCATION 2/Relay/${deviceId}`); // Tham chiếu chính xác đến thiết bị
        console.log(db);
        get(deviceRef).then(snapshot => {
            if (snapshot.exists()) {
                const deviceStatus = snapshot.val(); // Lấy giá trị trạng thái
                console.log(`Device ID: ${deviceId}, Status: ${deviceStatus}`); // Kiểm tra giá trị trạng thái
                const statusText = deviceStatus === 1 ? "OFF" : "ON"; // Chỉnh sửa để khớp với văn bản trong HTML
                
                const deviceElement = document.getElementById(`${deviceId.replace(" ", "")}_2`);
                if (deviceElement) {
                    deviceElement.textContent = statusText;
                } else {
                    console.error(`Element with ID ${deviceId.replace(" ", "")}_2 not found.`);
                }
            } else {
                console.log("Không có tài liệu nào!");
            }
        }).catch(error => {
            console.error("Lỗi khi lấy tài liệu:", error);
        });
    });
}





const locations = ['LOCATION 1', 'LOCATION 2', 'LOCATION 3', 'LOCATION 4']; // Danh sách các vị trí

locations.forEach(location => {
    let statusRef = ref(db, `user/${username}/${location}/status`);

    get(statusRef).then(snapshot => {
        if (snapshot.exists()) {
            const status = snapshot.val();
            const statusIcon = document.getElementById(`statusIcon_${location.replace(" ", "")}`); // ID cho từng vị trí
            if (status === 0) {
                statusIcon.className = 'fa-solid fa-ban';
                statusIcon.style.color = 'red';
            } else {
                statusIcon.className = 'fa-solid fa-wifi';
                statusIcon.style.color = 'rgb(0, 255, 0);';
            }
        } else {
            console.log(`No status document found for ${location}!`);
        }
    }).catch(error => {
        console.error(`Error fetching status for ${location}:`, error);
    });
});




// Add this script to handle the dropdown toggle
document.getElementById('profileIcon').addEventListener('click', function() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});




function checkLocations() {
    const locations = ['LOCATION 1', 'LOCATION 2', 'LOCATION 3', 'LOCATION 4'];
    locations.forEach(location => {
        const locationRef = ref(db, `user/${username}/${location}`);
        get(locationRef).then(snapshot => {
            if (!snapshot.exists()) {
                // Nếu không có dữ liệu, ẩn widget
                document.getElementById(location.replace(" ", "").toLowerCase()).style.display = 'none';
            } else {
                // Nếu có dữ liệu, hiển thị widget
                document.getElementById(location.replace(" ", "").toLowerCase()).style.display = 'block';
            }
        }).catch(error => {
            console.error("Lỗi khi lấy dữ liệu LOCATION:", error);
        });
    });
}
window.onload = checkLocations;