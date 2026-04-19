package com.example.server.service;

import com.example.server.dto.auth.JwtResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;

public interface AuthService {
    JwtResponse login(LoginRequest request);
    JwtResponse register(RegisterRequest request);
}
