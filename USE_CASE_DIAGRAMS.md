# Use Case Diagrams - Hotel Management System

## 1. Authentication Use Cases (Đăng Ký & Đăng Nhập)

```mermaid
graph TB
    User((User))
    Guest((Guest))
    Admin((Admin/Staff))
    
    Reg["Register<br/>(Đăng Ký)"]
    Login["Login<br/>(Đăng Nhập)"]
    Logout["Logout<br/>(Đăng Xuất)"]
    ForgotPass["Forgot Password<br/>(Quên Mật Khẩu)"]
    ResetPass["Reset Password<br/>(Đặt Lại Mật Khẩu)"]
    
    Guest -->|Tạo tài khoản| Reg
    Guest -->|Đăng nhập hệ thống| Login
    User -->|Đăng xuất| Logout
    User -->|Quên mật khẩu| ForgotPass
    ForgotPass -->|Xác nhận email| ResetPass
    Admin -->|Đăng nhập admin| Login
```

## 2. User Registration Flow

```mermaid
graph LR
    Start([Start]) --> Input["Input Email,<br/>Password,<br/>Full Name"]
    Input --> Validate{"Validation<br/>Pass?"}
    Validate -->|No| Error["Show Error<br/>Message"]
    Error --> Input
    Validate -->|Yes| CheckEmail{"Email<br/>Exists?"}
    CheckEmail -->|Yes| Exists["Email Already<br/>Registered"]
    Exists --> Input
    CheckEmail -->|No| Create["Create User<br/>Account"]
    Create --> Hash["Hash Password"]
    Hash --> Save["Save to<br/>Database"]
    Save --> Success["Send Verification<br/>Email"]
    Success --> End([End])
```

## 3. User Login Flow

```mermaid
graph LR
    Start([Start]) --> Input["Input Email<br/>& Password"]
    Input --> CheckEmail{"Email<br/>Exists?"}
    CheckEmail -->|No| Error1["Email Not Found"]
    Error1 --> End1([Failed])
    CheckEmail -->|Yes| CheckPass{"Password<br/>Correct?"}
    CheckPass -->|No| Error2["Wrong Password"]
    Error2 --> End1
    CheckPass -->|Yes| CheckVerify{"Email<br/>Verified?"}
    CheckVerify -->|No| Error3["Verify Email First"]
    Error3 --> End1
    CheckVerify -->|Yes| GenToken["Generate JWT<br/>Token"]
    GenToken --> SaveSession["Save Session"]
    SaveSession --> Success["Redirect to<br/>Dashboard"]
    Success --> End2([Success])
```

## 4. Admin/Staff Login Flow

```mermaid
graph LR
    Start([Start]) --> Input["Admin/Staff<br/>Login"]
    Input --> CheckEmail{"Email<br/>Exists?"}
    CheckEmail -->|No| Error1["Email Not Found"]
    Error1 --> End1([Failed])
    CheckEmail -->|Yes| CheckPass{"Password<br/>Correct?"}
    CheckPass -->|No| Error2["Wrong Password"]
    Error2 --> End1
    CheckPass -->|Yes| CheckRole{"Is ADMIN<br/>or STAFF?"}
    CheckRole -->|No| Error3["No Admin Access"]
    Error3 --> End1
    CheckRole -->|Yes| GenToken["Generate JWT<br/>Token"]
    GenToken --> SaveSession["Save Admin<br/>Session"]
    SaveSession --> Success["Redirect to<br/>Admin Panel"]
    Success --> End2([Success])
```

## 5. Password Reset Flow

