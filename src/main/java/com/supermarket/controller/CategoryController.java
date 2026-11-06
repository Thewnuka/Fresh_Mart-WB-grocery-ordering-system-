package com.supermarket.controller;

import com.supermarket.entity.Category;
import com.supermarket.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    /** GET /api/categories/{id}  returns { id, name, description, createdAt, itemCount } */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCategory(@PathVariable Long id) {
        Category category = categoryService.findCategoryById(id);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Category not found."));
        }
        return ResponseEntity.ok(Map.of(
                "id", category.getId(),
                "name", category.getName(),
                "description", category.getDescription() == null ? "" : category.getDescription(),
                "createdAt", category.getCreatedAt().toString(),
                "itemCount", categoryService.countItems(id)));
    }

    /** POST /api/categories  body: { name, description } */
    @PostMapping
    public ResponseEntity<Map<String, String>> addCategory(@RequestBody Map<String, String> body) {
        String errorMessage = categoryService.addCategory(
                body.getOrDefault("name", ""), body.getOrDefault("description", ""));
        return buildResponse(errorMessage, "Category added successfully.");
    }

    /** PUT /api/categories/{id}  body: { name, description } */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String errorMessage = categoryService.updateCategory(id,
                body.getOrDefault("name", ""), body.getOrDefault("description", ""));
        return buildResponse(errorMessage, "Category updated successfully.");
    }

    /** DELETE /api/categories/{id}  (only when no items belong to the category) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        String errorMessage = categoryService.deleteCategory(id);
        return buildResponse(errorMessage, "Category deleted successfully.");
    }

    /** 400 with the error message, or 200 with the success message. */
    private ResponseEntity<Map<String, String>> buildResponse(String errorMessage, String successMessage) {
        if (errorMessage != null) {
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
        return ResponseEntity.ok(Map.of("message", successMessage));
    }
}
