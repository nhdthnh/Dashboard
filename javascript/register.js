import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Your web app's Firebase configuration
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

function updateURL() {
    const select = document.getElementById('locationSelect');
    const selectedValue = select.value;
    const newURL = `home.html/location${selectedValue}`;
    window.history.pushState({ path: newURL }, '', newURL);
}


document.getElementById("showPassword").addEventListener('change', function () {
    const passwordField = document.getElementById("password");
    const type = this.checked ? 'text' : 'password';
    passwordField.type = type;
});

document.getElementById("submit").addEventListener('click', function (e) {
    e.preventDefault();

    // Lấy giá trị từ form
    const fullName = document.getElementById("fullname").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    // Mã hóa mật khẩu bằng AES
    const secretKey = "my-secret-key";  // Bạn nên sử dụng một khóa bí mật an toàn và bảo mật
    const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

    // Kiểm tra sự trùng lặp
    const userRef = ref(db, 'user/');
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            let exists = false;
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.username === username) {
                    exists = true;
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Username already exists.",
                        showConfirmButton: false,
                        timer: 1500,
                        toast: true // Enable toast notification
                      });
                      
                } else if (data.email === email) {
                    exists = true;
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Email already exists.",
                        showConfirmButton: false,
                        timer: 1500,
                        toast: true // Enable toast notification
                      });
                } else if (data.phoneNumber === phoneNumber) {
                    exists = true;
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Phone number exists.",
                        showConfirmButton: false,
                        timer: 1500,
                        toast: true // Enable toast notification
                      });
                }
            });

            if (!exists) {
                // Nếu không có sự trùng lặp, ghi dữ liệu vào Firebase
                set(ref(db, 'user/' + username), {
                    fullName: fullName,
                    username: username,
                    email: email,
                    phoneNumber: phoneNumber,
                    password: encryptedPassword  // Lưu mật khẩu đã mã hóa
                }).then(() => {
                    // Thông báo đăng ký thành công và chuyển hướng đến trang login
                    Swal.fire({
                        position: "top-end", // Change position to avoid pushing the page
                        icon: "success",
                        title: "Register succesfully",
                        showConfirmButton: false,
                        timer: 2000,
                        toast: true // Enable toast notification
                    }).then(() => {
                        window.location.href = 'login.html'; // Redirect to home page
                    });
                }).catch((error) => {
                    // Xử lý lỗi nếu có
                    console.error("Error writing data: ", error);
                    alert("Error during registration. Please try again.");
                });
            }
        } else {
            // Nếu không có dữ liệu nào trong cơ sở dữ liệu, ghi dữ liệu mới
            set(ref(db, 'user/' + username), {
                fullName: fullName,
                username: username,
                email: email,
                phoneNumber: phoneNumber,
                password: encryptedPassword  // Lưu mật khẩu đã mã hóa
            }).then(() => {
                // Thông báo đăng ký thành công và chuyển hướng đến trang login
                Swal.fire({
                    position: "top-end", // Change position to avoid pushing the page
                    icon: "success",
                    title: "Login succesfully",
                    showConfirmButton: false,
                    timer: 2000,
                    toast: true // Enable toast notification
                }).then(() => {
                    window.location.href = 'login.html'; // Redirect to home page
                });
            }).catch((error) => {
                // Xử lý lỗi nếu có
                console.error("Error writing data: ", error);
                alert("Error during registration. Please try again.");
            });
        }
    }).catch((error) => {
        // Xử lý lỗi khi đọc dữ liệu
        console.error("Error reading data: ", error);
        alert("Error during registration. Please try again.");
    });

});