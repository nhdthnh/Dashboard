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

// Define a global constant for the location
const LOCATION = 'LOCATION 1'; // Replace with actual location if dynamic

const username = localStorage.getItem('loggedInUser');
console.log(username);
// Reference to the Firebase database path for each data type
const temperatureRef = ref(db, `user/${username}/${LOCATION}/Sensor/temperature`);
const humidityRef = ref(db, `user/${username}/${LOCATION}/Sensor/humidity`);
const mq135Ref = ref(db, `user/${username}/${LOCATION}/Sensor/mq135`);
const flameRef = ref(db, `user/${username}/${LOCATION}/Sensor/flame`);
const tempThresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/temperatureThreshold`);
const humidityThresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/humidityThreshold`);
const airQualityThresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/airQualityThreshold`);
const MintempThresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/tempMinThreshold`);
const MinhumidityThresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/humidityMinThreshold`);
const MinairQualityThresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/airQualityMinThreshold`);
const device1Ref = ref(db, `user/${username}/${LOCATION}/Relay/device 1`);
const device2Ref = ref(db, `user/${username}/${LOCATION}/Relay/device 2`);
const device3Ref = ref(db, `user/${username}/${LOCATION}/Relay/device 3`);
const device4Ref = ref(db, `user/${username}/${LOCATION}/Relay/device 4`);



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
        const path = `user/${username}/${LOCATION}/Relay/device ${deviceNumber}`;
        
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

        // Prevent click event from bubbling up when clicking on input fields
        const inputs = widget.querySelectorAll('.time-control input');
        inputs.forEach(input => {
            input.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent the click event from bubbling up to the widget
            });
        });
    }
});



let latestTemperature = 0;
let latestHumidity = 0;
let latestMq135 = 0;

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

// Thay đổi để cập nhật dữ liệu từ Firebase mỗi 5 giây
const updateInterval = 4000; // 5 giây

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
        checkAndAddDataPoint();
    }
});

// Listen for real-time updates for humidity
onValue(humidityRef, (snapshot) => {
    if (snapshot.exists()) {
        latestHumidity = snapshot.val();
        console.log(latestHumidity);
        document.getElementById('humidity').textContent = `${latestHumidity}%`; // Update humidity in HTML
        checkAndAddDataPoint();
    }
});

// Listen for real-time updates for mq135
onValue(mq135Ref, (snapshot) => {
    if (snapshot.exists()) {
        latestMq135 = snapshot.val();
        console.log(latestMq135);
        document.getElementById('mq135').textContent = `${latestMq135} PPM`; // Update air quality in HTML
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

    // Gọi hàm lần đầu ể hiển thị ngay lp tức
    updateDateTime();

});

let flameTimer; // Declare a timer variable
let flameAlerted = false; // Track if the alert has already been shown


onValue(flameRef, (snapshot) => {
    if (snapshot.exists()) {
        const flame = snapshot.val(); // Lấy giá trị flame từ snapshot
        const flameElement = document.getElementById('flame'); // Get the flame element
        const relay1Switch = document.getElementById('device1'); // Nút switch tương ứng với relay 1

        if (flameElement) {
            // Cập nhật giao diện để hiển thị trạng thái lửa
            flameElement.textContent = flame === 1 ? 'Yes' : 'No';

            if (flame === 1) {
                // Phát hiện lửa
                set(device1Ref, 0)
                if (!flameAlerted) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Warning!',
                        text: 'Flame detected!',
                    });

                    flameAlerted = true; // Đặt cờ báo hiệu

                    // Log sự kiện phát hiện lửa
                    const timestamp = new Date().toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    }).replace(/\//g, '-'); // Định dạng thời gian

                    const logRef = ref(db, `user/${username}/LOG/${timestamp}`);
                    set(logRef, `Flame detected at LOCATION 1`); // Ghi log vào Firebase
                }

                // Tự động bật switch tương ứng với relay 1


                // Thiết lập timer để kiểm tra trạng thái lửa sau 20 giây
                clearTimeout(flameTimer);
                flameTimer = setTimeout(() => {
                    onValue(flameRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const newFlame = snapshot.val();
                            if (newflame === 1) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Warning!',
                                    text: 'Flame detected for 20 seconds!',
                                });
                            }
                        }
                    });
                }, 20000); // 20 giây
            } else {
                // Không phát hiện lửa
                clearTimeout(flameTimer);
                flameAlerted = false; // Đặt lại cờ báo hiệu
                
            }
        } else {
            console.error("Element with ID 'flame' not found in the DOM.");
        }
    }
});


