package com.amvholdings.jmxui.component.shared;

import lombok.extern.slf4j.Slf4j;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Slf4j
public class DbUtil {
  public static void closeAll(Connection conn, PreparedStatement stmt, ResultSet rs) {
    try { if (rs != null) rs.close(); } catch (SQLException ex) { log.error(ex.getMessage(), ex); }
    try { if (stmt != null) stmt.close(); } catch (SQLException ex) { log.error(ex.getMessage(), ex); }
    try { if (conn != null) conn.close(); } catch (SQLException ex) { log.error(ex.getMessage(), ex); }
  }
}
