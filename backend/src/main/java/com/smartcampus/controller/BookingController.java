package com.smartcampus.controller;

import com.smartcampus.entity.Booking;
import com.smartcampus.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, @org.springframework.security.core.annotation.AuthenticationPrincipal com.smartcampus.entity.User user) {
        try {
            Booking created = bookingService.createBooking(booking, user);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            Booking approved = bookingService.approveBooking(id);
            return ResponseEntity.ok(approved);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
