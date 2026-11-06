package com.supermarket.service;

import com.supermarket.entity.Category;
import com.supermarket.entity.Item;
import com.supermarket.repository.CategoryRepository;
import com.supermarket.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

/**
 * Business logic for items, including saving item images.
 */
@Service
public class ItemService {

    /** For now only one sample item (Samba Rice, id 1) may be edited. */
    public static final Long EDITABLE_ITEM_ID = 1L;

    /** For now only one sample item (Nadu Rice, id 2) may be deleted. */
    public static final Long DELETABLE_ITEM_ID = 2L;

    /** Folder (inside the project) where item image files are saved. */
    private static final Path IMAGE_FOLDER = Path.of("item-images");
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;

    public ItemService(ItemRepository itemRepository, CategoryRepository categoryRepository) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByIdAsc();
    }

    /**
     * Adds a new item. The image is optional.
     *
     * @return an error message, or null if the item was added successfully
     */
    public String addItem(String name, String description, String priceText, String stockText,
                          String categoryIdText, MultipartFile image) throws IOException {
        return saveItem(new Item(), name, description, priceText, stockText, categoryIdText, image);
    }

    /**
     * Updates the details of an existing item.
     *
     * @return an error message, or null if the item was updated successfully
     */
    public String updateItem(Long itemId, String name, String description, String priceText,
                             String stockText, String categoryIdText) throws IOException {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return "Item not found.";
        }
        if (!EDITABLE_ITEM_ID.equals(itemId)) {
            return "Only the Samba Rice sample item can be edited at the moment.";
        }
        return saveItem(item, name, description, priceText, stockText, categoryIdText, null);
    }

    /**
     * Deletes an item.
     *
     * @return an error message, or null if the item was deleted successfully
     */
    public String deleteItem(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            return "Item not found.";
        }
        if (!DELETABLE_ITEM_ID.equals(itemId)) {
            return "Only the Nadu Rice sample item can be deleted at the moment.";
        }
        itemRepository.deleteById(itemId);
        return null;
    }

    /**
     * Checks the item details and saves them (used by both add and update).
     * A new item has no id yet; MySQL creates the id and the creation date is set by the Item class.
     *
     * @return an error message, or null if the item was saved successfully
     */
    private String saveItem(Item item, String name, String description, String priceText,
                            String stockText, String categoryIdText, MultipartFile image) throws IOException {
        name = name.trim();
        description = description.trim();

        if (name.isEmpty()) {
            return "Item name is required.";
        }
        if (name.length() > 100) {
            return "Item name must be 100 characters or less.";
        }
        if (description.length() > 500) {
            return "Description must be 500 characters or less.";
        }

        BigDecimal price;
        try {
            price = new BigDecimal(priceText.trim()).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            return "Please enter a valid price.";
        }
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            return "Price must be greater than zero.";
        }

        int stockQuantity;
        try {
            stockQuantity = Integer.parseInt(stockText.trim());
        } catch (NumberFormatException e) {
            return "Stock quantity must be a whole number.";
        }
        if (stockQuantity < 0) {
            return "Stock quantity cannot be negative.";
        }

        Category category = null;
        try {
            category = categoryRepository.findById(Long.valueOf(categoryIdText.trim())).orElse(null);
        } catch (NumberFormatException e) {
            // not a number, so it cannot be a category id
        }
        if (category == null) {
            return "Please select a valid category.";
        }

        // The name may belong to this item, but not to a different one
        Item sameName = itemRepository.findByNameIgnoreCase(name).orElse(null);
        if (sameName != null && !sameName.getId().equals(item.getId())) {
            return "An item with this name already exists.";
        }

        if (image != null && !image.isEmpty()) {
            String imageName = saveImage(image);
            if (imageName == null) {
                return "Image must be a JPG, PNG, GIF or WEBP file.";
            }
            item.setImageName(imageName);
        }

        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setStockQuantity(stockQuantity);
        item.setCategory(category);
        itemRepository.save(item);
        return null;
    }

    /**
     * Saves the uploaded image in the item-images folder with a new unique file name.
     *
     * @return the new file name, or null if the file type is not allowed
     */
    private String saveImage(MultipartFile image) throws IOException {
        String originalName = String.valueOf(image.getOriginalFilename()).toLowerCase();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
        if (!ALLOWED_IMAGE_TYPES.contains(extension)) {
            return null;
        }

        String fileName = UUID.randomUUID() + extension;
        Files.createDirectories(IMAGE_FOLDER);
        Files.copy(image.getInputStream(), IMAGE_FOLDER.resolve(fileName));
        return fileName;
    }
}
