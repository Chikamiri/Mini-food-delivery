package com.example.server.service;

import com.example.server.dto.owner.OwnerRequestApproval;
import com.example.server.dto.owner.OwnerRequestResponse;
import com.example.server.dto.owner.OwnerRequestSubmission;
import java.util.List;

public interface OwnerRequestService {
    OwnerRequestResponse submitRequest(Long userId, OwnerRequestSubmission request);
    List<OwnerRequestResponse> getUserRequests(Long userId);
    List<OwnerRequestResponse> getAllPendingRequests();
    OwnerRequestResponse processRequest(Long requestId, OwnerRequestApproval approval);
}
