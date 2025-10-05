package com.dakgu.siack.workspace.controller;

import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.ReqDTO_CreateChannel;
import com.dakgu.siack.workspace.service.ChannelRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/channel")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelRequestService channelRequestService;

    @PostMapping("/{workspaceId}/create")
    public ResponseEntity<?> createChannel(Authentication authentication,
                                           @PathVariable("workspaceId") Long workspaceId,
                                           @RequestBody ReqDTO_CreateChannel request) {
        ResponseDTO response = channelRequestService.createChannel(authentication, workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
