// Repository quản lý Room: query theo loại, số phòng, từng này
package com.example.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.domain.Room;
import com.example.domain.RoomStatus;
import com.example.domain.RoomType;

public interface RoomRepository extends JpaRepository<Room, Long> {
    
    List<Room> findByStatus(RoomStatus status);
    
    Long countByStatus(RoomStatus status);
    
    List<Room> findByRoomType(RoomType roomType);
    
    Room findByRoomNumber(String roomNumber);
    
    // Tìm phòng trống theo ngày
    @Query("SELECT r FROM Room r WHERE r.id NOT IN " +
           "(SELECT b.room.id FROM Booking b WHERE " +
           "b.status NOT IN ('CANCELLED', 'CHECKED_OUT') AND " +
           "((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn)))")
    List<Room> findAvailableRooms(@Param("checkIn") LocalDate checkIn, 
                                   @Param("checkOut") LocalDate checkOut);
    
    // Tìm phòng trống theo ngày và loại phòng
    @Query("SELECT r FROM Room r WHERE r.roomType = :roomType AND r.id NOT IN " +
           "(SELECT b.room.id FROM Booking b WHERE " +
           "b.status NOT IN ('CANCELLED', 'CHECKED_OUT') AND " +
           "((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn)))")
    List<Room> findAvailableRoomsByType(@Param("checkIn") LocalDate checkIn,
                                         @Param("checkOut") LocalDate checkOut,
                                         @Param("roomType") RoomType roomType);
}
