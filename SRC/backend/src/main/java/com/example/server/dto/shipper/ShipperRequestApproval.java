package com.example.server.dto.shipper;

import lombok.Data;

@Data
public class ShipperRequestApproval {
    private boolean approved;
    private String adminNote;
}
