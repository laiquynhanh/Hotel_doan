package com.example.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.domain.Category;
import com.example.dto.CategoryDTO;
import com.example.repositories.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> getAll() {
    return categoryRepository.findAll().stream()
        .map(c -> new CategoryDTO(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(), c.getActive()))
                .collect(Collectors.toList());
    }

    public CategoryDTO getById(Long id) {
        Category c = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        return new CategoryDTO(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(), c.getActive());
    }

    public CategoryDTO create(CategoryDTO dto) {
        Category c = new Category();
        c.setName(dto.getName());
        c.setSlug(dto.getSlug());
        c.setDescription(dto.getDescription());
        c.setImageUrl(dto.getImageUrl());
        c.setActive(dto.getActive() == null ? true : dto.getActive());
        Category saved = categoryRepository.save(c);
        return new CategoryDTO(saved.getId(), saved.getName(), saved.getSlug(), saved.getDescription(), saved.getImageUrl(), saved.getActive());
    }

    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category c = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        c.setName(dto.getName());
        c.setSlug(dto.getSlug());
        c.setDescription(dto.getDescription());
        c.setImageUrl(dto.getImageUrl());
        c.setActive(dto.getActive() == null ? c.getActive() : dto.getActive());
        Category saved = categoryRepository.save(c);
        return new CategoryDTO(saved.getId(), saved.getName(), saved.getSlug(), saved.getDescription(), saved.getImageUrl(), saved.getActive());
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}
