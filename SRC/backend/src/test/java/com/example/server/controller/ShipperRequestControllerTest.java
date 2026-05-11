package com.example.server.controller;

import com.example.server.config.SecurityConfig;
import com.example.server.dto.shipper.ShipperRequestApproval;
import com.example.server.dto.shipper.ShipperRequestResponse;
import com.example.server.dto.shipper.ShipperRequestSubmission;
import com.example.server.enums.ShipperRequestStatus;
import com.example.server.security.CustomUserDetails;
import com.example.server.security.CustomUserDetailsService;
import com.example.server.security.JwtAuthFilter;
import com.example.server.security.JwtUtils;
import com.example.server.service.ShipperRequestService;
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

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShipperRequestController.class)
@Import(SecurityConfig.class)
class ShipperRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShipperRequestService shipperRequestService;

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private CustomUserDetails userDetails;
    private CustomUserDetails adminDetails;

    @BeforeEach
    void setUp() throws Exception {
        userDetails = CustomUserDetails.builder()
                .id(1L)
                .email("user@test.com")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .build();

        adminDetails = CustomUserDetails.builder()
                .id(2L)
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
    void shouldSubmitRequestSuccessfully() throws Exception {
        ShipperRequestSubmission submission = new ShipperRequestSubmission();
        submission.setPhoneNumber("0123456789");
        submission.setLicensePlate("59-A1 12345");

        ShipperRequestResponse response = ShipperRequestResponse.builder()
                .id(1L)
                .userId(1L)
                .userEmail("user@test.com")
                .phoneNumber("0123456789")
                .licensePlate("59-A1 12345")
                .status(ShipperRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(shipperRequestService.submitRequest(eq(1L), any(ShipperRequestSubmission.class))).thenReturn(response);

        mockMvc.perform(post("/api/shipper-requests")
                .with(user(userDetails))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submission)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.phoneNumber").value("0123456789"));
    }

    @Test
    void shouldGetMyRequestsSuccessfully() throws Exception {
        ShipperRequestResponse response = ShipperRequestResponse.builder()
                .id(1L)
                .userId(1L)
                .userEmail("user@test.com")
                .status(ShipperRequestStatus.PENDING)
                .build();

        when(shipperRequestService.getUserRequests(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/shipper-requests/my")
                .with(user(userDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1));
    }

    @Test
    void shouldGetPendingRequestsAsAdminSuccessfully() throws Exception {
        when(shipperRequestService.getAllPendingRequests()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/shipper-requests/pending")
                .with(user(adminDetails)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnForbiddenWhenGettingPendingRequestsAsUser() throws Exception {
        mockMvc.perform(get("/api/shipper-requests/pending")
                .with(user(userDetails)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldProcessRequestAsAdminSuccessfully() throws Exception {
        Long requestId = 1L;
        ShipperRequestApproval approval = new ShipperRequestApproval();
        approval.setApproved(true);
        approval.setAdminNote("Welcome!");

        ShipperRequestResponse response = ShipperRequestResponse.builder()
                .id(requestId)
                .status(ShipperRequestStatus.APPROVED)
                .adminNote("Welcome!")
                .build();

        when(shipperRequestService.processRequest(eq(requestId), any(ShipperRequestApproval.class))).thenReturn(response);

        mockMvc.perform(put("/api/shipper-requests/{id}/process", requestId)
                .with(user(adminDetails))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(approval)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
