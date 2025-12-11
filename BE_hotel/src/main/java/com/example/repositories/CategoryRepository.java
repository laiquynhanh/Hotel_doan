// Repository quản lý Category: query danh mục theo tên, slug, trạng thái
package com.example.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.domain.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findBySlug(String slug);
}
