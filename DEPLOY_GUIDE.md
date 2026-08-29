# 🌸 HƯỚNG DẪN PUBLIC WEBSITE RA TOÀN THẾ GIỚI (DEPLOY GUIDE)

Tài liệu này hướng dẫn bạn **3 cách tốt nhất, dễ nhất và hoàn toàn MIỄN PHÍ** để đưa website thiệp sinh nhật **Sakura Birthday** lên Internet để người nhận và bạn bè có thể xem từ bất kỳ đâu (điện thoại, máy tính, iPad).

---

## 🚀 CÁCH 1: Triển Khai Lên Vercel (Khuyên dùng — 30 giây là có Link HTTPS Miễn Phí)

Vercel là nền tảng máy chủ đám mây miễn phí tốt nhất thế giới hiện nay, tốc độ load siêu nhanh và bảo mật HTTPS xanh.

### Cách A: Dùng file `deploy.bat` hoặc lệnh Terminal (Dễ nhất)
1. Mở cửa sổ dòng lệnh (Terminal / PowerShell) trong thư mục dự án và chạy:
   ```bash
   npx vercel
   ```
   *(Hoặc click đúp chuột vào file `deploy.bat` và chọn số `1`)*
2. Hệ thống sẽ hỏi:
   - `Set up and deploy?` → Nhấn **Y** (Enter)
   - `Which scope do you want to deploy to?` → Nhấn **Enter** (chọn tài khoản của bạn)
   - `Link to existing project?` → Nhấn **N** (Enter)
   - `What's your project's name?` → Gõ `sakura-birthday` (Enter)
   - `In which directory is your code located?` → Nhấn **Enter**
3. Sau 30 giây, bạn sẽ nhận được đường link Public chính thức dạng:
   👉 **`https://sakura-birthday-xxxx.vercel.app`**

### Cách B: Kết nối qua GitHub (Tự động cập nhật mỗi khi sửa code)
1. Đẩy code lên tài khoản **GitHub** của bạn.
2. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
3. Bấm **Add New...** → **Project** → Chọn repo vừa tạo.
4. Bấm nút **Deploy**. Xong!

---

## 🌟 CÁCH 2: Triển Khai Lên Render.com (Hỗ trợ Fullstack Node.js Backend & Upload ảnh)

Nếu bạn muốn có máy chủ Node.js Express riêng biệt:

1. Đẩy mã nguồn lên **GitHub**.
2. Truy cập [Render.com](https://render.com) và đăng nhập.
3. Chọn **New +** → **Web Service** → Chọn repository GitHub của bạn.
4. Điền cấu hình:
   - **Name**: `sakura-birthday`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
   - **Plan**: `Free`
5. Bấm **Deploy Web Service**.
6. Render sẽ cấp tên miền công khai dạng:  
   👉 **`https://sakura-birthday-xxxx.onrender.com`**

---

## ⚡ CÁCH 3: Tạo Link Public Trực Tiếp Ngay Từ Máy Bạn (Không cần đăng ký tài khoản)

Nếu bạn đang mở website trên máy tính và muốn gửi link ngay cho bạn bè xem thử nghiệm trong vòng 5 giây:

1. Đảm bảo server đang chạy tại port `5000` (`node server/index.js`).
2. Mở một cửa sổ Terminal mới và gõ:
   ```bash
   npx localtunnel --port 5000
   ```
3. Hệ thống sẽ cấp ngay một đường link HTTPS dạng:
   👉 `https://xxxx-xxxx-xxxx.loca.lt`
4. Gửi link này cho bất kỳ ai trên điện thoại để mở thiệp ngay tức thì!

---

## 📁 Toàn Bộ File Cấu Hình Đã Được Chuẩn Bị Sẵn

- [`vercel.json`](./vercel.json) — Cấu hình Vercel Serverless & SPA Router
- [`render.yaml`](./render.yaml) — Cấu hình Render.com 1-click
- [`Dockerfile`](./Dockerfile) & [`docker-compose.yml`](./docker-compose.yml) — Cho VPS / Server riêng
- [`server/app.js`](./server/app.js) & [`api/index.js`](./api/index.js) — REST API tương thích mọi nền tảng
- [`deploy.bat`](./deploy.bat) — Trình đơn triển khai 1-click trên Windows
