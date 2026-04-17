package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.date = :date AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findOverlappingBookings(@Param("date") LocalDate date, 
                                          @Param("startTime") LocalTime startTime, 
                                          @Param("endTime") LocalTime endTime);
}
