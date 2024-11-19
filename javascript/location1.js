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
        const path = `user/${username}/${location}/Relay/device ${deviceNumber}`;
        
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
            
            const isOn = button.classList.contains('on'); // Kiểm tra nếu nút đang ở trạng thái 'on'
            const stateValue = isOn ? 0 : 1; // Nếu đang 'on' thì chuyển sang 'off' và ngược lại
            console.log(stateValue);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: isOn ? "Turned ON successfully" : "Turned OFF successfully", // Thay đổi tiêu đề theo trạng thái
                showConfirmButton: false,
                timer: 1500,
                toast: true,
            }).then(() => {
                set(dbRef, stateValue);
            });

            // Set z-index for Swal toast
            const swalToast = document.querySelector('.swal2-container');
            if (swalToast) {
                swalToast.style.zIndex = '100000';
                swalToast.style.marginTop = '20px'; 
            }
        });
    }
});

// Reference to the Firebase database path for each data type
const temperatureRef = ref(db, `user/${username}/LOCATION 1/Sensor/temperature`);
const humidityRef = ref(db, `user/${username}/LOCATION 1/Sensor/humidity`);
const mq135Ref = ref(db, `user/${username}/LOCATION 1/Sensor/mq135`);
const flameRef = ref(db, `user/${username}/LOCATION 1/Sensor/flame`);

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
    // Cp nhật thời gian mỗi giây
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
        document.getElementById('mq135').textContent = `${latestMq135} PPM`; // Update air quality in HTML
        checkAndAddDataPoint();
    }
});

let flameTimer; // Declare a timer variable
let flameAlerted = false; // Track if the alert has already been shown

onValue(flameRef, (snapshot) => {
    if (snapshot.exists()) {
        const flame = snapshot.val(); // Lấy giá trị flame từ snapshot
        const flameElement = document.getElementById('flame'); // Get the flame element

        if (flameElement) { // Check if the element exists
            flameElement.textContent = flame === 1 ? 'Yes' : 'No'; // Hiển thị 'Yes' nếu flame là 1, ngược lại hiển thị 'No'
            
            if (flame === 1) {
                // Show alert immediately if not already alerted
                if (!flameAlerted) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Warning!',
                        text: 'Flame detected!',
                    });
                    flameAlerted = true; // Set the flag to true
                }

                // Clear any existing timer
                clearTimeout(flameTimer);
                
                // Set a new timer for 20 seconds
                flameTimer = setTimeout(() => {
                    // Check the flame value again after 20 seconds
                    onValue(flameRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const newFlame = snapshot.val();
                            if (newFlame === 1) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Warning!',
                                    text: 'Flame detected for 20 seconds!',
                                });
                            }
                        }
                    });
                }, 20000); // 20 seconds
            } else {
                // If flame is not 1, clear the timer and reset the alert flag
                clearTimeout(flameTimer);
                flameAlerted = false; // Reset the alert flag
            }
        } else {
            console.error("Element with ID 'flame' not found in the DOM.");
        }
    }
});



