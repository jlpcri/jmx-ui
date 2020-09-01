package com.amvholdings.jmxui.component.amvapi;

import com.amvholdings.jmxui.application.Config;
import com.amvholdings.jmxui.component.crypto.CryptoDomain;
import lombok.RequiredArgsConstructor;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@RequiredArgsConstructor
public class AmvClient {
  private final Config config;
  private final CryptoDomain cryptoDomain;

  @Bean(name = "jmx-ui")
  RestTemplate getDataApiRestTemplate(RestTemplateBuilder builder) {
    return builder
      .rootUri(config.getAmvDataApiUrl())
      .basicAuthentication(config.getAmvDataApiUsername(), cryptoDomain.decryptString(config.getAmvDataApiPassword()))
      .requestFactory(() -> new HttpComponentsClientHttpRequestFactory(httpClient()))
      .build();
  }

  private HttpClient httpClient() {
    PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
    return HttpClientBuilder
      .create()
      .setConnectionManager(connectionManager)
      .build();
  }

}
