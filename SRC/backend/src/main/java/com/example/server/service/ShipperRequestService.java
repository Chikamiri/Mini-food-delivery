package com.example.server.service;

import com.example.server.dto.shipper.ShipperRequestApproval;
import com.example.server.dto.shipper.ShipperRequestResponse;
import com.example.server.dto.shipper.ShipperRequestSubmission;
import java.util.List;

public interface ShipperRequestService {
    ShipperRequestResponse submitRequest(Long userId, ShipperRequestSubmission request);
    List<ShipperRequestResponse> getUserRequests(Long userId);
    List<ShipperRequestResponse> getAllPendingRequests();
    ShipperRequestResponse processRequest(Long requestId, ShipperRequestApproval approval);
}