let lastAlertTime = { temperature: 0, humidity: 0, airQuality: 0 }; // Track last alert time for each parameter
const alertInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

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
        const temperatureRef = ref(db, `user/${username}/${LOCATION}/History/${day}/temperature_avg`);
        const humidityRef = ref(db, `user/${username}/${LOCATION}/History/${day}/humidity_avg`);
        const mq135Ref = ref(db, `user/${username}/${LOCATION}/History/${day}/mq135_avg`);

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
        get(ref(db, `user/${username}/${LOCATION}/History/Day 1/temperature_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 2/temperature_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 3/temperature_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 4/temperature_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 5/temperature_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 6/temperature_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 7/temperature_avg`)),
        // Thêm các tham chiếu cho độ ẩm và chất lượng không khí
        get(ref(db, `user/${username}/${LOCATION}/History/Day 1/humidity_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 2/humidity_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 3/humidity_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 4/humidity_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 5/humidity_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 6/humidity_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 7/humidity_avg`)),

        get(ref(db, `user/${username}/${LOCATION}/History/Day 1/mq135_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 2/mq135_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 3/mq135_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 4/mq135_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 5/mq135_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 6/mq135_avg`)),
        get(ref(db, `user/${username}/${LOCATION}/History/Day 7/mq135_avg`))
    ]).then(() => {
        weeklyChart.update(); // Update the chart with new data
    });
});

// Thêm sự kiện lắng nghe cho các trường ngưỡng
document.getElementById('tempThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10);
    if (this.value === '' || newThreshold < 0 || newThreshold > 50) {
        Swal.fire('Temperature must be between 0 and 50°C');
        this.value = 50;
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update the temperature threshold to ${newThreshold}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const thresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/temperatureThreshold`);
            set(thresholdRef, newThreshold)
                .then(() => {
                    Swal.fire('Updated!', 'Temperature threshold has been updated.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Error!', `Failed to update: ${error.message}`, 'error');
                });
        } else {
            this.value = 50;
        }
    });
});

document.getElementById('humidityThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10);
    if (this.value === '' || newThreshold < 20 || newThreshold > 70) {
        Swal.fire('Humidity must be between 20 and 70%');
        this.value = 50;
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update the humidity threshold to ${newThreshold}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const thresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/humidityThreshold`);
            set(thresholdRef, newThreshold)
                .then(() => {
                    Swal.fire('Updated!', 'Humidity threshold has been updated.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Error!', `Failed to update: ${error.message}`, 'error');
                });
        } else {
            this.value = 50;
        }
    });
});

document.getElementById('airQualityThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10);
    if (this.value === '' || newThreshold < 0 || newThreshold > 1000) {
        Swal.fire('Air Quality must be between 0 and 1000 PPM');
        this.value = 500;
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update the air quality threshold to ${newThreshold}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const thresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/airQualityThreshold`);
            set(thresholdRef, newThreshold)
                .then(() => {
                    Swal.fire('Updated!', 'Air quality threshold has been updated.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Error!', `Failed to update: ${error.message}`, 'error');
                });
        } else {
            this.value = 500;
        }
    });
});

document.getElementById('tempMinThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10);
    if (this.value === '' || newThreshold < 0 || newThreshold > 50) {
        Swal.fire('Temperature must be between 0 and 50°C');
        this.value = 50;
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update the minimum temperature threshold to ${newThreshold}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const thresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/tempMinThreshold`);
            set(thresholdRef, newThreshold)
                .then(() => {
                    Swal.fire('Updated!', 'Minimum temperature threshold has been updated.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Error!', `Failed to update: ${error.message}`, 'error');
                });
        } else {
            this.value = 50;
        }
    });
});

