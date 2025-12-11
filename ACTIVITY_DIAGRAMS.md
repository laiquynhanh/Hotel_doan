# Activity Diagrams cho Hotel Management System

## 1. Booking Phòng (Room Booking)

```mermaid
activityDiagram-v1
  title Booking Phòng - Room Booking Flow
  start(Start)
  start --> search[Tìm kiếm phòng]
  search --> filter{Lọc theo<br/>ngày tháng, loại phòng}
  filter --> view[Xem danh sách phòng]
  view --> select{Chọn phòng?}
  select -->|Không| search
  select -->|Có| detail[Xem chi tiết phòng]
  detail --> addservice{Thêm dịch vụ?}
  addservice -->|Có| services[Airport Pickup, Spa,<br/>Laundry, Tour Guide]
  services --> coupon
  addservice -->|Không| coupon[Áp dụng coupon?]
  coupon --> booking[Nhập thông tin booking]
  booking --> validate{Thông tin<br/>hợp lệ?}
  validate -->|Không| booking
  validate -->|Có| payment[Chuyển tới thanh toán]
  payment --> paytype{Chọn phương thức<br/>thanh toán}
  paytype -->|VNPay| vnpay[Thanh toán VNPay]
  paytype -->|Khác| other[Phương thức khác]
  vnpay --> confirm{Thanh toán<br/>thành công?}
  other --> confirm
  confirm -->|Không| cancel[Hủy booking]
  cancel --> end(End)
  confirm -->|Có| success[Tạo booking thành công]
  success --> email[Gửi email xác nhận]
  email --> redirect[Chuyển hướng tới<br/>My Bookings]
  redirect --> end
```

## 2. Đặt Bàn Nhà Hàng (Restaurant Booking)

```mermaid
activityDiagram-v1
  title Đặt Bàn Nhà Hàng - Restaurant Booking Flow
  start(Start)
  start --> viewtables[Xem danh sách bàn]
  viewtables --> display[Hiển thị trạng thái<br/>bàn (Available/Booked)]
  display --> select{Chọn bàn}
  select -->|Không| cancel1[Hủy]
  cancel1 --> end(End)
  select -->|Có| form[Hiển thị form đặt bàn]
  form --> fill[Nhập thông tin]
  fill --> filldetail{Nhập đủ<br/>thông tin?}
  filldetail -->|Không| form
  filldetail -->|Có| check{Bàn còn<br/>trống?}
  check -->|Không| error1[Hiển thị lỗi bàn đã đặt]
  error1 --> select
  check -->|Có| confirm[Xác nhận đặt bàn]
  confirm --> success[Đặt bàn thành công]
  success --> dialog{Tiếp tục đặt<br/>dịch vụ khác?}
  dialog -->|Có| additional[Chuyển tới Additional<br/>Services]
  additional --> end
  dialog -->|Không| redirect[Chuyển tới My Reservations]
  redirect --> end
```

## 3. Đặt Đồ Ăn (Food Ordering)

```mermaid
activityDiagram-v1
  title Đặt Đồ Ăn - Food Ordering Flow
  start(Start)
  start --> browse[Xem menu đồ ăn]
  browse --> filter{Lọc theo<br/>danh mục}
  filter --> view[Hiển thị danh sách<br/>đồ ăn]
  view --> select{Chọn đồ ăn}
  select -->|Không| end(End)
  select -->|Có| quantity[Nhập số lượng]
  quantity --> add[Thêm vào giỏ hàng]
  add --> continue{Tiếp tục<br/>mua hàng?}
  continue -->|Có| view
  continue -->|Không| cart[Xem giỏ hàng]
  cart --> review[Kiểm tra đơn hàng]
  review --> address[Nhập địa chỉ giao]
  address --> note[Thêm ghi chú]
  note --> coupon[Áp dụng coupon]
  coupon --> payment[Thanh toán]
  payment --> paytype{Chọn phương thức<br/>thanh toán}
  paytype -->|VNPay| vnpay[Thanh toán VNPay]
  paytype -->|Khác| other[Phương thức khác]
  vnpay --> payconfirm{Thành công?}
  other --> payconfirm
  payconfirm -->|Không| payment
  payconfirm -->|Có| order[Tạo đơn hàng]
  order --> track[Cập nhật trạng thái<br/>PENDING → CONFIRMED → PREPARING<br/>→ DELIVERING → DELIVERED]
  track --> notify[Gửi thông báo khách]
  notify --> complete[Đơn hàng hoàn thành]
  complete --> end
```

