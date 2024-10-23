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
const locationRef = ref(db, `user/${username}/LOCATION 1`);

setInterval(() => {
    // Lấy giá trị mới từ Firebase
    get(locationRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Update the UI with the fetched data
            document.getElementById('temperature').textContent = `${data.temperature}°C`;
            document.getElementById('humidity').textContent = `${data.humidity}%`;
            document.getElementById('mq135').textContent = `${data.mq135} PPM`;
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
        const deviceRef = ref(db, `user/${username}/LOCATION 1/${deviceId}`); // Tham chiếu chính xác đến thiết bị
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




const locationRef2 = ref(db, `user/${username}/LOCATION 2`);

setInterval(() => {
    // Lấy giá trị mới từ Firebase
    get(locationRef2).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Update the UI with the fetched data
            document.getElementById('temperature2').textContent = `${data.temperature}°C`;
            document.getElementById('humidity2').textContent = `${data.humidity}%`;
            document.getElementById('mq135_2').textContent = `${data.mq135} PPM`;
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
        const deviceRef = ref(db, `user/${username}/LOCATION 2/${deviceId}`); // Tham chiếu chính xác đến thiết bị
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


   // In your content script
   chrome.runtime.sendMessage({ action: "someAction" }, (response) => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
    } else {
        console.log(response);
    }
});