document.getElementById('humidityMinThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10);
    if (this.value === '' || newThreshold < 20 || newThreshold > 70) {
        Swal.fire('Humidity must be between 20 and 70%');
        this.value = 50;
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update the minimum humidity threshold to ${newThreshold}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const thresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/humidityMinThreshold`);
            set(thresholdRef, newThreshold)
                .then(() => {
                    Swal.fire('Updated!', 'Minimum humidity threshold has been updated.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Error!', `Failed to update: ${error.message}`, 'error');
                });
        } else {
            this.value = 50;
        }
    });
});

document.getElementById('airQualityMinThreshold').addEventListener('change', function() {
    const newThreshold = parseInt(this.value, 10);
    if (this.value === '' || newThreshold < 0 || newThreshold > 1000) {
        Swal.fire('Air Quality must be between 0 and 1000 PPM');
        this.value = 500;
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to update the minimum air quality threshold to ${newThreshold}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const thresholdRef = ref(db, `user/${username}/${LOCATION}/Threshold/airQualityMinThreshold`);
            set(thresholdRef, newThreshold)
                .then(() => {
                    Swal.fire('Updated!', 'Minimum air quality threshold has been updated.', 'success');
                })
                .catch((error) => {
                    Swal.fire('Error!', `Failed to update: ${error.message}`, 'error');
                });
        } else {
            this.value = 500;
        }
    });
});


function updateThresholds() {
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
    onValue(MintempThresholdRef, (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('tempMinThreshold').value = snapshot.val();
        }
    });
    onValue(MinhumidityThresholdRef, (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('humidityMinThreshold').value = snapshot.val();
        }
    });
    onValue(MinairQualityThresholdRef, (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('airQualityMinThreshold').value = snapshot.val();
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

function checkAllSensorsAndAlert() {
    let tempExceeded = false;
    let humidityExceeded = false;
    let airQualityExceeded = false;
    let MintempExceeded = false;
    let MinhumidityExceeded = false;
    let MinairQualityExceeded = false;
    // Kiểm tra nhiệt độ
    onValue(temperatureRef, (snapshot) => {
        if (snapshot.exists()) {
            const temp = snapshot.val();
            document.getElementById('temperature').textContent = `${temp}°C`; // Cập nhật giao diện
            get(tempThresholdRef).then((thresholdSnapshot) => {
                if (thresholdSnapshot.exists()) {
                    const threshold = thresholdSnapshot.val();
                    if (temp > threshold) {
                        tempExceeded = true;
                        triggerAlertIfNeeded('Temperature', temp, threshold); // Pass the parameter for logging
                        set(device3Ref, 0)
                    }
                    
                }
            });
            get(MintempThresholdRef).then((thresholdSnapshot) => {
                if (thresholdSnapshot.exists()) {
                    const threshold = thresholdSnapshot.val();
                    if (temp < threshold) {
                        MintempExceeded = true;
                        triggerAlertIfNeeded('Temperature', temp, threshold); // Pass the parameter for logging
                    }
                }
            });
        }
    });

    // Kiểm tra độ ẩm
    onValue(humidityRef, (snapshot) => {
        if (snapshot.exists()) {
            const humidity = snapshot.val();
            document.getElementById('humidity').textContent = `${humidity}%`; // Cập nhật giao diện
            get(humidityThresholdRef).then((thresholdSnapshot) => {
                if (thresholdSnapshot.exists()) {
                    const threshold = thresholdSnapshot.val();
                    if (humidity > threshold) {
                        humidityExceeded = true;
                        triggerAlertIfNeeded('Humidity', humidity, threshold); // Pass the parameter for logging
                        set(device2Ref, 0)
                    }
                }     
            });
            get(MinhumidityThresholdRef).then((thresholdSnapshot) => {
                if (thresholdSnapshot.exists()) {
                    const threshold = thresholdSnapshot.val();
                    if (humidity < threshold) {
                        MinhumidityExceeded = true;
                        triggerAlertIfNeeded('Humidity', humidity, threshold); // Pass the parameter for logging
                        set(device4Ref, 0)
                    }
                }
            });
        }
    });

    // Kiểm tra chất lượng không khí
    onValue(mq135Ref, (snapshot) => {
        if (snapshot.exists()) {
            const airQuality = snapshot.val();
            document.getElementById('mq135').textContent = `${airQuality} PPM`; // Cập nhật giao diện
            get(airQualityThresholdRef).then((thresholdSnapshot) => {
                if (thresholdSnapshot.exists()) {
                    const threshold = thresholdSnapshot.val();
                    if (airQuality > threshold) {
                        airQualityExceeded = true;
                        triggerAlertIfNeeded('Air Quality', airQuality, threshold); // Pass the parameter for logging
                        set(device2Ref, 0)
                    }
                }
            });
            // get(MinairQualityThresholdRef).then((thresholdSnapshot) => {
            //     if (thresholdSnapshot.exists()) {
            //         const threshold = thresholdSnapshot.val();
            //         if (airQuality < threshold) {
            //             MinairQualityExceeded = true;
            //             triggerAlertIfNeeded('Air Quality', airQuality, threshold); // Pass the parameter for logging
            //         }
            //     }
            // });
        }
    });

    // Hàm hiển thị cảnh báo
    let alertShown = false; // Đảm bảo chỉ hiển thị 1 cảnh báo
    function triggerAlertIfNeeded(sensorType, value, threshold) {
        if (!alertShown && (tempExceeded || humidityExceeded || airQualityExceeded || MinairQualityExceeded || MinhumidityExceeded || MintempExceeded)) {
            alertShown = true;
            // Tạo thông báo chi tiết với giá trị đã vượt ngưỡng
            let alertMessage = `Condition warning!!!\n- ${sensorType} has exceeded the threshold.\n` +
                               `Current Value: ${value}\nThreshold: ${threshold}`;

            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: alertMessage,
            });

            // Format timestamp
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
            set(logRef, `LOCATION 1: ${sensorType} exceeded threshold. Current Value: ${value}, Threshold: ${threshold}`); // Log the alert message
        }
    }

    // Đặt lại các trạng thái sau mỗi 10 giây
    setTimeout(() => {
        tempExceeded = false;
        humidityExceeded = false;
        airQualityExceeded = false;
        alertShown = false;
    }, 10000);
}

// Gọi lại hàm kiểm tra mỗi 10 giây
setInterval(checkAllSensorsAndAlert, 10000);



const deviceInputs = document.querySelectorAll('.time-control input'); // Select all device inputs
let scheduledHour = null; // To store the scheduled hour
let scheduledMinute = null; // To store the scheduled minute

deviceInputs.forEach(input => {
    input.addEventListener('change', function() {
        let value = this.value.trim(); // Get input value and trim whitespace
        let intValue = parseInt(value, 10); // Convert to integer

        // Check for empty input or invalid values
        if (value === '' || isNaN(intValue) || intValue < 0) {
            Swal.fire('Invalid input! Setting value to 0.'); // Alert for invalid input
            this.value = ""; // Reset to empty value
        } else if (this.classList.contains('deviceHour') && intValue > 23) { // Check for hour inputs
            Swal.fire('Hour must be between 0 and 23!'); // Alert for hour range
            this.value = ""; // Reset to empty value
        } else if (this.classList.contains('deviceMinute') && intValue > 59) { // Check for minute inputs
            Swal.fire('Minute must be between 0 and 59!'); // Alert for minute range
            this.value = ""; // Reset to empty value
        } else {
            // Add leading zero if value is less than 10
            this.value = intValue < 10 ? `0${intValue}` : intValue;

            // Update scheduled time based on input fields
            if (this.classList.contains('deviceHour')) {
                scheduledHour = intValue;
            } else if (this.classList.contains('deviceMinute')) {
                scheduledMinute = intValue;
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    let scheduledTimes = {
        1: { hour: null, minute: null },
        2: { hour: null, minute: null },
        3: { hour: null, minute: null },
        4: { hour: null, minute: null }
    };

    document.querySelectorAll('.widget').forEach(widget => {
        const deviceNumber = widget.dataset.deviceNumber;

        const hourInput = widget.querySelector('.deviceHour');
        const minuteInput = widget.querySelector('.deviceMinute');

        if (hourInput) {
            hourInput.addEventListener('change', function () {
                scheduledTimes[deviceNumber].hour = parseInt(this.value, 10);
            });
        }

        if (minuteInput) {
            minuteInput.addEventListener('change', function () {
                scheduledTimes[deviceNumber].minute = parseInt(this.value, 10);
            });
        }
    });

    let isToggledRecently = false; // Flag to prevent toggling within 10 seconds

    function checkScheduledToggle() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        document.querySelectorAll('.widget').forEach(widget => {
            const deviceNumber = widget.dataset.deviceNumber;

            if (scheduledTimes[deviceNumber]) {
                const scheduledHour = scheduledTimes[deviceNumber].hour;
                const scheduledMinute = scheduledTimes[deviceNumber].minute;

                if (scheduledHour !== null && scheduledMinute !== null) {
                    if (currentHour === scheduledHour && currentMinute === scheduledMinute) {
                        if (!isToggledRecently) {
                            const path = `user/${username}/${LOCATION}/Relay/device ${deviceNumber}`;
                            const dbRef = ref(db, path);
                            const button = widget.querySelector('.switch');
                            if (button) {
                                button.classList.toggle('on');
                                const isOn = button.classList.contains('on');
                                const stateValue = isOn ? 0 : 1;
                                set(dbRef, stateValue);

                                isToggledRecently = true;
                                setTimeout(() => {
                                    isToggledRecently = false;
                                }, 10000);

                                // Clear the input values
                                const hourInput = widget.querySelector('.deviceHour');
                                const minuteInput = widget.querySelector('.deviceMinute');
                                if (hourInput) hourInput.value = '';
                                if (minuteInput) minuteInput.value = '';

                                // Reset the scheduled times to null
                                scheduledTimes[deviceNumber].hour = null;
                                scheduledTimes[deviceNumber].minute = null;

                                // Debug: In ra để kiểm tra reset
                                console.log(`Scheduled time for device ${deviceNumber} reset to null.`);
                            }
                        }
                    }
                }
            }
        });
    }

    // Gọi hàm checkScheduledToggle mỗi phút
    setInterval(checkScheduledToggle, 10000);
});



document.addEventListener("DOMContentLoaded", function () {
    // Lấy danh sách tất cả các ô ngày tháng năm
    const dateFields = document.querySelectorAll(".deviceDate");

    // Lấy ngày tháng năm hiện tại
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${
        (currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

    // Đặt giá trị mặc định
    dateFields.forEach(field => {
        field.value = formattedDate;
    });
});