## 4. Dịch Vụ Thêm (Additional Services)

```mermaid
activityDiagram-v1
  title Dịch Vụ Thêm - Additional Services Flow
  start(Start)
  start --> check{Đã có booking<br/>phòng?}
  check -->|Không| redirect[Chuyển tới booking]
  redirect --> end(End)
  check -->|Có| view[Xem danh sách dịch vụ]
  view --> display[Hiển thị 4 dịch vụ:<br/>Airport Pickup,<br/>Spa, Laundry,<br/>Tour Guide]
  display --> select{Chọn dịch vụ}
  select -->|Không chọn| skip[Bỏ qua]
  select -->|Chọn 1+| choose[Chọn các dịch vụ]
  choose --> summary[Xem tóm tắt dịch vụ<br/>& giá tiền]
  skip --> confirm1{Xác nhận?}
  summary --> confirm1
  confirm1 -->|Không| select
  confirm1 -->|Có| update[Cập nhật booking<br/>với dịch vụ đã chọn]
  update --> success[Thêm dịch vụ thành công]
  success --> redirect2[Chuyển tới My Bookings]
  redirect2 --> end
```

## 5. Admin Dashboard - Thống Kê Doanh Thu

```mermaid
activityDiagram-v1
  title Admin Dashboard - Revenue Analytics Flow
  start(Start)
  start --> login[Admin đăng nhập]
  login --> auth{Xác thực<br/>thành công?}
  auth -->|Không| end(End)
  auth -->|Có| dashboard[Vào Dashboard]
  dashboard --> load[Load dữ liệu thống kê]
  load --> parallel1{Gọi API<br/>song song}
  parallel1 --> stats[Lấy DashboardStats:<br/>- Tổng user, phòng<br/>- Booking status<br/>- Tổng doanh thu]
  parallel1 --> revenue[Lấy Revenue Breakdown:<br/>- Phòng (Room)<br/>- Đồ ăn (Food)<br/>- Dịch vụ (Services)]
  stats --> process[Xử lý dữ liệu]
  revenue --> process
  process --> render[Render Dashboard]
  render --> display[Hiển thị 4 KPI Cards:<br/>Users, Rooms, Bookings,<br/>Total Revenue]
  display --> revenue_cards[Hiển thị 3 Revenue Cards:<br/>- Room Revenue %<br/>- Food Revenue %<br/>- Services Revenue %]
  revenue_cards --> status_cards[Hiển thị Status Cards:<br/>- Booking Status<br/>- Room Status]
  status_cards --> end
```

## 6. Analytics Page - Chi tiết Thống Kê

```mermaid
activityDiagram-v1
  title Analytics Page - Detailed Analytics Flow
  start(Start)
  start --> page[Vào trang Analytics]
  page --> select_year[Chọn năm]
  select_year --> load_data[Load dữ liệu]
  load_data --> parallel{Gọi API<br/>song song}
  parallel --> overview[Analytics Overview:<br/>- Total Revenue<br/>- Total Bookings<br/>- Total Guests<br/>- Occupancy Rate<br/>- Avg Value]
  parallel --> popular[Popular Rooms:<br/>Top 5 phòng đặt<br/>nhiều nhất]
  parallel --> monthly[Revenue By Month:<br/>Doanh thu<br/>từng tháng]
  parallel --> status[Bookings By Status:<br/>Phân bố booking<br/>theo trạng thái]
  parallel --> coupon[Coupon Usage:<br/>Thống kê dùng<br/>coupon]
  parallel --> breakdown[Revenue Breakdown:<br/>Phân chia doanh thu<br/>từ 3 nguồn]
  overview --> render[Render Charts]
  popular --> render
  monthly --> render
  status --> render
  coupon --> render
  breakdown --> render
  render --> display1[Hiển thị KPI Cards<br/>- Total Revenue<br/>- Total Bookings<br/>- Total Guests<br/>- Avg Booking Value]
  display1 --> display2[Hiển thị Charts]
  display2 --> chart1[Bar Chart:<br/>Monthly Revenue<br/>by Year]
  chart1 --> chart2[Top Phòng Phổ biến<br/>(Ranked List)]
  chart2 --> chart3[Bookings by Status<br/>(Status Distribution)]
  chart3 --> chart4[Coupon Usage Stats<br/>(Top Codes)]
  chart4 --> chart5[Revenue Breakdown<br/>(Room vs Food vs Services)]
  chart5 --> end(End)
```

