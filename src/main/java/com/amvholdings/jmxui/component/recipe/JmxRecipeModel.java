package com.amvholdings.jmxui.component.recipe;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JmxRecipeModel {
  @Getter
  @Setter
  public static class JmxRecipeComponent {
    String componentName;
    String quantity;
    String color;
  }

  String productName;
  List<JmxRecipeComponent> recipeComponent;
}
