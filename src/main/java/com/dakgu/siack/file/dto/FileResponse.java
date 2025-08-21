package com.dakgu.siack.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO for sending data to the client in response to file read requests.
 */
@Getter
@Setter
@AllArgsConstructor
public class FileResponse {

    /**
     * The content of the file read from the remote server.
     */
    private String content;

}
