package com.amvholdings.jmxui.component.recipe;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RecipeModel {
  Long id;
  String sku;
  String productName;
  String componentName;
  BigDecimal quantity;
}
