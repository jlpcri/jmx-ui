package com.amvholdings.jmxui.component.amvapi;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AmvRecipeModel {
  String sku;
  String productName;
  String componentName;
  BigDecimal quantity;
}
