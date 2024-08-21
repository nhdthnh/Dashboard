const username = localStorage.getItem('loggedInUser');
if (username) {
    // Hiển thị username trong thẻ h1
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}!`;
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
        labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'], // Thay đổi thời gian nếu cần
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [-5.6, -3.2, 0.0, 2.5, 1.0, -2.0], // Thay đổi dữ liệu nhiệt độ nếu cần
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Humidity (%)',
                data: [53.8, 60.2, 65.5, 70.1, 68.0, 64.0], // Thay đổi dữ liệu độ ẩm nếu cần
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                borderWidth: 2,
                fill: false,
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        }
    }
});
