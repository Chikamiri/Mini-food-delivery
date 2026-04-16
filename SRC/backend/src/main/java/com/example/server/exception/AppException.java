package com.example.server.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {
    private final @lombok.NonNull HttpStatus status;
    private final String errorCode;

    public AppException(@lombok.NonNull HttpStatus status, String message, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }
}
