package com.supermarket.controller;

import com.supermarket.repository.CategoryRepository;
import com.supermarket.repository.ItemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST API for the Admin Dashboard summary. Only logged-in admins can call it (see WebConfig).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    public DashboardController(CategoryRepository categoryRepository, ItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    /** GET /api/dashboard  returns { totalCategories, totalItems, recentItems } read from MySQL */
    @GetMapping
    public Map<String, Object> getDashboard() {
        return Map.of(
                "totalCategories", categoryRepository.count(),
                "totalItems", itemRepository.count(),
                "recentItems", itemRepository.findTop5ByOrderByIdDesc());
    }
}
