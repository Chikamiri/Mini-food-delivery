# PHẦN 7 — GIAO DIỆN NGƯỜI DÙNG (FRONTEND)

## 7.1. Tổng quan

Frontend được xây dựng bằng **Vue.js 3.5** với **Vite** làm build tool, sử dụng **Pinia** cho quản lý trạng thái (state management) và **Vue Router** cho điều hướng.

## 7.2. Công nghệ và thư viện

- **Vue.js 3.5** — Framework UI dựa trên Composition API
- **Vite** — Build tool và dev server hiệu năng cao
- **Pinia** — State management chính thức của Vue 3
- **Vue Router** — Điều hướng SPA
- **Cypress** — Framework kiểm thử End-to-End
- **Vitest** — Framework kiểm thử đơn vị

## 7.3. Cấu trúc thư mục Frontend

- **`src/assets/icon/`** — Bộ 40+ icon SVG cho giao diện (home, search, shopping-cart, notice, setting, sign-in, sign-out, delete, edit, filter, ...)
- **`src/assets/styles/`** — CSS riêng cho từng View:
  - `admin-dashboard.css` — Giao diện quản trị
  - `browse-view.css` — Giao diện duyệt nhà hàng/món ăn
- **`src/__tests__/`** — Unit test cho App component
- **`cypress/`** — E2E test suite

## 7.4. Thiết kế giao diện

### 7.4.1. Trang duyệt nhà hàng (Browse View)

Giao diện được thiết kế theo layout **2 cột**:

- **Sidebar trái (220px):**
  - Logo thương hiệu (Mini Food)
  - Menu điều hướng với icon SVG: Home, Browse, Orders, Messages, Settings
  - Shortcut hồ sơ người dùng (avatar + tên)
  - Footer sidebar

- **Nội dung chính:**
  - **Top Bar:** Tiêu đề, ô tìm kiếm (320px), nút giỏ hàng với badge số lượng, action buttons (thông báo)
  - **Voucher Banner:** Gradient banner quảng cáo (gradient: #f8143f → #ff5578)
  - **Category Grid:** Lưới 3 cột hiển thị danh mục nhà hàng dạng card với hình ảnh overlay
  - **Dish Grid:** Lưới 3 cột hiển thị món ăn với badge, giá, nút thêm vào giỏ
  - **Popular Grid:** Lưới 3 cột hiển thị nhà hàng nổi bật với hình ảnh, đánh giá, giá, nút yêu thích
  - **Footer:** Brand, footer links, social icons, copyright

### 7.4.2. Trang quản trị Admin (Admin Dashboard)

Giao diện layout **2 cột** (sidebar 240px + main):

- **Admin Sidebar:**
  - Brand (Mini Food + tagline)
  - Menu điều hướng: Dashboard, Users, Restaurants, Orders, Reports
  - Sidebar note (khu vực ghi chú)

- **Main Content:**
  - **Top Bar:** Tiêu đề + mô tả, ô tìm kiếm (290px), nút thêm mới, nút đăng xuất
  - **KPI Grid:** 4 card thống kê (totalUsers, totalRestaurants, totalOrders, totalRevenue)
  - **Chart Row:** 2 panel song song (Donut chart + Line chart giả lập)
  - **Bottom Grid:** Bảng pending restaurants + feedback list
  - **Responsive:** Grid chuyển 1 cột dưới 1080px, topbar xếp dọc dưới 760px

### 7.4.3. Phong cách thiết kế

- **Bảng màu chính:** Đỏ (#f8143f, #d91541), trắng, xám nhạt (#f4f6fb), đen (#1d2638)
- **Border radius:** 10-18px cho cards, 999px cho badges và avatar
- **Shadows:** `box-shadow: 0 8px 24px rgba(...)` cho cards
- **Transitions:** 0.18-0.22s ease cho hover effects
- **Typography:** Font-weight 600-700 cho tiêu đề, 0.82-0.95rem cho body text

## 7.5. Tích hợp Backend

Frontend giao tiếp với Backend qua RESTful API:

- **Base URL:** Cấu hình qua biến môi trường (mặc định `http://localhost:8080/api`)
- **JWT Storage:** Token được lưu phía client (localStorage/sessionStorage) sau đăng nhập
- **Request interceptor:** Tự động gắn header `Authorization: Bearer <token>` cho mọi request cần xác thực
- **Error handling:** Bắt HTTP status codes (401 → redirect login, 403 → access denied, 404 → not found)

## 7.6. Trạng thái hiện tại

Frontend đã được khởi tạo và có:
- Bộ icon SVG hoàn chỉnh (40+ icons)
- CSS styling chi tiết cho Browse View và Admin Dashboard
- Cấu trúc project Vue 3 + Vite chuẩn
- Test framework (Vitest + Cypress) đã cấu hình

Các View component cụ thể (trang đăng nhập, trang chi tiết nhà hàng, trang giỏ hàng, trang theo dõi đơn hàng) đang trong giai đoạn phát triển tiếp theo.
