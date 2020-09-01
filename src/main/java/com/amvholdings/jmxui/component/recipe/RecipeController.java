package com.amvholdings.jmxui.component.recipe;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class RecipeController {
  private final RecipeDomain recipeDomain;

  @GetMapping("/jmx-ui/api")
  public List<RecipeModel> getRecipes(){
    log.info("abcdefg");
    return recipeDomain.getRecipes();
  }

}
