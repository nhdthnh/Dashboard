import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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

document.getElementById('backToHome').addEventListener('click', function() {
    window.location.href = 'home.html';
});

// Lấy username từ localStorage
const username = localStorage.getItem('loggedInUser');

// Kiểm tra xem có username trong localStorage không
if (username) {
    // Gán username vào ô input, đặt readonly và thêm class
    const usernameInput = document.getElementById('username');
    usernameInput.value = username;
    usernameInput.readOnly = true;
    usernameInput.classList.add('disabled-input');
    
    // Ngăn chặn sự kiện mousedown để không thể quét
    usernameInput.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });

    // Tạo tham chiếu đến user
    const userRef = ref(db, 'user/' + username);
    
    // Lấy dữ liệu từ database
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("User data:", userData); // In ra toàn bộ thông tin người dùng

            // Nếu bạn muốn in ra từng trường cụ thể
            console.log("Email:", userData.email);
            console.log("Full Name:", userData.fullName);
            console.log("Phone Number:", userData.phoneNumber);

            document.getElementById('email').value = userData.email
            document.getElementById('fullName').value = userData.fullName
            document.getElementById('phoneNumber').value = userData.phoneNumber
        } else {
            console.log("No data available for user:", username);
        }
    }).catch((error) => {
        console.error("Error getting user data:", error);
    });
    

} else {
    // Nếu không có username trong localStorage, chuyển hướng về trang đăng nhập
    window.location.href = 'login.html';
    console.log("No username found in localStorage");
}

// Hàm cập nhật thông tin lên Firebase
function updateProfile() {
    const newEmail = document.getElementById('email').value.trim();
    const newFullName = document.getElementById('fullName').value.trim();
    const newPhoneNumber = document.getElementById('phoneNumber').value.trim();

    // Tạo tham chiếu đến user
    const userRef = ref(db, 'user/' + username);

    // Tạo object chứa thông tin cần cập nhật
    const updates = {};
    if (newEmail) updates.email = newEmail;
    if (newFullName) updates.fullName = newFullName;
    if (newPhoneNumber) updates.phoneNumber = newPhoneNumber;

    // Cập nhật thông tin trong Realtime Database
    update(userRef, updates)
        .then(() => {
            console.log("Profile updated successfully");
            alert('Thông tin đã được cập nhật thành công!');
        })
        .catch((error) => {
            console.error("Error updating profile: ", error);
            alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
        });
}

// Thêm event listener cho nút "Save Changes"
document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
    e.preventDefault(); // Ngăn form submit mặc định
    updateProfile(); // Gọi hàm cập nhật
});

// Lấy checkbox và div chứa các trường mật khẩu
const changePasswordCheckbox = document.getElementById('changePassword');
const passwordFields = document.getElementById('passwordFields');

// Thêm sự kiện lắng nghe cho checkbox
changePasswordCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Hiển thị các trường nhập liệu mật khẩu
        passwordFields.style.display = 'block';
    } else {
        // Ẩn các trường nhập liệu mật khẩu
        passwordFields.style.display = 'none';
    }
});