```mermaid
graph LR
    Start([Start]) --> Request["User Request<br/>Password Reset"]
    Request --> CheckEmail{"Email<br/>Exists?"}
    CheckEmail -->|No| Error["Email Not<br/>Found"]
    Error --> End1([Failed])
    CheckEmail -->|Yes| GenToken["Generate<br/>Reset Token"]
    GenToken --> SendEmail["Send Reset Email<br/>with Token Link"]
    SendEmail --> Wait["User Clicks<br/>Email Link"]
    Wait --> CheckToken{"Token<br/>Valid?"}
    CheckToken -->|No| Error2["Token Expired<br/>or Invalid"]
    Error2 --> End1
    CheckToken -->|Yes| Form["Show New<br/>Password Form"]
    Form --> NewPass["User Enter<br/>New Password"]
    NewPass --> Validate{"Password<br/>Valid?"}
    Validate -->|No| Error3["Password<br/>Too Weak"]
    Error3 --> Form
    Validate -->|Yes| Hash["Hash New<br/>Password"]
    Hash --> Update["Update in<br/>Database"]
    Update --> Success["Password Changed<br/>Successfully"]
    Success --> End2([Success])
```

## 6. Complete Authentication Use Case Diagram

```mermaid
actor Guest as "Guest"
actor User as "User"
actor Admin as "Admin/Staff"

rectangle Authentication {
    usecase UC1 as "Register\n(Đăng Ký)"
    usecase UC2 as "Login\n(Đăng Nhập)"
    usecase UC3 as "Logout\n(Đăng Xuất)"
    usecase UC4 as "Forgot Password\n(Quên Mật Khẩu)"
    usecase UC5 as "Reset Password\n(Đặt Lại Mật Khẩu)"
    usecase UC6 as "Verify Email\n(Xác Minh Email)"
    usecase UC7 as "View Profile\n(Xem Hồ Sơ)"
    usecase UC8 as "Edit Profile\n(Chỉnh Sửa Hồ Sơ)"
}

Guest --> UC1
Guest --> UC2
User --> UC3
User --> UC7
User --> UC8
User --> UC4
UC4 --> UC5
UC1 --> UC6
Admin --> UC2
Admin --> UC3
```

## 7. Booking & Reservation Authentication

```mermaid
actor Guest as "Guest"
actor User as "User"
actor Staff as "Staff"
actor Admin as "Admin"

rectangle "Booking Management" {
    usecase UC_Book as "Book Room\n(Đặt Phòng)"
    usecase UC_View as "View Bookings\n(Xem Đặt Phòng)"
    usecase UC_Cancel as "Cancel Booking\n(Hủy Đặt Phòng)"
    usecase UC_UpdateStatus as "Update Booking Status\n(Cập Nhật Trạng Thái)"
}

Guest --> UC_Book
User --> UC_Book
User --> UC_View
User --> UC_Cancel
Staff --> UC_View
Staff --> UC_UpdateStatus
Admin --> UC_View
Admin --> UC_UpdateStatus
Admin --> UC_Cancel
```

## 8. Food Service Authentication

```mermaid
actor Guest as "Guest"
actor User as "User"
actor Staff as "Staff"
actor Admin as "Admin"

rectangle "Food Service Management" {
    usecase UC_Menu as "View Menu\n(Xem Thực Đơn)"
    usecase UC_Order as "Order Food\n(Đặt Món Ăn)"
    usecase UC_ViewOrder as "View Food Orders\n(Xem Đơn Hàng)"
    usecase UC_UpdateOrder as "Update Order Status\n(Cập Nhật Trạng Thái)"
    usecase UC_ManageMenu as "Manage Menu Items\n(Quản Lý Thực Đơn)"
}

Guest --> UC_Menu
User --> UC_Menu
User --> UC_Order
User --> UC_ViewOrder
Staff --> UC_ViewOrder
Staff --> UC_UpdateOrder
Admin --> UC_Menu
Admin --> UC_Order
Admin --> UC_ViewOrder
Admin --> UC_UpdateOrder
Admin --> UC_ManageMenu
```

## 9. Restaurant Reservation Authentication

