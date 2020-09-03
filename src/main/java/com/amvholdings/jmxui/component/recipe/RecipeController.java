package com.amvholdings.jmxui.component.recipe;

import com.amvholdings.jmxui.component.amvapi.AmvRecipeModel;
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
  private static final Integer AMV_RECIPE_SIZE = 100;

  @GetMapping("/jmx-ui/api-v2")
  public List<JmxRecipeModel> getJmxRecipes(){
    List<JmxRecipeModel> jmxRecipeList = new ArrayList<>();
    log.info("Retrieving Recipes...");
    List<AmvRecipeModel> amvRecipeList = recipeDomain.getAmvRecipes(AMV_RECIPE_SIZE);

    System.out.println(amvRecipeList);


    return jmxRecipeList;
  }

}
