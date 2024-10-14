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


document.getElementById('logoutButton').addEventListener('click', function () {
    // Xóa username khỏi local storage
    localStorage.removeItem('loggedInUser');
    // Chuyển hướng về trang đăng nhập
    window.location.href = 'login.html';
});
// Cài đặt giá trị ban đầu cho các gauge


const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                fill: false,
                tension: 0.2,
            },
            {
                label: 'Humidity (%)',
                data: [],
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                fill: false,
                tension: 0.2,
            },
            {
                label: 'Air Quality (PPM)',
                data: [],
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                fill: false,
                tension: 0.2,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Tắt legend mặc định
            },
            tooltip: {
                enabled: false // Tắt tooltip mặc định
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: Math.round,
                font: {
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    },
    plugins: [ChartDataLabels]
});

// Tạo legend tùy chỉnh
function createCustomLegend() {
    const legendContainer = document.createElement('div');
    legendContainer.classList.add('chart-legend');

    myChart.data.datasets.forEach((dataset, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('chart-legend-item');

        const colorBox = document.createElement('span');
        colorBox.classList.add('chart-legend-color');
        colorBox.style.backgroundColor = dataset.borderColor;

        const labelText = document.createElement('span');
        labelText.textContent = dataset.label;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelText);
        legendContainer.appendChild(legendItem);
    });

    // Chèn legend vào sau biểu đồ
    myChart.canvas.parentNode.insertAdjacentElement('afterend', legendContainer);
}

createCustomLegend();

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


document.querySelectorAll('.widget').forEach(widget => {
    const button = widget.querySelector('.switch');
    if (button) {
        const deviceNumber = widget.dataset.deviceNumber;
        const location = 'LOCATION 1'; // Replace with actual location if dynamic
        const path = `user/${username}/${location}/device ${deviceNumber}`;
        
        // Reference to the Firebase database path
        const dbRef = ref(db, path);

        // Listen for real-time updates from Firebase
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const stateValue = snapshot.val();
                if (stateValue === 0) {
                    button.classList.add('on');
                } else {
                    button.classList.remove('on');
                }
            }
        });

        widget.addEventListener('click', function() {
            button.classList.toggle('on');
            
            // Determine the state value: 0 for ON, 1 for OFF
            const stateValue = button.classList.contains('on') ? 0 : 1;
            console.log(stateValue);
            // Update the value in Firebase directly under the device
            set(dbRef, stateValue);

        });
    }
});

// Reference to the Firebase database path for each data type
const temperatureRef = ref(db, `user/${username}/LOCATION 1/temperature`);
const humidityRef = ref(db, `user/${username}/LOCATION 1/humidity`);
const mq135Ref = ref(db, `user/${username}/LOCATION 1/mq135`);

let latestTemperature = null;
let latestHumidity = null;
let latestMq135 = null;

// Hàm để thêm dữ liệu mới vào biểu đồ và loại bỏ dữ liệu cũ hơn 10 giây
function addDataPoint(label, temperature, humidity, mq135) {
    const maxDataPoints = 10; // Giữ lại tối đa 10 điểm dữ liệu trong biểu đồ

    // Thêm nhãn và dữ liệu mới vào biểu đồ
    if (label) myChart.data.labels.push(label);
    if (temperature !== null) myChart.data.datasets[0].data.push(temperature);
    if (humidity !== null) myChart.data.datasets[1].data.push(humidity);
    if (mq135 !== null) myChart.data.datasets[2].data.push(mq135);

    // Xóa dữ liệu cũ khi số lượng điểm dữ liệu vượt quá 10
    if (myChart.data.labels.length > maxDataPoints) {
        myChart.data.labels.shift(); // Xóa nhãn cũ nhất
        myChart.data.datasets[0].data.shift(); // Xóa dữ liệu nhiệt độ cũ nhất
        myChart.data.datasets[1].data.shift(); // Xóa dữ liệu độ ẩm cũ nhất
        myChart.data.datasets[2].data.shift(); // Xóa dữ liệu chất lượng không khí cũ nhất
    }

    // Cập nhật biểu đồ ngay lập tức
    myChart.update();
}


