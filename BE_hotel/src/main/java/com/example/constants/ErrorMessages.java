package com.example.constants;

public class ErrorMessages {
    
    // Authentication & Authorization
    public static final String UNAUTHORIZED = "Vui lòng đăng nhập để tiếp tục";
    public static final String FORBIDDEN = "Bạn không có quyền thực hiện thao tác này";
    public static final String INVALID_CREDENTIALS = "Tên đăng nhập hoặc mật khẩu không đúng";
    public static final String TOKEN_EXPIRED = "Phiên đăng nhập đã hết hạn";
    
    // User
    public static final String USER_NOT_FOUND = "Không tìm thấy người dùng";
    public static final String USERNAME_EXISTS = "Tên đăng nhập đã tồn tại";
    public static final String EMAIL_EXISTS = "Email đã được sử dụng";
    
    // Room
    public static final String ROOM_NOT_FOUND = "Không tìm thấy phòng";
    public static final String ROOM_NOT_AVAILABLE = "Phòng không khả dụng trong thời gian này";
    public static final String ROOM_NUMBER_EXISTS = "Số phòng đã tồn tại";
    
    // Booking
    public static final String BOOKING_NOT_FOUND = "Không tìm thấy đặt phòng";
    public static final String INVALID_BOOKING_DATES = "Ngày đặt phòng không hợp lệ";
    public static final String BOOKING_CONFLICT = "Phòng đã được đặt trong thời gian này";
    
    // Food
    public static final String FOOD_ITEM_NOT_FOUND = "Không tìm thấy món ăn";
    public static final String FOOD_ITEM_UNAVAILABLE = "Món ăn hiện không khả dụng";
    public static final String FOOD_ORDER_NOT_FOUND = "Không tìm thấy đơn hàng";
    
    // Restaurant
    public static final String TABLE_NOT_FOUND = "Không tìm thấy bàn";
    public static final String TABLE_NOT_AVAILABLE = "Bàn không khả dụng trong thời gian này";
    public static final String RESERVATION_NOT_FOUND = "Không tìm thấy đặt bàn";
    
    // Upload
    public static final String FILE_EMPTY = "File rỗng hoặc không tồn tại";
    public static final String INVALID_FILE_TYPE = "Chỉ hỗ trợ upload ảnh (jpg, png, webp, gif)";
    public static final String FILE_TOO_LARGE = "Kích thước file vượt quá giới hạn cho phép";
    public static final String UPLOAD_FAILED = "Không thể tải file lên";
    
    // Validation
    public static final String REQUIRED_FIELD = "Trường này là bắt buộc";
    public static final String INVALID_FORMAT = "Định dạng không hợp lệ";
    public static final String INVALID_VALUE = "Giá trị không hợp lệ";
    
    // General
    public static final String INTERNAL_ERROR = "Đã xảy ra lỗi server";
    public static final String NOT_FOUND = "Không tìm thấy tài nguyên";
    public static final String BAD_REQUEST = "Yêu cầu không hợp lệ";
    
    private ErrorMessages() {
        // Private constructor to prevent instantiation
    }
}