## 7. Xử lý Thanh Toán (Payment Processing)

```mermaid
activityDiagram-v1
  title Thanh Toán - Payment Processing Flow
  start(Start)
  start --> select_method[Chọn phương thức<br/>thanh toán]
  select_method --> method{Phương thức?}
  method -->|VNPay| vnpay_init[Khởi tạo VNPay]
  method -->|Khác| other[Phương thức khác]
  vnpay_init --> redirect_vnpay[Chuyển hướng tới<br/>VNPay Gateway]
  redirect_vnpay --> user_pay[Người dùng nhập<br/>thông tin thẻ]
  user_pay --> vnpay_process[VNPay xử lý]
  vnpay_process --> check{Giao dịch<br/>thành công?}
  check -->|Lỗi| error[Hiển thị lỗi]
  error --> retry{Thử lại?}
  retry -->|Có| select_method
  retry -->|Không| cancel[Hủy thanh toán]
  cancel --> end(End)
  check -->|Thành công| callback[Nhận callback từ<br/>VNPay]
  callback --> update_db[Cập nhật DB:<br/>- Payment Status<br/>- Booking Status]
  update_db --> email[Gửi email xác nhận]
  email --> success[Hiển thị trang thành công]
  success --> end
  other --> success
```

## 8. Quản lý Đơn Hàng Đồ Ăn (Food Order Management)

```mermaid
activityDiagram-v1
  title Quản lý Đơn Hàng Đồ Ăn - Admin Order Management
  start(Start)
  start --> admin_login[Admin đăng nhập]
  admin_login --> food_orders[Vào trang Food Orders]
  food_orders --> view[Xem danh sách<br/>đơn hàng]
  view --> filter{Lọc theo<br/>trạng thái?}
  filter -->|All| all_orders[Xem tất cả đơn]
  filter -->|Status| status_filter[Lọc đơn theo<br/>trạng thái]
  all_orders --> display[Hiển thị bảng<br/>đơn hàng]
  status_filter --> display
  display --> select{Chọn đơn?}
  select -->|Không| view
  select -->|Có| detail[Xem chi tiết đơn]
  detail --> actions[Các tác vụ:]
  actions --> update_status[Cập nhật trạng thái<br/>PENDING → CONFIRMED<br/>→ PREPARING →<br/>DELIVERING →<br/>DELIVERED]
  update_status --> status_check{Trạng thái<br/>mới?}
  status_check -->|CONFIRMED| confirmed[Xác nhận đơn]
  status_check -->|PREPARING| prepare[Chuẩn bị đồ ăn]
  status_check -->|DELIVERING| deliver[Giao hàng]
  status_check -->|DELIVERED| delivered[Đơn giao xong]
  confirmed --> notify[Gửi thông báo<br/>khách hàng]
  prepare --> notify
  deliver --> notify
  delivered --> notify
  notify --> back[Quay lại danh sách]
  back --> view
  back --> end(End)
```

## 9. User Booking Lifecycle

