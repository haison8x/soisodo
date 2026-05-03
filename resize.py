import os
from PIL import Image

def resize_images():
    source_dir = "/Users/sonphan/mmo/soisodo/assets-ios/iphone"
    target_size = (1242, 2688)
    
    # Kiểm tra thư mục tồn tại
    if not os.path.exists(source_dir):
        print(f"Lỗi: Thư mục {source_dir} không tồn tại.")
        return

    # Lấy danh sách các file trong thư mục
    files = os.listdir(source_dir)
    image_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    
    count = 0
    for filename in files:
        if filename.lower().endswith(image_extensions):
            file_path = os.path.join(source_dir, filename)
            try:
                with Image.open(file_path) as img:
                    # Thực hiện resize
                    resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
                    # Lưu đè lên file cũ hoặc bạn có thể đổi tên nếu muốn
                    resized_img.save(file_path)
                    print(f"Đã resize: {filename}")
                    count += 1
            except Exception as e:
                print(f"Lỗi khi xử lý {filename}: {e}")

    print(f"\nHoàn thành! Đã xử lý {count} ảnh.")

if __name__ == "__main__":
    resize_images()
