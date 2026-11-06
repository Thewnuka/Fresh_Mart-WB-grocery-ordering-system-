package com.supermarket.service;

import com.supermarket.entity.Category;
import com.supermarket.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for categories.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByIdAsc();
    }

    /**
     * Checks the details and saves a new category. MySQL creates the id.
     *
     * @return an error message, or null if the category was added successfully
     */
    public String addCategory(String name, String description) {
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
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            return "A category with this name already exists.";
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        categoryRepository.save(category);
        return null;
    }
}
