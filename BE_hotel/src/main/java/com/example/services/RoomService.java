// ========================================
// DỊCH VỤ PHÒNG (Room Service)
// ========================================
// Xử lý logic liên quan đến:
// - Tìm phòng trống (search by date, loại, giá)
// - Lấy danh sách tất cả phòng
// - Lấy chi tiết phòng
// - Cập nhật trạng thái phòng
// - Validate ngày nhận/trả phòng

package com.example.services;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.domain.Room;
import com.example.domain.RoomType;
import com.example.dto.RoomDTO;
import com.example.repositories.CategoryRepository;
import com.example.repositories.RoomRepository;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.example.repositories.BookingRepository bookingRepository;

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        RoomDTO dto = convertToDTO(room);
        dto.setCategory(mapCategory(room.getCategory()));
        return dto;
    }

    public List<RoomDTO> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut, String roomType) {
        return searchAvailableRooms(checkIn, checkOut, roomType, null);
    }

    public List<RoomDTO> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut, String roomType, Integer minCapacity) {
        System.out.println("[DEBUG] searchAvailableRooms called with checkIn: " + checkIn + ", checkOut: " + checkOut + ", roomType: " + roomType + ", minCapacity: " + minCapacity);
        
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }

        if (checkIn.isAfter(checkOut) || checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Invalid date range");
        }

        List<Room> candidateRooms;
        if (roomType != null && !roomType.isEmpty()) {
            try {
                RoomType type = RoomType.valueOf(roomType.toUpperCase());
                candidateRooms = roomRepository.findByRoomType(type);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid room type");
            }
        } else {
            candidateRooms = roomRepository.findAll();
        }
        
        System.out.println("[DEBUG] Total candidate rooms: " + candidateRooms.size());

        return candidateRooms.stream()
                .map(r -> {
                    RoomDTO dto = convertToDTO(r);
                    dto.setCategory(mapCategory(r.getCategory()));

                    // Check capacity filter
                    if (minCapacity != null && r.getCapacity() < minCapacity) {
                        System.out.println("[DEBUG] Room " + r.getRoomNumber() + " (capacity: " + r.getCapacity() + ") filtered out - below minCapacity: " + minCapacity);
                        return null; // Mark for filtering
                    }

                    // Check for conflicting bookings in requested range
                    try {
                        java.time.LocalDate reqCheckIn = checkIn;
                        java.time.LocalDate reqCheckOut = checkOut;
                        java.util.List<com.example.domain.Booking> conflicts = bookingRepository.findConflictingBookings(r.getId(), reqCheckIn, reqCheckOut);
                        System.out.println("[DEBUG] Room " + r.getRoomNumber() + " (ID: " + r.getId() + ") has " + 
                                         (conflicts != null ? conflicts.size() : 0) + " conflicting bookings");
                        
                        if (conflicts == null || conflicts.isEmpty()) {
                            dto.setAvailable(true);
                            dto.setAvailableFrom(null);
                            dto.setDaysUntilAvailable(0);
                        } else {
                            // compute latest checkOut among conflicts
                            java.time.LocalDate latest = conflicts.stream()
                                    .map(com.example.domain.Booking::getCheckOutDate)
                                    .max(java.time.LocalDate::compareTo)
                                    .orElse(reqCheckIn);
                            // business rule: available from the day after latest checkOut
                            java.time.LocalDate availableFrom = latest.plusDays(1);
                            long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(reqCheckIn, availableFrom);
                            dto.setAvailable(false);
                            dto.setAvailableFrom(availableFrom);
                            dto.setDaysUntilAvailable((int) Math.max(daysUntil, 0));
                        }
                    } catch (Exception ex) {
                        // If bookingRepository or logic fails, default to available=true to avoid blocking users
                        dto.setAvailable(true);
                    }

                    return dto;
                })
                .filter(dto -> dto != null && Boolean.TRUE.equals(dto.getAvailable()))
                .collect(Collectors.toList());
    }

    public RoomDTO createRoom(RoomDTO roomDTO) {
        if (roomRepository.findByRoomNumber(roomDTO.getRoomNumber()) != null) {
            throw new IllegalArgumentException("Room number already exists");
        }

        Room room = new Room();
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setRoomType(roomDTO.getRoomType());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setStatus(roomDTO.getStatus());
        room.setCapacity(roomDTO.getCapacity());
        room.setSize(roomDTO.getSize());
        room.setDescription(roomDTO.getDescription());
        room.setImageUrl(roomDTO.getImageUrl());
        room.setAmenities(roomDTO.getAmenities());
        // Nếu có category trong DTO, liên kết category (nullable)
        if (roomDTO.getCategory() != null && roomDTO.getCategory().getId() != null) {
            var cat = categoryRepository.findById(roomDTO.getCategory().getId()).orElse(null);
            room.setCategory(cat);
        }

        Room savedRoom = roomRepository.save(room);
        RoomDTO dto = convertToDTO(savedRoom);
        dto.setCategory(mapCategory(savedRoom.getCategory()));
        return dto;
    }

    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        room.setRoomType(roomDTO.getRoomType());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setStatus(roomDTO.getStatus());
        room.setCapacity(roomDTO.getCapacity());
        room.setSize(roomDTO.getSize());
        room.setDescription(roomDTO.getDescription());
        room.setImageUrl(roomDTO.getImageUrl());
        room.setAmenities(roomDTO.getAmenities());
        if (roomDTO.getCategory() != null && roomDTO.getCategory().getId() != null) {
            var cat = categoryRepository.findById(roomDTO.getCategory().getId()).orElse(null);
            room.setCategory(cat);
        }

        Room updatedRoom = roomRepository.save(room);
        RoomDTO dto = convertToDTO(updatedRoom);
        dto.setCategory(mapCategory(updatedRoom.getCategory()));
        return dto;
    }

    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new IllegalArgumentException("Room not found");
        }
        roomRepository.deleteById(id);
    }

    private RoomDTO convertToDTO(Room room) {
    RoomDTO dto = new RoomDTO(
        room.getId(),
        room.getRoomNumber(),
        room.getRoomType(),
        room.getPricePerNight(),
        room.getStatus(),
        room.getCapacity(),
        room.getSize(),
        room.getDescription(),
        room.getImageUrl(),
        room.getAmenities()
    );
    dto.setCategory(mapCategory(room.getCategory()));
    return dto;
    }

    private com.example.dto.CategoryDTO mapCategory(com.example.domain.Category category) {
        if (category == null) return null;
    return new com.example.dto.CategoryDTO(
        category.getId(),
        category.getName(),
        category.getSlug(),
        category.getDescription(),
        category.getImageUrl(),
        category.getActive()
    );
    }
}
