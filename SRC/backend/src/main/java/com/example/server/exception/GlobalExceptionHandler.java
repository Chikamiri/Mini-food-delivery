package com.example.server.exception;

import com.example.server.dto.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .errorCode("RESOURCE_NOT_FOUND")
                .build();
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .errorCode(ex.getErrorCode())
                .build();
        return new ResponseEntity<>(response, ex.getStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex) {
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message("An unexpected error occurred: " + ex.getMessage())
                .timestamp(LocalDateTime.now())
                .errorCode("INTERNAL_SERVER_ERROR")
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
