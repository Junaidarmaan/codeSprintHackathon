package com.template.utilities.user.service;

import com.template.utilities.user.entity.Role;
import com.template.utilities.user.entity.User;
import com.template.utilities.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 🔹 Register new user
    public User register(String email, String userName, String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setUserName(userName);
        user.setPassword(password); 
        user.setRole(Role.USER);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    // 🔹 Find user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
