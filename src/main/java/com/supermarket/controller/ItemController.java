package com.supermarket.controller;

import com.supermarket.entity.Item;
import com.supermarket.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * REST API for Item Management. Only logged-in admins can call it (see WebConfig).
 * Add and edit use "multipart/form-data" so an image file can be sent together with the item details.
 */
@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    /** GET /api/items  returns all items with their category */
    @GetMapping
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }

    /** POST /api/items  form fields: name, description, price, stockQuantity, categoryId, image (optional) */
    @PostMapping
    public ResponseEntity<Map<String, String>> addItem(@RequestParam(defaultValue = "") String name,
                                                       @RequestParam(defaultValue = "") String description,
                                                       @RequestParam(defaultValue = "") String price,
                                                       @RequestParam(defaultValue = "") String stockQuantity,
                                                       @RequestParam(defaultValue = "") String categoryId,
                                                       @RequestParam(required = false) MultipartFile image)
            throws IOException {
        String errorMessage = itemService.addItem(name, description, price, stockQuantity, categoryId, image);
        return buildResponse(errorMessage, "Item added successfully.");
    }

    /** PUT /api/items/{id}  form fields: name, description, price, stockQuantity, categoryId */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateItem(@PathVariable Long id,
                                                          @RequestParam(defaultValue = "") String name,
                                                          @RequestParam(defaultValue = "") String description,
                                                          @RequestParam(defaultValue = "") String price,
                                                          @RequestParam(defaultValue = "") String stockQuantity,
                                                          @RequestParam(defaultValue = "") String categoryId)
            throws IOException {
        String errorMessage = itemService.updateItem(id, name, description, price, stockQuantity, categoryId);
        return buildResponse(errorMessage, "Item updated successfully.");
    }

    /** PUT /api/items/{id}/category  body: { categoryId }  changes only the item's category */
    @PutMapping("/{id}/category")
    public ResponseEntity<Map<String, String>> assignCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String errorMessage = itemService.assignCategory(id, String.valueOf(body.getOrDefault("categoryId", "")));
        return buildResponse(errorMessage, "Category assigned successfully.");
    }

    /** DELETE /api/items/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id) {
        String errorMessage = itemService.deleteItem(id);
        return buildResponse(errorMessage, "Item deleted successfully.");
    }

    /** 400 with the error message, or 200 with the success message. */
    private ResponseEntity<Map<String, String>> buildResponse(String errorMessage, String successMessage) {
        if (errorMessage != null) {
            return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
        }
        return ResponseEntity.ok(Map.of("message", successMessage));
    }
}
