package com.supermarket.controller;

import com.supermarket.entity.Item;
import com.supermarket.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST API for Item Management. Only logged-in admins can call it (see WebConfig).
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

    /** PUT /api/items/{id}  form fields: name, description, price, stockQuantity, categoryId */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateItem(@PathVariable Long id,
                                                          @RequestParam(defaultValue = "") String name,
                                                          @RequestParam(defaultValue = "") String description,
                                                          @RequestParam(defaultValue = "") String price,
                                                          @RequestParam(defaultValue = "") String stockQuantity,
                                                          @RequestParam(defaultValue = "") String categoryId) {
        String errorMessage = itemService.updateItem(id, name, description, price, stockQuantity, categoryId);
        return buildResponse(errorMessage, "Item updated successfully.");
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
