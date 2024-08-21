import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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

// Toggle password visibility
document.getElementById("showPassword").addEventListener('change', function () {
    const passwordField = document.getElementById("password");
    const type = this.checked ? 'text' : 'password';
    passwordField.type = type;
});

// Handle login
document.querySelector('button[type="submit"]').addEventListener('click', function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const userRef = ref(db, 'user/' + username);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const secretKey = "my-secret-key";  // Replace with your actual secret key
            const decryptedPassword = CryptoJS.AES.decrypt(userData.password, secretKey).toString(CryptoJS.enc.Utf8);

            if (decryptedPassword === password) {
                // Save username to localStorage
                localStorage.setItem('loggedInUser', username);
                alert("Login Successful!");
                window.location.href = 'home.html'; // Redirect to home page
            } else {
                alert("Incorrect password.");
            }
        } else {
            alert("Username does not exist.");
        }
    }).catch((error) => {
        console.error("Error reading data: ", error);
        alert("Error during login. Please try again.");
    });
});
