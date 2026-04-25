package com.example.server.controller;

import com.example.server.config.SecurityConfig;
import com.example.server.dto.user.UserRoleUpdateRequest;
import com.example.server.dto.user.UserStatusUpdateRequest;
import com.example.server.security.CustomUserDetails;
import com.example.server.security.CustomUserDetailsService;
import com.example.server.security.JwtAuthFilter;
import com.example.server.security.JwtUtils;
import com.example.server.service.AdminService;
import com.example.server.service.ReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private ReportService reportService;

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private CustomUserDetails adminDetails;

    @BeforeEach
    void setUp() throws Exception {
        adminDetails = CustomUserDetails.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        // Stub the JwtAuthFilter mock to continue the filter chain
        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            HttpServletResponse response = invocation.getArgument(1);
            FilterChain filterChain = invocation.getArgument(2);
            filterChain.doFilter(request, response);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());
    }

    @Test
    void deleteUser_Success() throws Exception {
        Long targetUserId = 2L;

        mockMvc.perform(delete("/api/admin/users/{id}", targetUserId)
                .with(user(adminDetails))
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(adminService).deleteUser(targetUserId);
    }

    @Test
    void deleteUser_SelfDeletion_ShouldReturnBadRequest() throws Exception {
        Long targetUserId = 1L; // Same as adminDetails.id

        mockMvc.perform(delete("/api/admin/users/{id}", targetUserId)
                .with(user(adminDetails))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(adminService, never()).deleteUser(any());
    }

    @Test
    void updateUserRole_SelfDemotion_ShouldReturnBadRequest() throws Exception {
        Long targetUserId = 1L;
        UserRoleUpdateRequest request = new UserRoleUpdateRequest();
        request.setRole("USER");

        mockMvc.perform(patch("/api/admin/users/{id}/role", targetUserId)
                .with(user(adminDetails))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(adminService, never()).updateUserRole(any(), any());
    }

    @Test
    void updateUserStatus_SelfDeactivation_ShouldReturnBadRequest() throws Exception {
        Long targetUserId = 1L;
        UserStatusUpdateRequest request = new UserStatusUpdateRequest();
        request.setActive(false);

        mockMvc.perform(patch("/api/admin/users/{id}/status", targetUserId)
                .with(user(adminDetails))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(adminService, never()).updateUserStatus(any(), any());
    }
}
