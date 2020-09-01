package com.amvholdings.jmxui.component.recipe;

import com.amvholdings.jmxui.component.amvapi.AmvRecipeListModel;
import com.amvholdings.jmxui.component.amvapi.AmvRecipeModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class RecipeDomain {

  private final RestTemplate restTemplate;

  RecipeDomain(@Qualifier("jmx-ui") RestTemplate restTemplate){
    this.restTemplate = restTemplate;
  }

  public List<AmvRecipeModel> getAmvRecipes(Integer size){
    List<AmvRecipeModel> amvRecipes = new ArrayList<>();

    int resultCount = size;
    int pageId = 0;

    while(resultCount == size){
      String url = buildUrl("/productComponent", size) + "&page=" + pageId;
      AmvRecipeListModel amvRecipeListModel = doGetRequest(url, AmvRecipeListModel.class).getBody();
      if (amvRecipeListModel == null || amvRecipeListModel.getRecipes() == null || amvRecipeListModel.getRecipes().isEmpty()){
        log.info("No AmvRecipes found");
        return amvRecipes;
      }
      resultCount = amvRecipeListModel.getRecipes().size();
      log.info("Count of  " + resultCount + " recipes found");
      pageId += 1;

      amvRecipes.addAll(amvRecipeListModel.getRecipes());
    }

    return amvRecipes;
  }

  private String buildUrl(String rootUrl, Integer size){
    StringBuilder url = new StringBuilder();
    url.append(rootUrl).append("?projection=recipeProjection");

    if (size != null){
      url.append("&size=").append(size);
    }

    return url.toString();
  }

  public <T>ResponseEntity<T> doGetRequest(String url, Class<T> responseType){
    ResponseEntity<T> response = restTemplate.getForEntity(url, responseType);
    return response;
  }


}