document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [], // Initialize empty data array
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    datalabels: {
                        color: 'rgba(255, 99, 132, 1)',
                        anchor: 'end',
                        align: 'end'
                    }
                },
                {
                    label: 'Humidity (%)',
                    data: [], // Initialize empty data array
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    datalabels: {
                        color: 'rgba(54, 162, 235, 1)',
                        anchor: 'end',
                        align: 'end'
                    }
                },
                {
                    label: 'Air Quality (PPM)',
                    data: [], // Initialize empty data array
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    datalabels: {
                        color: 'rgba(75, 192, 192, 1)',
                        anchor: 'end',
                        align: 'end'
                    }
                }
            ]
        },
        options: {
            plugins: {
                datalabels: {
                    display: true,
                    align: 'end',
                    anchor: 'end'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Fetch average values from Firebase
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    days.forEach((day, index) => {
        const temperatureRef = ref(db, `user/${username}/LOCATION 1/History/${day}/temperature_avg`);
        const humidityRef = ref(db, `user/${username}/LOCATION 1/History/${day}/humidity_avg`);
        const mq135Ref = ref(db, `user/${username}/LOCATION 1/History/${day}/mq135_avg`);

        // Fetch temperature average
        get(temperatureRef).then((snapshot) => {
            if (snapshot.exists()) {
                weeklyChart.data.datasets[0].data[index] = snapshot.val(); // Set temperature data
            }
        });

        // Fetch humidity average
        get(humidityRef).then((snapshot) => {
            if (snapshot.exists()) {
                weeklyChart.data.datasets[1].data[index] = snapshot.val(); // Set humidity data
            }
        });

        // Fetch air quality average
        get(mq135Ref).then((snapshot) => {
            if (snapshot.exists()) {
                weeklyChart.data.datasets[2].data[index] = snapshot.val(); // Set air quality data
            }
        });
    });

    // Update the chart after fetching all data
    Promise.all([
        get(ref(db, `user/${username}/LOCATION 1/History/Day 1/temperature_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 2/temperature_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 3/temperature_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 4/temperature_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 5/temperature_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 6/temperature_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 7/temperature_avg`)),
        // Thêm các tham chiếu cho độ ẩm và chất lượng không khí
        get(ref(db, `user/${username}/LOCATION 1/History/Day 1/humidity_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 2/humidity_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 3/humidity_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 4/humidity_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 5/humidity_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 6/humidity_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 7/humidity_avg`)),

        get(ref(db, `user/${username}/LOCATION 1/History/Day 1/mq135_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 2/mq135_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 3/mq135_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 4/mq135_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 5/mq135_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 6/mq135_avg`)),
        get(ref(db, `user/${username}/LOCATION 1/History/Day 7/mq135_avg`))
    ]).then(() => {
        weeklyChart.update(); // Update the chart with new data
    });
});

// Thêm sự kiện lắng nghe cho các trường ngưỡng
document.getElementById('tempThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10); // Ép kiểu sang số nguyên
    if (this.value === '' || newThreshold < 0 || newThreshold > 100) { // Check for null or empty
        Swal.fire('Temperature must be between 0 and 100°C'); // Thông báo nếu vượt quá giới hạn
        this.value = 50; // Set to average value
        return;
    }
    const thresholdRef = ref(db, `user/${username}/LOCATION 1/Threshold/temperatureThreshold`);
    set(thresholdRef, newThreshold);
});

document.getElementById('humidityThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10); // Ép kiểu sang số nguyên
    if (this.value === '' || newThreshold < 0 || newThreshold > 100) { // Check for null or empty
        Swal.fire('Humidity must be between 0 and 100%'); // Thông báo nếu vượt quá giới hạn
        this.value = 50; // Set to average value
        return;
    }
    const thresholdRef = ref(db, `user/${username}/LOCATION 1/Threshold/humidityThreshold`);
    set(thresholdRef, newThreshold);
});

document.getElementById('airQualityThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10); // Ép kiểu sang số nguyên
    if (this.value === '' || newThreshold < 0 || newThreshold > 1000) { // Check for null or empty
        Swal.fire('Air Quality must be between 0 and 1000 PPM'); // Thông báo nếu vượt quá giới hạn
        this.value = 500; // Set to average value
        return;
    }
    const thresholdRef = ref(db, `user/${username}/LOCATION 1/Threshold/airQualityThreshold`);
    set(thresholdRef, newThreshold);
});


function updateThresholds() {
    const tempThresholdRef = ref(db, `user/${username}/LOCATION 1/Threshold/temperatureThreshold`);
    const humidityThresholdRef = ref(db, `user/${username}/LOCATION 1/Threshold/humidityThreshold`);
    const airQualityThresholdRef = ref(db, `user/${username}/LOCATION 1/Threshold/airQualityThreshold`);

    // Lấy giá trị ngưỡng nhiệt độ
    onValue(tempThresholdRef, (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('tempThreshold').value = snapshot.val();
        }
    });

    // Lấy giá trị ngưỡng độ ẩm
    onValue(humidityThresholdRef, (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('humidityThreshold').value = snapshot.val();
        }
    });

    // Lấy giá trị ngưỡng chất lượng không khí
    onValue(airQualityThresholdRef, (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('airQualityThreshold').value = snapshot.val();
        }
    });
}

// Gọi hàm để cập nhật ngưỡng khi DOM đã tải
document.addEventListener('DOMContentLoaded', updateThresholds);

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('profileDropdown');
    const profileIcon = document.getElementById('profileIcon');
    if (!profileIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none'; // Close the dropdown
    }
});