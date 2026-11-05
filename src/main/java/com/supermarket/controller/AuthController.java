package com.supermarket.controller;

import com.supermarket.entity.Admin;
import com.supermarket.service.AdminService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST API for admin Sign Up, Login, Logout and checking who is logged in.
 * Requests and responses are JSON. The logged-in admin's id is kept in the HTTP session.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminService adminService;

    public AuthController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** POST /api/auth/signup  body: { fullName, email, password, confirmPassword } */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signUp(@RequestBody Map<String, String> body) {
        String errorMessage = adminService.registerAdmin(
                body.getOrDefault("fullName", ""),
                body.getOrDefault("email", ""),
                body.getOrDefault("password", ""),
                body.getOrDefault("confirmPassword", ""));

        if (errorMessage != null) {
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Account created successfully. Please log in."));
    }

    /** POST /api/auth/login  body: { email, password } */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body, HttpSession session) {
        Admin admin = adminService.login(body.getOrDefault("email", ""), body.getOrDefault("password", ""));

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        // Remember who is logged in. The id never changes, even if the email is updated.
        session.setAttribute("adminId", admin.getId());
        return ResponseEntity.ok(Map.of("fullName", admin.getFullName(), "email", admin.getEmail()));
    }

    /** GET /api/auth/me  returns the logged-in admin, or 401 if nobody is logged in */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getLoggedInAdmin(HttpSession session) {
        Long adminId = (Long) session.getAttribute("adminId");
        Admin admin = (adminId == null) ? null : adminService.findAdminById(adminId);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in to continue."));
        }
        return ResponseEntity.ok(Map.of("fullName", admin.getFullName(), "email", admin.getEmail()));
    }

    /** POST /api/auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "You have been logged out."));
    }
}
