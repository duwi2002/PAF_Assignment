package com.smartcampus.service;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public Map<String, String> register(User request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        Map<String, String> response = new HashMap<>();
        response.put("token", jwtToken);
        return response;
    }

    public Map<String, String> authenticate(User request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        
        String jwtToken = jwtService.generateToken(user);
        Map<String, String> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("role", user.getRole().name());
        return response;
    }
}
