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
    window.location.href = 'main.html';
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

            // Nếu bạn muốn in ra từng trường cụ thể
            console.log("Email:", userData.email);
            console.log("Full Name:", userData.fullName);
            console.log("Phone Number:", userData.phoneNumber);
            console.log("Password: ", userData.password);
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
;
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
            Swal.fire({
                position: "top-end", // Change position to avoid pushing the page
                icon: "success",
                title: "Update successfully",
                showConfirmButton: false,
                timer: 2000,
                toast: true // Enable toast notification
            })
        })
        .catch((error) => {
            console.error("Error updating profile: ", error);
            alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
        });
}

// Thêm event listener cho nút "Save Changes"


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


// Function to update the password
const secretKey = "1010"; // Define your secret key

function updatePassword() {
    const oldPasswordInput = document.getElementById('oldPassword').value.trim();
    const newPasswordInput = document.getElementById('newPassword').value.trim();
    const confirmPasswordInput = document.getElementById('confirmPassword').value.trim();

    const username = localStorage.getItem('loggedInUser');
    const userRef = ref(db, 'user/' + username);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const decryptedPassword = CryptoJS.AES.decrypt(userData.password, secretKey).toString(CryptoJS.enc.Utf8);

            if (oldPasswordInput !== decryptedPassword) {
                Swal.fire({
                    position: "top-end",
                    icon: 'error',
                    title: 'Incorrect old password.',
                    text: 'Please try again.',
                    showConfirmButton: false,
                    timer: 1200,
                    toast: true // Enable toast notification
                });
                return;
            }

            if (newPasswordInput !== confirmPasswordInput) {
                Swal.fire({
                    position: "top-end",
                    icon: 'error',
                    title: 'Password not match.',
                    text: 'Please try again.',
                    showConfirmButton: false,
                    timer: 1200,
                    toast: true // Enable toast notification
                });
                return;
            }

            const encryptedNewPassword = CryptoJS.AES.encrypt(newPasswordInput, secretKey).toString();

            update(userRef, { password: encryptedNewPassword })
                .then(() => {
                    console.log("OK");
                })
                .catch((error) => {
                    console.error("Error updating password: ", error);
                    Swal.fire({
                        position: "top-end",
                        icon: 'error',
                        title: 'Somethings gone wrong',
                        text: 'Please try again.',
                        showConfirmButton: false,
                        timer: 1200,
                        toast: true // Enable toast notification
                    });
                });
        } 
    }).catch((error) => {
        console.error("Error getting user data:", error);
    });
}

// Add event listener for the "Save Changes" button
document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
    updateProfile();
    e.preventDefault(); // Prevent default form submission
    if (changePasswordCheckbox.checked) { // Check if the checkbox is ticked
        updatePassword(); // Call the update password function
    }

});