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
}
