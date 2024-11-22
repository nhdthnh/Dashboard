import os
import subprocess
from datetime import datetime

def git_push():
    # Thay đổi thư mục làm việc nếu cần
    # os.chdir('path/to/your/repo')

    # Thêm tất cả các thay đổi
    subprocess.run(['git', 'add', '.'])

    # Lấy ngày hiện tại theo định dạng 'dd/mm'
    commit_message = datetime.now().strftime('%d/%m')

    # Thực hiện commit
    subprocess.run(['git', 'commit', '-m', commit_message])

    # Thực hiện push
    subprocess.run(['git', 'push'])

# Gọi hàm
git_push()
