// Repository quản lý TableReservation: query đặt bàn theo user, booking, conflict giờ
package com.example.repositories;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.domain.ReservationStatus;
import com.example.domain.RestaurantTable;
import com.example.domain.TableReservation;

@Repository
public interface TableReservationRepository extends JpaRepository<TableReservation, Long> {
    
    List<TableReservation> findByUserId(Long userId);
    
    List<TableReservation> findByStatus(ReservationStatus status);
    
    List<TableReservation> findByUserIdOrderByReservationDateDescReservationTimeDesc(Long userId);
    
    List<TableReservation> findAllByOrderByReservationDateDescReservationTimeDesc();
    
    List<TableReservation> findByReservationDate(LocalDate reservationDate);
    
    @Query("SELECT r FROM TableReservation r WHERE r.table = :table " +
           "AND r.reservationDate = :date " +
           "AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED')")
    List<TableReservation> findActiveReservationsByTableAndDate(
        @Param("table") RestaurantTable table, 
        @Param("date") LocalDate date
    );
    
    @Query("SELECT r FROM TableReservation r WHERE r.table = :table " +
           "AND r.reservationDate = :date " +
           "AND r.reservationTime BETWEEN :startTime AND :endTime " +
           "AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED')")
    List<TableReservation> findConflictingReservations(
        @Param("table") RestaurantTable table,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    
    Long countByStatus(ReservationStatus status);
}
