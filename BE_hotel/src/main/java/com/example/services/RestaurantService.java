// ========================================
// DỊCH VỤ ĐẶT BÀN NHÀ HÀNG (Restaurant Service)
// ========================================
// Xử lý logic liên quan đến:
// - Quản lý bàn nhà hàng (tạo, xóa, cập nhật)
// - Tạo đặt bàn (validate dung tích, kiểm tra conflict thời gian)
// - Hủy đặt bàn (check quyền, trạng thái)
// - Tìm bàn trống trong khung giờ
// - Lấy danh sách đặt bàn theo user/bookingId

package com.example.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.domain.ReservationStatus;
import com.example.domain.RestaurantTable;
import com.example.domain.TableReservation;
import com.example.domain.TableStatus;
import com.example.domain.User;
import com.example.dto.RestaurantTableDTO;
import com.example.dto.TableReservationCreateDTO;
import com.example.dto.TableReservationDTO;
import com.example.repositories.RestaurantTableRepository;
import com.example.repositories.TableReservationRepository;
import com.example.repositories.UserRepository;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private TableReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.repositories.BookingRepository bookingRepository;

    // Table methods
    public List<RestaurantTableDTO> getAllTables() {
        return tableRepository.findAll().stream()
                .map(this::convertTableToDTO)
                .collect(Collectors.toList());
    }

    public List<RestaurantTableDTO> getAvailableTables(Integer minCapacity) {
        if (minCapacity != null) {
            return tableRepository.findByStatusAndCapacityGreaterThanEqual(TableStatus.AVAILABLE, minCapacity)
                    .stream()
                    .map(this::convertTableToDTO)
                    .collect(Collectors.toList());
        }
        return tableRepository.findByStatus(TableStatus.AVAILABLE).stream()
                .map(this::convertTableToDTO)
                .collect(Collectors.toList());
    }

    public RestaurantTableDTO getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bàn không tồn tại"));
        return convertTableToDTO(table);
    }

    // Reservation methods
    @Transactional
    public TableReservationDTO createReservation(TableReservationCreateDTO createDTO, Long userId) {
        RestaurantTable table = tableRepository.findById(createDTO.getTableId())
                .orElseThrow(() -> new IllegalArgumentException("Bàn không tồn tại"));

        // Validate capacity
        if (createDTO.getPartySize() > table.getCapacity()) {
            throw new IllegalArgumentException("Số lượng khách vượt quá sức chứa của bàn");
        }

        // Check for conflicts (2 hour window)
        LocalTime startTime = createDTO.getReservationTime().minusHours(1);
        LocalTime endTime = createDTO.getReservationTime().plusHours(1);
        
        List<TableReservation> conflicts = reservationRepository.findConflictingReservations(
            table, createDTO.getReservationDate(), startTime, endTime
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Bàn đã được đặt trong khung giờ này");
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        TableReservation reservation = new TableReservation();
        reservation.setTable(table);
        reservation.setUser(user);
        
        // Require and set bookingId to link reservation to booking
        if (createDTO.getBookingId() == null) {
            throw new IllegalArgumentException("Đặt bàn phải kèm theo bookingId");
        }
        com.example.domain.Booking booking = bookingRepository.findById(createDTO.getBookingId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy booking tương ứng"));
        reservation.setBooking(booking);
        
        reservation.setGuestName(createDTO.getGuestName());
        reservation.setGuestPhone(createDTO.getGuestPhone());
        reservation.setGuestEmail(createDTO.getGuestEmail());
        reservation.setReservationDate(createDTO.getReservationDate());
        reservation.setReservationTime(createDTO.getReservationTime());
        reservation.setPartySize(createDTO.getPartySize());
        reservation.setSpecialRequests(createDTO.getSpecialRequests());
        reservation.setStatus(ReservationStatus.PENDING);

        TableReservation savedReservation = reservationRepository.save(reservation);
        return convertReservationToDTO(savedReservation);
    }

    public List<TableReservationDTO> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByReservationDateDescReservationTimeDesc(userId)
                .stream()
                .map(this::convertReservationToDTO)
                .collect(Collectors.toList());
    }

    public TableReservationDTO getReservationById(Long id) {
        TableReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đặt bàn không tồn tại"));
        return convertReservationToDTO(reservation);
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long userId) {
        TableReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Đặt bàn không tồn tại"));
        
        if (userId != null && reservation.getUser() != null && !reservation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đặt bàn này");
        }
        
        if (reservation.getStatus() == ReservationStatus.COMPLETED || reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể hủy đặt bàn đã hoàn thành hoặc đã hủy");
        }
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    // Admin methods
    public List<TableReservationDTO> getAllReservations() {
        return reservationRepository.findAllByOrderByReservationDateDescReservationTimeDesc()
                .stream()
                .map(this::convertReservationToDTO)
                .collect(Collectors.toList());
    }

    public List<TableReservationDTO> getReservationsByStatus(ReservationStatus status) {
        return reservationRepository.findByStatus(status).stream()
                .map(this::convertReservationToDTO)
                .collect(Collectors.toList());
    }

    public List<TableReservationDTO> getReservationsByDate(LocalDate date) {
        return reservationRepository.findByReservationDate(date).stream()
                .map(this::convertReservationToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TableReservationDTO updateReservationStatus(Long reservationId, ReservationStatus status) {
        TableReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Đặt bàn không tồn tại"));
        
        reservation.setStatus(status);
        TableReservation updated = reservationRepository.save(reservation);
        return convertReservationToDTO(updated);
    }

    @Transactional
    public RestaurantTableDTO createTable(RestaurantTable table) {
        RestaurantTable saved = tableRepository.save(table);
        return convertTableToDTO(saved);
    }

    @Transactional
    public RestaurantTableDTO updateTable(Long id, RestaurantTable tableDetails) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bàn không tồn tại"));
        
        table.setTableNumber(tableDetails.getTableNumber());
        table.setCapacity(tableDetails.getCapacity());
        table.setLocation(tableDetails.getLocation());
        table.setStatus(tableDetails.getStatus());
        
        RestaurantTable updated = tableRepository.save(table);
        return convertTableToDTO(updated);
    }

    @Transactional
    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bàn không tồn tại"));
        tableRepository.delete(table);
    }

    // Helper methods
    private RestaurantTableDTO convertTableToDTO(RestaurantTable table) {
        return new RestaurantTableDTO(
            table.getId(),
            table.getTableNumber(),
            table.getCapacity(),
            table.getLocation(),
            table.getStatus()
        );
    }

    private TableReservationDTO convertReservationToDTO(TableReservation reservation) {
        TableReservationDTO dto = new TableReservationDTO();
        dto.setId(reservation.getId());
        dto.setTableId(reservation.getTable().getId());
        dto.setTableNumber(reservation.getTable().getTableNumber());
        dto.setBookingId(reservation.getBooking() != null ? reservation.getBooking().getId() : null);
        dto.setGuestName(reservation.getGuestName());
        dto.setGuestPhone(reservation.getGuestPhone());
        dto.setGuestEmail(reservation.getGuestEmail());
        dto.setReservationDate(reservation.getReservationDate());
        dto.setReservationTime(reservation.getReservationTime());
        dto.setPartySize(reservation.getPartySize());
        dto.setStatus(reservation.getStatus());
        dto.setSpecialRequests(reservation.getSpecialRequests());
        return dto;
    }
}
