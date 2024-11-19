import firebase_admin
from firebase_admin import credentials, db

# Khởi tạo Firebase Admin SDK với tệp JSON
cred = credentials.Certificate('firebase-adminsdk.json')

# Khởi tạo ứng dụng Firebase
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://webserver-948ed-default-rtdb.firebaseio.com/'
})

# Đường dẫn tới node dữ liệu trong Firebase
ref = db.reference("user/nhdthnh/LOCATION 1/History")

# Tạo dữ liệu cho 7 ngày
for day in range(1, 8):
    day_ref = ref.child(f"Day {day}")
    data = {
        "humidity_avg": 50,
        "mq135_avg": 500,
        "temperature_avg": 50
    }
    day_ref.set(data)

print("Dữ liệu cho 7 ngày đã được tạo thành công trên Firebase!")
