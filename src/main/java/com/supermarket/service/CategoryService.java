package com.supermarket.service;

import com.supermarket.entity.Category;
import com.supermarket.repository.CategoryRepository;
import com.supermarket.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for adding, viewing, editing and deleting categories.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    public CategoryService(CategoryRepository categoryRepository, ItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByIdAsc();
    }

    /** Returns the category with this id, or null if not found. */
    public Category findCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId).orElse(null);
    }

    /** Number of items that belong to this category. */
    public long countItems(Long categoryId) {
        return itemRepository.countByCategoryId(categoryId);
    }

    /**
     * Checks the details and saves a new category. MySQL creates the id.
     *
     * @return an error message, or null if the category was added successfully
     */
    public String addCategory(String name, String description) {
        return saveCategory(new Category(), name, description);
    }

    /**
     * Updates the name and description of an existing category.
     *
     * @return an error message, or null if the category was updated successfully
     */
    public String updateCategory(Long categoryId, String name, String description) {
        Category category = findCategoryById(categoryId);
        if (category == null) {
            return "Category not found.";
        }
        return saveCategory(category, name, description);
    }

    /**
     * Deletes a category, but only if no items belong to it.
     *
     * @return an error message, or null if the category was deleted successfully
     */
    public String deleteCategory(Long categoryId) {
        Category category = findCategoryById(categoryId);
        if (category == null) {
            return "Category not found.";
        }

        long itemCount = countItems(categoryId);
        if (itemCount > 0) {
            return "This category cannot be deleted because it contains " + itemCount
                    + " item(s). Reassign those items to another category or delete them first.";
        }

        categoryRepository.delete(category);
        return null;
    }

    /**
     * Checks the details and saves them (used by both add and update).
     *
     * @return an error message, or null if the category was saved successfully
     */
    private String saveCategory(Category category, String name, String description) {
        name = (name == null) ? "" : name.trim();
        description = (description == null) ? "" : description.trim();

        if (name.isEmpty()) {
            return "Category name is required.";
        }
        if (name.length() > 100) {
            return "Category name must be 100 characters or less.";
        }
        if (description.length() > 255) {
            return "Description must be 255 characters or less.";
        }

        // The name may belong to this category, but not to a different one
        Category sameName = categoryRepository.findByNameIgnoreCase(name).orElse(null);
        if (sameName != null && !sameName.getId().equals(category.getId())) {
            return "A category with this name already exists.";
        }

        category.setName(name);
        category.setDescription(description);
        categoryRepository.save(category);
        return null;
    }
}
