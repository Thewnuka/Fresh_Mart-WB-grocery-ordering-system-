package com.supermarket.repository;

import com.supermarket.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Database access for {@link Item} records.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByOrderByIdAsc();

    /** The 5 most recently added items (highest id first), for the dashboard. */
    List<Item> findTop5ByOrderByIdDesc();
}
