package com.rishi.ecom.controller;

import com.rishi.ecom.entity.Category;
import com.rishi.ecom.entity.User;
import com.rishi.ecom.repository.CategoryRepository;
import com.rishi.ecom.security.JwtUtil;
import com.rishi.ecom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // Create category (Admin only)
    @PostMapping
    public Category createCategory(@RequestHeader("Authorization") String authHeader, @RequestBody Category category) {
        User admin = getUserFromAuthHeader(authHeader);
        if (admin.getRole() != User.Role.ADMIN) throw new RuntimeException("Only ADMIN can add categories!");
        return categoryRepository.save(category);
    }

    // Get all (public)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Get one (public)
    @GetMapping("/{id}")
    public Category getCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    // Update category (Admin only)
    @PutMapping("/{id}")
    public Category updateCategory(@RequestHeader("Authorization") String authHeader,
                                   @PathVariable Long id,
                                   @RequestBody Category updatedCategory) {
        User admin = getUserFromAuthHeader(authHeader);
        if (admin.getRole() != User.Role.ADMIN) throw new RuntimeException("Only ADMIN can update categories!");
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(updatedCategory.getName());
        return categoryRepository.save(category);
    }

    // Delete category (Admin only)
    @DeleteMapping("/{id}")
    public String deleteCategory(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        User admin = getUserFromAuthHeader(authHeader);
        if (admin.getRole() != User.Role.ADMIN) throw new RuntimeException("Only ADMIN can delete categories!");
        categoryRepository.deleteById(id);
        return "Category deleted successfully!";
    }

    private User getUserFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) throw new RuntimeException("Missing Authorization header");
        String email = jwtUtil.extractUsername(authHeader.substring(7));
        return userService.getUserByEmail(email);
    }
}
//package com.rishi.ecom.controller;
//
//import com.rishi.ecom.entity.Category;
//import com.rishi.ecom.entity.User;
//import com.rishi.ecom.repository.CategoryRepository;
//import com.rishi.ecom.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/categories")
//public class CategoryController {
//
//    @Autowired
//    private CategoryRepository categoryRepository;
//
//    @Autowired
//    private UserService userService;
//
//    // ✅ Only ADMIN can add category
//    @PostMapping("/{adminId}")
//    public Category createCategory(@PathVariable Long adminId, @RequestBody Category category) {
//        User admin = userService.getUserById(adminId);
//        if (admin.getRole() != User.Role.ADMIN) {
//            throw new RuntimeException("Only ADMIN can add categories!");
//        }
//        return categoryRepository.save(category);
//    }
//
//    // ✅ Anyone can view all categories
//    @GetMapping
//    public List<Category> getAllCategories() {
//        return categoryRepository.findAll();
//    }
//
//    // ✅ Anyone can view category by ID
//    @GetMapping("/{id}")
//    public Category getCategory(@PathVariable Long id) {
//        return categoryRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Category not found"));
//    }
//
//    // ✅ Only ADMIN can update category
//    @PutMapping("/{adminId}/{id}")
//    public Category updateCategory(@PathVariable Long adminId,
//                                   @PathVariable Long id,
//                                   @RequestBody Category updatedCategory) {
//        User admin = userService.getUserById(adminId);
//        if (admin.getRole() != User.Role.ADMIN) {
//            throw new RuntimeException("Only ADMIN can update categories!");
//        }
//
//        Category category = categoryRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Category not found"));
//
//        category.setName(updatedCategory.getName());
//        return categoryRepository.save(category);
//    }
//
//    // ✅ Only ADMIN can delete category
//    @DeleteMapping("/{adminId}/{id}")
//    public void deleteCategory(@PathVariable Long adminId, @PathVariable Long id) {
//        User admin = userService.getUserById(adminId);
//        if (admin.getRole() != User.Role.ADMIN) {
//            throw new RuntimeException("Only ADMIN can delete categories!");
//        }
//
//        categoryRepository.deleteById(id);
//    }
//}
