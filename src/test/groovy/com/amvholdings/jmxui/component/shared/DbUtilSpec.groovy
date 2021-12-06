package com.amvholdings.jmxui.component.shared

import spock.lang.Specification

import java.sql.Connection
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.SQLException

import static com.amvholdings.jmxui.component.shared.DbUtil.closeAll

class DbUtilSpec extends Specification {
  Connection conn = Mock(Connection)
  PreparedStatement stmt = Mock(PreparedStatement)
  ResultSet rs = Mock(ResultSet)

  def 'close all'(){
    when:
    closeAll(conn, stmt, rs)

    then:
    1 * rs.close()
    1 * stmt.close()
    1 * conn.close()
    0 * _
  }

  def 'close all - all null'(){
    given:
    conn = null
    stmt = null
    rs = null

    when:
    closeAll(conn, stmt, rs)

    then:
    0 * _
  }

  def 'close all - throw exception'(){
    when:
    closeAll(conn, stmt, rs)

    then:
    1 * rs.close() >> {throw new SQLException('rs')}
    1 * stmt.close() >> {throw new SQLException('stmt')}
    1 * conn.close() >> {throw new SQLException('conn')}
    0 * _
  }
}
