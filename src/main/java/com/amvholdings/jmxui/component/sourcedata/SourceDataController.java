package com.amvholdings.jmxui.component.sourcedata;

import com.amvholdings.jmxui.application.Config;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SourceDataController {
  private final Config config;

  @RequestMapping("/sourceData")
  public SourceDataModel getSourceDataSystemName() {
    return SourceDataModel.builder()
      .name(config.getAppDataSource())
      .value(config.getAppDataSourceSystemName())
      .build();
  }
}
