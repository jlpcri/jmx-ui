package com.amvholdings.jmxui.application;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@Configuration
@ConfigurationProperties(prefix = "jmx-ui")
public class Config {
    String amvDataApiUrl;
    String amvDataApiUsername;
    String amvDataApiPassword;
    String encryptionKey;
    String endSessionEndpoint;
    String appBaseUrl;
    String appDataSource = "erplySource";
    String appDataSourceSystemName;
}
