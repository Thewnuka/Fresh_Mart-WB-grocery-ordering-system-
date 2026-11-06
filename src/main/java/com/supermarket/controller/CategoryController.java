package com.supermarket.controller;

import com.supermarket.entity.Category;
import com.supermarket.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST API for Category Management. Only logged-in admins can call it (see WebConfig).
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /** GET /api/categories  returns all categories */
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    /** POST /api/categories  body: { name, description } */
    @PostMapping
    public ResponseEntity<Map<String, String>> addCategory(@RequestBody Map<String, String> body) {
        String errorMessage = categoryService.addCategory(
                body.getOrDefault("name", ""), body.getOrDefault("description", ""));
        return buildResponse(errorMessage, "Category added successfully.");
    }

    /** 400 with the error message, or 200 with the success message. */
    private ResponseEntity<Map<String, String>> buildResponse(String errorMessage, String successMessage) {
        if (errorMessage != null) {
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
        return ResponseEntity.ok(Map.of("message", successMessage));
    }
}
