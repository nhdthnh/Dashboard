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

const logRef = ref(db, `user/nhdthnh/LOG`); // Thay username bằng tên người dùng hiện tại

// Lấy log từ Firebase
get(logRef).then((snapshot) => {
    if (snapshot.exists()) {
        const logData = snapshot.val();
        const logListElement = document.getElementById('logList');
        logListElement.innerHTML = ''; // Xóa nội dung cũ

        // Tạo bảng
        const table = document.createElement('table');
        table.className = 'table table-striped'; // Thêm lớp CSS cho bảng

        // Tạo tiêu đề bảng
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th><input type="checkbox" id="selectAll" /></th> <!-- Checkbox chọn tất cả -->
                <th>STT</th> <!-- Cột số thứ tự -->
                <th>Time</th>
                <th>LOG</th>
                <th>Action</th> <!-- Cột hành động -->
            </tr>
        `;
        table.appendChild(thead);

        // Tạo thân bảng
        const tbody = document.createElement('tbody');
        let index = 1; // Biến đếm số thứ tự
        const sortedKeys = Object.keys(logData).sort((a, b) => new Date(a.split(' ').reverse().join('-')) - new Date(b.split(' ').reverse().join('-'))); // Sắp xếp theo ngày

        sortedKeys.forEach(key => {
            const logItem = document.createElement('tr');
            logItem.innerHTML = `
                <td><input type="checkbox" class="logCheckbox" data-key="${key}" /></td> <!-- Checkbox cho từng log -->
                <td>${index++}</td> <!-- Số thứ tự -->
                <td>${key}</td>
                <td>${logData[key]}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editLog('${key}')">Edit</button> <!-- Nút chỉnh sửa -->
                </td>
            `;
            tbody.appendChild(logItem);
        });
        table.appendChild(tbody);
        logListElement.appendChild(table); // Thêm bảng vào phần tử logList

        // Thêm sự kiện cho checkbox chọn tất cả
        document.getElementById('selectAll').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.logCheckbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });

        // Thêm nút xóa log
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete Selected Logs';
        deleteButton.className = 'btn btn-danger';
        deleteButton.addEventListener('click', deleteSelectedLogs);
        logListElement.appendChild(deleteButton); // Thêm nút xóa vào phần tử logList

    } else {
        console.log("No logs found");
    }
}).catch((error) => {
    console.error("Error fetching logs: ", error);
});

// Hàm chỉnh sửa log
window.editLog = function(key) {
    const logRefToEdit = ref(db, `user/nhdthnh/LOG/${key}`);
    
    // Lấy giá trị log hiện tại từ Firebase
    get(logRefToEdit).then((snapshot) => {
        if (snapshot.exists()) {
            const currentLogValue = snapshot.val(); // Lấy giá trị log hiện tại
            const modalHtml = `
                <div>
                    <label for="logInput">Edit log:</label>
                    <textarea id="logInput" rows="4" style="width: 100%;">${currentLogValue}</textarea>
                </div>
            `;

            Swal.fire({
                title: 'Edit Log',
                html: modalHtml,
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const newLogValue = document.getElementById('logInput').value; // Lấy giá trị từ ô text
                    if (!newLogValue) {
                        Swal.showValidationMessage('Please enter a log value');
                    }
                    return newLogValue;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    set(logRefToEdit, result.value).then(() => {
                        Swal.fire('Success!', 'Log updated successfully!', 'success');
                        // Cập nhật lại danh sách log
                        updateLogList(); // Gọi hàm cập nhật danh sách log
                    }).catch((error) => {
                        Swal.fire('Error!', 'Error updating log: ' + error.message, 'error');
                    });
                }
            });
        } else {
            Swal.fire('Error!', 'Log not found.', 'error');
        }
    }).catch((error) => {
        Swal.fire('Error!', 'Error fetching log: ' + error.message, 'error');
    });
}

// Hàm cập nhật danh sách log
function updateLogList() {
    get(logRef).then((snapshot) => {
        if (snapshot.exists()) {
            const logData = snapshot.val();
            const logListElement = document.getElementById('logList');
            logListElement.innerHTML = ''; // Xóa nội dung cũ

            // Tạo bảng
            const table = document.createElement('table');
            table.className = 'table table-striped'; // Thêm lớp CSS cho bảng

            // Tạo tiêu đề bảng
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th><input type="checkbox" id="selectAll" /></th> <!-- Checkbox chọn tất cả -->
                    <th>STT</th> <!-- Cột số thứ tự -->
                    <th>Time</th>
                    <th>LOG</th>
                    <th>Action</th> <!-- Cột hành động -->
                </tr>
            `;
            table.appendChild(thead);

            // Tạo thân bảng
            const tbody = document.createElement('tbody');
            let index = 1; // Biến đếm số thứ tự
            const sortedKeys = Object.keys(logData).sort((a, b) => new Date(a.split(' ').reverse().join('-')) - new Date(b.split(' ').reverse().join('-'))); // Sắp xếp theo ngày

            sortedKeys.forEach(key => {
                const logItem = document.createElement('tr');
                logItem.innerHTML = `
                    <td><input type="checkbox" class="logCheckbox" data-key="${key}" /></td> <!-- Checkbox cho từng log -->
                    <td>${index++}</td> <!-- Số thứ tự -->
                    <td>${key}</td>
                    <td>${logData[key]}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editLog('${key}')">Edit</button> <!-- Nút chỉnh sửa -->
                    </td>
                `;
                tbody.appendChild(logItem);
            });
            table.appendChild(tbody);
            logListElement.appendChild(table); // Thêm bảng vào phần tử logList

            // Thêm sự kiện cho checkbox chọn tất cả
            document.getElementById('selectAll').addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.logCheckbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });

            // Thêm nút xóa log
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete Selected Logs';
            deleteButton.className = 'btn btn-danger';
            deleteButton.addEventListener('click', deleteSelectedLogs);
            logListElement.appendChild(deleteButton); // Thêm nút xóa vào phần tử logList

        } else {
            console.log("No logs found");
        }
    }).catch((error) => {
        console.error("Error fetching logs: ", error);
    });
}

// Hàm xóa các log đã chọn
async function deleteSelectedLogs() {
    const selectedCheckboxes = document.querySelectorAll('.logCheckbox:checked');
    const keysToDelete = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-key'));

    if (keysToDelete.length > 0) {
        // Thay thế confirm bằng Swal
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${keysToDelete.length} logs?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel'
        });
        
        if (confirmDelete.isConfirmed) {
            keysToDelete.forEach(async (key) => {
                const logRefToDelete = ref(db, `user/nhdthnh/LOG/${key}`);
                await remove(logRefToDelete);
            });
            Swal.fire('Deleted!', 'Selected logs have been deleted.', 'success');
            // Cập nhật lại danh sách log
            updateLogList(); // Gọi hàm cập nhật danh sách log
        }
    } else {
        Swal.fire('Error!', 'No logs selected for deletion.', 'error');
    }
} 