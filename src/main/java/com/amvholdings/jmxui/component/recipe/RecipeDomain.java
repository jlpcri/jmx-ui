package com.amvholdings.jmxui.component.recipe;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.amvholdings.jmxui.component.shared.DbUtil.closeAll;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecipeDomain {
  private final DataSource dataSource;

  final String sql = "";

  private RecipeModel getRow(ResultSet rs, RecipeModel recipeModel) throws SQLException {
    if (recipeModel == null){
      recipeModel = new RecipeModel();
    }
    int n = 0;
    recipeModel.id = rs.getLong(++n);
    recipeModel.sku = rs.getString(++n);
    recipeModel.productName = rs.getString(++n);
    recipeModel.componentName = rs.getString(++n);
    recipeModel.quantity = rs.getBigDecimal(++n);

    return recipeModel;
  }

  List<RecipeModel> getRecipes(){
    Map<Long, RecipeModel> recipes = new HashMap<>();
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet rs = null;

    log.info(sql);
    try {
      conn = dataSource.getConnection();
      stmt = conn.prepareStatement(sql);
      rs = stmt.executeQuery();
      log.info("query complete");
      while (rs.next()){
        Long recipeId = rs.getLong(1);;
        RecipeModel recipeModel = recipes.get(recipeId);
        recipes.put(recipeId, getRow(rs, recipeModel));
      }
    } catch (SQLException ex){
      log.error(ex.getMessage(), ex);
    } finally {
      closeAll(conn, stmt, rs);
    }
    log.info("results complete");
    return new ArrayList<>(recipes.values());
  }
}
