import shutil

# Đường dẫn tới các file nguồn và file đích
html_source_path = 'location1.html'
html_destination_path = 'location2.html'

css_source_path = r'css/location1.css'
css_destination_path = r'css/location2.css'

js_source_path = r'javascript/location1.js'
js_destination_path =  r'javascript/location2.js'

# 1. Sao chép và chỉnh sửa file HTML
with open(html_source_path, 'r', encoding='utf-8') as file:
    html_data = file.read()

html_data = html_data.replace('Location 1', 'Location 2')
html_data = html_data.replace('location1', 'location2')

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
js_data = js_data.replace('LOCATION 1', 'LOCATION 2')

with open(js_destination_path, 'w', encoding='utf-8') as file:
    file.write(js_data)

print('JS file copied and modified successfully.')
