package com.supermarket.controller;

import com.supermarket.entity.Item;
import com.supermarket.service.ItemService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