// Hàm để kiểm tra và thêm điểm dữ liệu mới vào biểu đồ nếu tất cả dữ liệu đã sẵn sàng
function checkAndAddDataPoint() {
    if (latestTemperature !== null && latestHumidity !== null && latestMq135 !== null) {
        const currentTime = new Date().toLocaleTimeString(); // Lấy thời gian hiện tại làm nhãn
        addDataPoint(currentTime, latestTemperature, latestHumidity, latestMq135);

        // Reset giá trị sau khi đã thêm vào biểu đồ
        latestTemperature = null;
        latestHumidity = null;
        latestMq135 = null;
    }
}

// Listen for real-time updates for temperature
onValue(temperatureRef, (snapshot) => {
    if (snapshot.exists()) {
        latestTemperature = snapshot.val();
        checkAndAddDataPoint();
    }
});

// Listen for real-time updates for humidity
onValue(humidityRef, (snapshot) => {
    if (snapshot.exists()) {
        latestHumidity = snapshot.val();
        checkAndAddDataPoint();
    }
});

// Listen for real-time updates for mq135
onValue(mq135Ref, (snapshot) => {
    if (snapshot.exists()) {
        latestMq135 = snapshot.val();
        checkAndAddDataPoint();
    }
});

function updateDateTime() {
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        const now = new Date();
        const options = { 
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Thêm tùy chọn để hiển thị giờ 12 giờ
        };
        
        const timeString = now.toLocaleString('vi-VN', options);
        const dateString = now.toLocaleDateString('vi-VN'); // Lấy ngày theo định dạng dd/mm/yyyy

        // Cập nhật nội dung với thời gian và ngày trên các dòng khác nhau
        dateTimeElement.innerHTML = `${timeString}<br>${dateString}`; // Sử dụng <br> để xuống dòng
    }
}

// Đảm bảo DOM đã được tải trước khi thực thi script
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật thời gian mỗi giây
    setInterval(updateDateTime, 1000);

    // Gọi hàm lần đầu để hiển thị ngay lập tức
    updateDateTime();
});

// Thay đổi để cập nhật dữ liệu từ Firebase mỗi 5 giây
const updateInterval = 5000; // 5 giây

setInterval(() => {
    // Lấy giá trị mới từ Firebase
    get(temperatureRef).then((snapshot) => {
        if (snapshot.exists()) {
            latestTemperature = snapshot.val();
            checkAndAddDataPoint();
        }
    });

    get(humidityRef).then((snapshot) => {
        if (snapshot.exists()) {
            latestHumidity = snapshot.val();
            checkAndAddDataPoint();
        }
    });

    get(mq135Ref).then((snapshot) => {
        if (snapshot.exists()) {
            latestMq135 = snapshot.val();
            checkAndAddDataPoint();
        }
    });
}, updateInterval);


onValue(temperatureRef, (snapshot) => {
    if (snapshot.exists()) {
        latestTemperature = snapshot.val();
        document.getElementById('temperature').textContent = `${latestTemperature}°C`; // Update temperature in HTML
        console.log(latestTemperature);
        checkAndAddDataPoint();
    }
});

// Listen for real-time updates for humidity
onValue(humidityRef, (snapshot) => {
    if (snapshot.exists()) {
        latestHumidity = snapshot.val();
        document.getElementById('humidity').textContent = `${latestHumidity}%`; // Update humidity in HTML
        checkAndAddDataPoint();
        console.log(latestHumidity);
    }
});

// Listen for real-time updates for mq135
onValue(mq135Ref, (snapshot) => {
    if (snapshot.exists()) {
        latestMq135 = snapshot.val();
        document.getElementById('battery').textContent = `${latestMq135} PPM`; // Update air quality in HTML
        checkAndAddDataPoint();
    }
});
