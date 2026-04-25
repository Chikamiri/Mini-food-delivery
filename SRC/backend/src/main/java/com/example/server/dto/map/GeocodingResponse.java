package com.example.server.dto.map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeocodingResponse {
    private String lat;
    
    @JsonProperty("lon")
    private String lng;
    
    @JsonProperty("display_name")
    private String displayName;
}