```mermaid
actor Guest as "Guest"
actor User as "User"
actor Staff as "Staff"
actor Admin as "Admin"

rectangle "Restaurant Reservation" {
    usecase UC_ViewTables as "View Available Tables\n(Xem Bàn Trống)"
    usecase UC_Reserve as "Reserve Table\n(Đặt Bàn)"
    usecase UC_ViewRes as "View Reservations\n(Xem Đặt Bàn)"
    usecase UC_UpdateRes as "Update Reservation\n(Cập Nhật Đặt Bàn)"
    usecase UC_ManageTables as "Manage Tables\n(Quản Lý Bàn)"
}

Guest --> UC_ViewTables
User --> UC_ViewTables
User --> UC_Reserve
User --> UC_ViewRes
Staff --> UC_ViewRes
Staff --> UC_UpdateRes
Admin --> UC_ViewTables
Admin --> UC_Reserve
Admin --> UC_ViewRes
Admin --> UC_UpdateRes
Admin --> UC_ManageTables
```

## 10. Admin Panel Authentication

```mermaid
actor Staff as "Staff"
actor Admin as "Admin"

rectangle "Admin Panel" {
    usecase UC_Dashboard as "View Dashboard\n(Xem Dashboard)"
    usecase UC_ViewUsers as "Manage Users\n(Quản Lý Users)"
    usecase UC_ViewRooms as "Manage Rooms\n(Quản Lý Phòng)"
    usecase UC_Analytics as "View Analytics\n(Xem Phân Tích)"
    usecase UC_Reports as "Generate Reports\n(Tạo Báo Cáo)"
}

Staff --> UC_Dashboard
Staff --> UC_Analytics
Admin --> UC_Dashboard
Admin --> UC_ViewUsers
Admin --> UC_ViewRooms
Admin --> UC_Analytics
Admin --> UC_Reports
```

## Role & Permission Matrix

| Feature | Guest | User | Staff | Admin |
|---------|-------|------|-------|-------|
| **Authentication** | | | | |
| Register | ✅ | - | - | - |
| Login | ✅ | ✅ | ✅ | ✅ |
| Logout | - | ✅ | ✅ | ✅ |
| View Profile | - | ✅ | ✅ | ✅ |
| Edit Profile | - | ✅ | ✅ | ✅ |
| **Room Booking** | | | | |
| View Rooms | ✅ | ✅ | - | ✅ |
| Book Room | ✅* | ✅ | - | ✅ |
| View My Bookings | - | ✅ | - | - |
| View All Bookings | - | - | ✅ | ✅ |
| Update Status | - | - | ✅ | ✅ |
| Delete Booking | - | - | - | ✅ |
| **Food Service** | | | | |
| View Menu | ✅ | ✅ | - | ✅ |
| Order Food | ✅* | ✅ | - | ✅ |
| View My Orders | - | ✅ | - | - |
| View All Orders | - | - | ✅ | ✅ |
| Update Order Status | - | - | ✅ | ✅ |
| Manage Menu | - | - | - | ✅ |
| **Restaurant** | | | | |
| View Tables | ✅ | ✅ | - | ✅ |
| Reserve Table | ✅* | ✅ | - | ✅ |
| View My Reservations | - | ✅ | - | - |
| View All Reservations | - | - | ✅ | ✅ |
| Update Reservation | - | - | ✅ | ✅ |
| Manage Tables | - | - | - | ✅ |
| **Admin** | | | | |
| Dashboard | - | - | ✅ | ✅ |
| Manage Users | - | - | - | ✅ |
| Manage Rooms | - | - | - | ✅ |
| Analytics | - | - | ✅ | ✅ |
| Reports | - | - | - | ✅ |

*Guests need to provide info but don't need to login

## Key Points - Authentication & Authorization

1. **Guest Users** - Có thể xem rooms/menu/tables nhưng đặt phòng/order cần provide thông tin
2. **Regular Users** - Đăng ký/đăng nhập để đặt phòng, đặt món ăn, đặt bàn
3. **STAFF** - Xem & cập nhật trạng thái của bookings, food orders, reservations (read-only dashboard)
4. **ADMIN** - Full control: quản lý users, rooms, coupons, analytics, reports

## Implementation Stack

- **Backend**: Spring Security + JWT tokens
- **Frontend**: AuthContext + AuthService for role-based access control
- **Method Security**: `@EnableMethodSecurity` + `@PreAuthorize` annotations
- **Role Hierarchy**: USER < STAFF < ADMIN
