# Food & Beverage Service API Documentation

## 🍽️ **User Endpoints**

### Food Menu
- **GET** `/api/food` - Lấy tất cả món ăn có sẵn
- **GET** `/api/food/{id}` - Lấy chi tiết món ăn
- **GET** `/api/food/category/{category}` - Lấy món theo danh mục (BREAKFAST, LUNCH, DINNER, DRINKS, DESSERT)
- **GET** `/api/food/search?keyword={keyword}` - Tìm kiếm món ăn

### Room Service Orders
- **POST** `/api/food-orders` - Đặt món room service (cần authentication)
  ```json
  {
    "roomNumber": "101",
    "items": [
      {
        "foodItemId": 1,
        "quantity": 2
      }
    ],
    "specialInstructions": "Không hành"
  }
  ```
- **GET** `/api/food-orders/my-orders` - Xem đơn hàng của tôi
- **GET** `/api/food-orders/{id}` - Xem chi tiết đơn hàng
- **PUT** `/api/food-orders/{id}/cancel` - Hủy đơn hàng

### Restaurant Reservations
- **GET** `/api/restaurant/tables` - Xem tất cả bàn
- **GET** `/api/restaurant/tables?minCapacity={number}` - Lọc bàn theo sức chứa
- **GET** `/api/restaurant/tables/{id}` - Chi tiết bàn
- **POST** `/api/restaurant/reservations` - Đặt bàn
  ```json
  {
    "tableId": 1,
    "guestName": "Nguyen Van A",
    "guestPhone": "0901234567",
    "guestEmail": "email@example.com",
    "reservationDate": "2025-11-30",
    "reservationTime": "19:00:00",
    "partySize": 4,
    "specialRequests": "Gần cửa sổ"
  }
  ```
- **GET** `/api/restaurant/reservations/my-reservations` - Xem đặt bàn của tôi
- **GET** `/api/restaurant/reservations/{id}` - Chi tiết đặt bàn
- **PUT** `/api/restaurant/reservations/{id}/cancel` - Hủy đặt bàn
- **GET** `/api/restaurant/reservations/by-date?date=2025-11-30` - Xem đặt bàn theo ngày

---

## 👨‍💼 **Admin Endpoints** (Requires ADMIN or STAFF role)

### Food Management
- **GET** `/api/admin/food/items` - Lấy tất cả món (kể cả không available)
- **POST** `/api/admin/food/items` - Thêm món mới
  ```json
  {
    "name": "Phở Bò",
    "category": "BREAKFAST",
    "price": 85000,
    "description": "Phở bò truyền thống",
    "imageUrl": "/img/food/pho-bo.jpg",
    "available": true
  }
  ```
- **PUT** `/api/admin/food/items/{id}` - Cập nhật món
- **DELETE** `/api/admin/food/items/{id}` - Xóa món
- **PUT** `/api/admin/food/items/{id}/toggle-availability` - Bật/tắt trạng thái available

### Food Orders Management
- **GET** `/api/admin/food/orders` - Lấy tất cả đơn hàng
- **GET** `/api/admin/food/orders?status=PENDING` - Lọc theo trạng thái
  - Trạng thái: PENDING, CONFIRMED, PREPARING, DELIVERING, DELIVERED, CANCELLED
- **GET** `/api/admin/food/orders/{id}` - Chi tiết đơn hàng
- **PUT** `/api/admin/food/orders/{id}/status?status=CONFIRMED` - Cập nhật trạng thái

### Restaurant Tables Management
- **GET** `/api/admin/restaurant/tables` - Lấy tất cả bàn
- **POST** `/api/admin/restaurant/tables` - Thêm bàn mới
  ```json
  {
    "tableNumber": "T01",
    "capacity": 4,
    "location": "Tầng 1 - Gần cửa sổ",
    "status": "AVAILABLE"
  }
  ```
- **PUT** `/api/admin/restaurant/tables/{id}` - Cập nhật bàn
- **DELETE** `/api/admin/restaurant/tables/{id}` - Xóa bàn

### Reservations Management
- **GET** `/api/admin/restaurant/reservations` - Lấy tất cả đặt bàn
- **GET** `/api/admin/restaurant/reservations?status=PENDING` - Lọc theo trạng thái
  - Trạng thái: PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED, NO_SHOW
- **GET** `/api/admin/restaurant/reservations?date=2025-11-30` - Lọc theo ngày
- **GET** `/api/admin/restaurant/reservations/{id}` - Chi tiết đặt bàn
- **PUT** `/api/admin/restaurant/reservations/{id}/status?status=CONFIRMED` - Cập nhật trạng thái
- **DELETE** `/api/admin/restaurant/reservations/{id}` - Hủy đặt bàn

---

## 📊 **Database Schema**

### Tables Created:
1. **food_items** - Menu items
2. **food_orders** - Room service orders
3. **food_order_items** - Order line items
4. **restaurant_tables** - Restaurant tables
5. **table_reservations** - Table bookings

### Sample Data Inserted:
- ✅ 20 món ăn (Phở, Bánh Mì, Bún Chả, Bò Lúc Lắc, Gà Nướng, Tôm Hùm...)
- ✅ 10 bàn nhà hàng (T01-T10, sức chứa 2-10 người)

---

## 🚀 **Next Steps (Frontend)**

Cần tạo các trang sau:
1. **Menu Page** - Hiển thị menu với filter theo category
2. **Room Service Page** - Giỏ hàng đặt món
3. **Restaurant Booking Page** - Chọn bàn và đặt chỗ
4. **My Orders Page** - Lịch sử đơn hàng F&B
5. **Admin Menu Management** - CRUD món ăn
6. **Admin Orders Management** - Quản lý đơn room service
7. **Admin Tables Management** - Quản lý bàn
8. **Admin Reservations Management** - Quản lý đặt bàn

Bạn muốn bắt đầu phần Frontend không? 🎨
