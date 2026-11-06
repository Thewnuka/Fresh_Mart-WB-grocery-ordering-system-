package com.supermarket.repository;

import com.supermarket.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Database access for {@link Item} records.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByOrderByIdAsc();

    Optional<Item> findByNameIgnoreCase(String name);

    /** The 5 most recently added items (highest id first), for the dashboard. */
    List<Item> findTop5ByOrderByIdDesc();

    /** Number of items in a category (used to stop deleting a category that still has items). */
    long countByCategoryId(Long categoryId);

    /** Number of items that use this image file (an image file is only removed when no item uses it). */
    long countByImageName(String imageName);
}
