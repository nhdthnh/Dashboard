import shutil

# Định nghĩa biến toàn cục cho location
location ='2'

# Đường dẫn tới các file nguồn và file đích
html_source_path = 'location1.html'
html_destination_path = f'location{location}.html'

css_source_path = r'css/location1.css'
css_destination_path = f'css/location{location}.css'

js_source_path = r'javascript/location1.js'
js_destination_path = f'javascript/location{location}.js'

js_source_path1 = r'javascript/get_push_data_1.js'
js_destination_path1 = f'javascript/get_push_data_{location}.js'
# 1. Sao chép và chỉnh sửa file HTML
with open(html_source_path, 'r', encoding='utf-8') as file:
    html_data = file.read()

html_data = html_data.replace('Location 1', f'Location {location}')
html_data = html_data.replace('location1', f'location{location}')
html_data = html_data.replace('get_push_data_1', f'get_push_data{location}')

with open(html_destination_path, 'w', encoding='utf-8') as file:
    file.write(html_data)

print('HTML file copied and modified successfully.')

# 2. Sao chép file CSS mà không thay đổi
shutil.copy(css_source_path, css_destination_path)
print('CSS file copied successfully.')

# 3. Sao chép và chỉnh sửa file JS
with open(js_source_path, 'r', encoding='utf-8') as file:
    js_data = file.read()

# Thay thế "LOCATION 1" thành "LOCATION 2" trong file JS
js_data = js_data.replace('LOCATION 1', f'LOCATION {location}')

with open(js_destination_path, 'w', encoding='utf-8') as file:
    file.write(js_data)

with open(js_destination_path1, 'w', encoding='utf-8') as file:
    file.write(js_data)

print('JS file copied and modified successfully.')
