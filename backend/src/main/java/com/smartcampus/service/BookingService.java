package com.smartcampus.service;

import com.smartcampus.entity.Booking;
import com.smartcampus.entity.User;
import com.smartcampus.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    public Booking createBooking(Booking booking, User user) {
        // Prevent overlapping bookings
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                booking.getDate(), booking.getStartTime(), booking.getEndTime());
        
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Booking overlaps with an existing reservation.");
        }
        
        booking.setUser(user);
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking approveBooking(Long id) {
        Optional<Booking> optionalBooking = bookingRepository.findById(id);
        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            booking.setStatus("APPROVED");
            Booking savedBooking = bookingRepository.save(booking);

            // Trigger notification
            String message = "Your booking for " + booking.getDate() + " (" + 
                             booking.getStartTime() + " - " + booking.getEndTime() + ") has been APPROVED.";
            notificationService.createNotification(booking.getUser(), message);
            
            return savedBooking;
        } else {
            throw new RuntimeException("Booking not found with id: " + id);
        }
    }
}
