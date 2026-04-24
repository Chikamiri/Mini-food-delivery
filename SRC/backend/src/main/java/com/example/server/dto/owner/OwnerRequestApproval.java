package com.example.server.dto.owner;

import lombok.Data;

@Data
public class OwnerRequestApproval {
    private boolean approved;
    private String adminNote;
}
