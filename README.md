# ProjectAutomationReport

Ứng dụng **Automation Report** hỗ trợ kỹ sư CNC tạo báo cáo từ mẫu Excel. Mã nguồn hiện được chia theo các giai đoạn.

## UI V1 — đã có

1. Trang đăng nhập bằng **Google / Firebase Authentication** (tích hợp thực, cần cấu hình).
2. Trang chính sau đăng nhập, nút **+ Tạo báo cáo** nằm ở chính giữa.
3. Bấm **Tạo báo cáo** mở form: loại AMC / Troubleshoot / PLANT / Installation / Inspection, Customer, Model, Serial No., Date of Inspection và Checked By.
4. Lưu bản nháp trong localStorage của **trình duyệt này**, tách theo Firebase UID. Không có đồng bộ cloud.
5. Nút **Xem thử giao diện** cho phép kiểm thử UX **không đăng nhập**; chế độ demo được đánh dấu rõ ràng, không phải xác thực Google.

Các tính năng **chưa được xây dựng** trong UI V1: kho mẫu Excel, mapping ô, chèn ảnh, xuất Excel/PDF, đồng bộ dữ liệu và phân quyền backend.

## Chạy cục bộ trên Windows

Mở PowerShell / Terminal trong thư mục repository:

```powershell
py -m http.server 5500 --directory public
```

Mở **http://localhost:5500** trong Chrome hoặc Edge. Không mở trực tiếp file HTML bằng `file://` khi cần đăng nhập Google.

Không yêu cầu `npm install` cho giao diện V1. Phần Firebase SDK được tải từ máy chủ Firebase khi đã cấu hình Google Sign-In.

## Kích hoạt đăng nhập Google thật

1. Tạo dự án trên [Firebase Console](https://console.firebase.google.com).
2. Chọn **Build → Authentication → Sign-in method → Google → Enable**.
3. Vào **Project settings → Your apps**, tạo ứng dụng **Web** rồi lấy Firebase Web Config.
4. Chỉnh `public/firebase-config.js` theo ví dụ có sẵn. Không thêm service-account JSON hoặc private key vào repository.
5. Trong **Authentication → Settings → Authorized domains**, thêm **localhost** để chạy local. Firebase project mới không tự thêm localhost.
6. Chạy web bằng lệnh ở trên. Bấm **Tiếp tục với Google** để đăng nhập và **Đăng xuất** để thoát.

**Cảnh báo bảo mật:** Firebase Authentication chỉ xác minh danh tính ở client. Trước khi bổ sung Firebase Database/Storage, cần xây dựng Firebase Security Rules để bảo vệ dữ liệu theo `request.auth.uid`. LocalStorage không phải nơi lưu tài liệu khách hàng cần bảo mật.

## Hướng phát triển kế tiếp

- **UI V2:** danh sách các Unit/Branch (Spindle, Ball screw, ATC), lọc model, chọn option (File 1/2/3).
- **Template engine:** import workbook Excel gốc, map ô và vùng ảnh, ghi vào bản sao file, giữ định dạng, export `.xlsx` và PDF A4 dọc.
- **Backend:** xác thực, phân quyền, quản lý mẫu báo cáo theo kỹ sư và lưu trữ báo cáo.

### Mã nguồn

- `public/index.html`: màn hình login, dashboard, form tạo báo cáo.
- `public/app.css`: giao diện responsive.
- `public/app.js`: UI state, đăng nhập Google, lưu bản nháp.
- `public/firebase-config.js`: cấu hình Firebase.

## Kiểm thử nhanh

- Chạy localhost, bấm **Xem thử giao diện** → trang chính có nút **Tạo báo cáo** ở giữa.
- Bấm **Tạo báo cáo** → form hiển thị, kiểm tra trường bắt buộc.
- Nhập Customer/Model, bấm **Tạo bản nháp** → dòng xuất hiện ở báo cáo gần đây.
- Tải lại trang (chế độ xem thử) và kiểm tra bản nháp vẫn còn.
- Chọn **Đăng xuất** → về trang đăng nhập.
- Khi đã cấu hình Firebase, kiểm tra tài khoản Google thật và đăng nhập lại sau khi tải trang.

> Trạng thái: Đây là bản UI V1 có workflow cơ bản. **Chưa có tính năng điền vào mẫu Excel gốc.**
