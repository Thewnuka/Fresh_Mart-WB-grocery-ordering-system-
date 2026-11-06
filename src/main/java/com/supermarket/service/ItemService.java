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

    /** Folder (inside the project) where item image files are saved. */
    private static final Path IMAGE_FOLDER = Path.of("item-images");
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    /** File names given to uploaded images (a random UUID + extension). Sample images (.svg) never match. */
    private static final String UPLOADED_IMAGE_NAME = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|jpeg|png|gif|webp)";

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
     * Updates an existing item. The image is optional: without a new image the current image is kept.
     *
     * @return an error message, or null if the item was updated successfully
     */
    public String updateItem(Long itemId, String name, String description, String priceText,
                             String stockText, String categoryIdText, MultipartFile image) throws IOException {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return "Item not found.";
        }
        String oldImageName = item.getImageName();

        String errorMessage = saveItem(item, name, description, priceText, stockText, categoryIdText, image);
        if (errorMessage == null && oldImageName != null && !oldImageName.equals(item.getImageName())) {
            deleteImageIfUnused(oldImageName); // the old picture was replaced
        }
        return errorMessage;
    }

    /**
     * Moves an item to another category. Only the category changes; all other item details stay the same.
     *
     * @return an error message, or null if the category was assigned successfully
     */
    public String assignCategory(Long itemId, String categoryIdText) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return "Item not found.";
        }

        Category category = findCategory(categoryIdText);
        if (category == null) {
            return "Please select a valid category.";
        }
        if (category.getId().equals(item.getCategory().getId())) {
            return "This item is already in the selected category.";
        }

        item.setCategory(category);
        itemRepository.save(item);
        return null;
    }

    /**
     * Deletes an item. Its uploaded image file is removed too, unless another item still uses it.
     *
     * @return an error message, or null if the item was deleted successfully
     */
    public String deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return "Item not found.";
        }
        itemRepository.delete(item);
        deleteImageIfUnused(item.getImageName());
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
        if (price.compareTo(new BigDecimal("99999999.99")) > 0) {
            return "Price is too large.";
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

        Category category = findCategory(categoryIdText);
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

    /** Returns the category with this id, or null if the text is not a valid category id. */
    private Category findCategory(String categoryIdText) {
        try {
            return categoryRepository.findById(Long.valueOf(categoryIdText.trim())).orElse(null);
        } catch (NumberFormatException e) {
            return null; // not a number, so it cannot be a category id
        }
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

    /**
     * Removes an uploaded image file when no item uses it any more.
     * Sample images (.svg) and any file name that was not created by an upload are never removed.
     */
    private void deleteImageIfUnused(String imageName) {
        if (imageName == null || !imageName.matches(UPLOADED_IMAGE_NAME) || itemRepository.countByImageName(imageName) > 0) {
            return;
        }
        try {
            Files.deleteIfExists(IMAGE_FOLDER.resolve(imageName));
        } catch (IOException e) {
            // the file could not be removed; the item change itself is already saved
        }
    }
}
