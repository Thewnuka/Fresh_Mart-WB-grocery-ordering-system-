package com.supermarket.service;

import com.supermarket.entity.Item;
import com.supermarket.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for items.
 */
@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByIdAsc();
    }
}