```mermaid
activityDiagram-v1
  title User Booking Lifecycle - Toàn bộ quá trình
  start(Start)
  start --> register[Đăng ký tài khoản]
  register --> login[Đăng nhập]
  login --> home[Vào trang chủ]
  home --> choice{Chọn dịch vụ}
  choice -->|Booking phòng| room_flow[1. Booking Phòng]
  choice -->|Đặt bàn| table_flow[2. Đặt Bàn]
  choice -->|Đặt đồ ăn| food_flow[3. Đặt Đồ Ăn]
  
  room_flow --> room_details[Tìm & chọn phòng]
  room_details --> add_services[Thêm dịch vụ]
  add_services --> room_payment[Thanh toán]
  room_payment --> room_success[Booking xác nhận]
  
  table_flow --> table_details[Chọn bàn]
  table_details --> table_form[Nhập thông tin]
  table_form --> table_success[Đặt bàn xác nhận]
  
  food_flow --> food_browse[Xem menu]
  food_flow --> food_select[Chọn đồ ăn]
  food_select --> food_payment[Thanh toán]
  food_payment --> food_success[Đơn hàng xác nhận]
  
  room_success --> my_bookings[Vào My Bookings]
  table_success --> my_reservations[Vào My Reservations]
  food_success --> my_orders[Vào My Orders]
  
  my_bookings --> track[Theo dõi booking]
  my_reservations --> track_table[Theo dõi đặt bàn]
  my_orders --> track_order[Theo dõi đơn hàng]
  
  track --> review{Hoàn thành &<br/>muốn review?}
  track_table --> review
  track_order --> review
  
  review -->|Có| submit_review[Viết review &<br/>đánh giá]
  submit_review --> end(End)
  review -->|Không| end
```

## 10. Admin Management Operations

```mermaid
activityDiagram-v1
  title Admin Management - Các tác vụ quản lý
  start(Start)
  start --> admin_page[Admin vào trang<br/>management]
  admin_page --> choice{Chọn module<br/>quản lý}
  
  choice -->|Bookings| booking_mgmt[Quản lý Booking]
  choice -->|Rooms| room_mgmt[Quản lý Phòng]
  choice -->|Users| user_mgmt[Quản lý User]
  choice -->|Food| food_mgmt[Quản lý Đồ Ăn]
  choice -->|Orders| order_mgmt[Quản lý Đơn Hàng]
  choice -->|Coupons| coupon_mgmt[Quản lý Coupon]
  choice -->|Reviews| review_mgmt[Quản lý Review]
  
  booking_mgmt --> booking_actions[Xem, sửa, xóa,<br/>cập nhật trạng thái<br/>booking]
  room_mgmt --> room_actions[Thêm, sửa, xóa<br/>phòng, cập nhật<br/>giá, status]
  user_mgmt --> user_actions[Xem, sửa, xóa user,<br/>thay đổi role]
  food_mgmt --> food_actions[Thêm, sửa, xóa<br/>đồ ăn, cập nhật giá,<br/>toggle available]
  order_mgmt --> order_actions[Xem, cập nhật<br/>trạng thái đơn<br/>hàng đồ ăn]
  coupon_mgmt --> coupon_actions[Tạo, sửa, xóa<br/>coupon, set điều kiện]
  review_mgmt --> review_actions[Xem, phê duyệt,<br/>trả lời, xóa review]
  
  booking_actions --> save[Lưu thay đổi]
  room_actions --> save
  user_actions --> save
  food_actions --> save
  order_actions --> save
  coupon_actions --> save
  review_actions --> save
  
  save --> confirm{Thay đổi<br/>thành công?}
  confirm -->|Không| error[Hiển thị lỗi]
  error --> choice
  confirm -->|Có| success[Hiển thị thành công]
  success --> choice
  success --> end(End)
```

---

## Cách sử dụng:

1. Copy code Mermaid của diagram bạn muốn
2. Vào https://mermaid.live
3. Paste code vào phần code editor bên trái
4. Diagram sẽ tự render bên phải
5. Có thể export thành PNG, SVG, hoặc copy SVG code

Bạn có muốn tôi giải thích chi tiết cho diagram nào không, hoặc cần vẽ thêm diagram cho tác vụ cụ thể nào khác?
