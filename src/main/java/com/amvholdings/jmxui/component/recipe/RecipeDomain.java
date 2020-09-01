package com.amvholdings.jmxui.component.recipe;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecipeDomain {

  List<RecipeModel> getRecipes(){
    Map<Long, RecipeModel> recipes = new HashMap<>();

    log.info("fetch....");
    return new ArrayList<>();
  }
}
