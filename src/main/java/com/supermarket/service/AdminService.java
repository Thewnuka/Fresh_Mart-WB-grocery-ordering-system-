package com.supermarket.service;

import com.supermarket.entity.Admin;
import com.supermarket.repository.AdminRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Business logic for admin sign up, login and profile updates.
 */
@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    /**
     * Validates the sign up details and saves the new admin.
     *
     * @return an error message, or null if the admin was saved successfully
     */
    public String registerAdmin(String fullName, String email, String password, String confirmPassword) {
        fullName = fullName.trim();
        email = email.trim().toLowerCase();

        if (fullName.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            return "All fields are required.";
        }
        String errorMessage = validateNameAndEmail(fullName, email);
        if (errorMessage == null) {
            errorMessage = validateNewPassword(password, confirmPassword);
        }
        if (errorMessage != null) {
            return errorMessage;
        }
        if (adminRepository.existsByEmail(email)) {
            return "An account with this email already exists.";
        }

        String hashedPassword = passwordEncoder.encode(password);
        adminRepository.save(new Admin(fullName, email, hashedPassword));
        return null;
    }

    /**
     * Checks the email and password.
     *
     * @return the matching admin, or null if the email or password is wrong
     */
    public Admin login(String email, String password) {
        Admin admin = adminRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            return admin;
        }
        return null;
    }

    /** Returns the admin with this id, or null if not found. */
    public Admin findAdminById(Long adminId) {
        return adminRepository.findById(adminId).orElse(null);
    }

    /**
     * Updates the full name and email of the admin.
     *
     * @return an error message, or null if the profile was updated successfully
     */
    public String updateProfile(Long adminId, String fullName, String email) {
        fullName = fullName.trim();
        email = email.trim().toLowerCase();

        if (fullName.isEmpty() || email.isEmpty()) {
            return "Full name and email are required.";
        }
        String errorMessage = validateNameAndEmail(fullName, email);
        if (errorMessage != null) {
            return errorMessage;
        }

        // The email may belong to this admin, but not to anyone else
        Admin emailOwner = adminRepository.findByEmail(email).orElse(null);
        if (emailOwner != null && !emailOwner.getId().equals(adminId)) {
            return "An account with this email already exists.";
        }

        Admin admin = findAdminById(adminId);
        admin.setFullName(fullName);
        admin.setEmail(email);
        adminRepository.save(admin);
        return null;
    }

    // ---------- Validation rules shared by sign up and profile ----------

    private String validateNameAndEmail(String fullName, String email) {
        if (fullName.length() > 100 || email.length() > 150) {
            return "Full name or email is too long.";
        }
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return "Please enter a valid email address.";
        }
        return null;
    }

    private String validateNewPassword(String password, String confirmPassword) {
        if (password.length() < 6) {
            return "Password must be at least 6 characters.";
        }
        if (!password.equals(confirmPassword)) {
            return "Passwords do not match.";
        }
        return null;
    }
}
