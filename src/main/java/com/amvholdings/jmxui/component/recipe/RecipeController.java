package com.amvholdings.jmxui.component.recipe;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RecipeController {
  private final RecipeDomain recipeDomain;

  @GetMapping("/jmx-ui/api")
  public List<RecipeModel> getRecipes(){
    return recipeDomain.getRecipes();
  }

}
