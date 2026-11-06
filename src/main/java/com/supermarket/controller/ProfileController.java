package com.supermarket.controller;

import com.supermarket.entity.Admin;
import com.supermarket.service.AdminService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST API for the logged-in admin's own profile.
 * The admin is always identified from the session, so an admin can only see and change their own account.
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AdminService adminService;

    public ProfileController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** GET /api/profile  returns { fullName, email, createdAt } */
    @GetMapping
    public ResponseEntity<Map<String, String>> getProfile(HttpSession session) {
        Admin admin = getLoggedInAdmin(session);
        if (admin == null) {
            return notLoggedIn();
        }
        return ResponseEntity.ok(profileOf(admin, "Profile loaded."));
    }

    /** PUT /api/profile  body: { fullName, email } */
    @PutMapping
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody Map<String, String> body, HttpSession session) {
        Admin admin = getLoggedInAdmin(session);
        if (admin == null) {
            return notLoggedIn();
        }

        String errorMessage = adminService.updateProfile(admin.getId(),
                body.getOrDefault("fullName", ""),
                body.getOrDefault("email", ""));

        if (errorMessage != null) {
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
        Admin updatedAdmin = adminService.findAdminById(admin.getId());
        return ResponseEntity.ok(profileOf(updatedAdmin, "Profile updated successfully."));
    }

    // ---------- Helper methods ----------

    /** Returns the admin whose id is in the session, or null if nobody is logged in. */
    private Admin getLoggedInAdmin(HttpSession session) {
        Long adminId = (Long) session.getAttribute("adminId");
        return (adminId == null) ? null : adminService.findAdminById(adminId);
    }

    private ResponseEntity<Map<String, String>> notLoggedIn() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Please log in to continue."));
    }

    private Map<String, String> profileOf(Admin admin, String message) {
        return Map.of(
                "fullName", admin.getFullName(),
                "email", admin.getEmail(),
                "createdAt", admin.getCreatedAt().toString(),
                "message", message);
    }
}
