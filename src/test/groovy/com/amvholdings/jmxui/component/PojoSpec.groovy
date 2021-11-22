package com.amvholdings.jmxui.component

import com.amvholdings.jmxui.application.Config
import com.amvholdings.jmxui.component.sourcedata.SourceDataModel
import com.amvholdings.jmxui.component.user.UserModel
import spock.lang.Specification

import static com.amvholdings.jmxui.TestUtil.testPojo

class PojoSpec extends Specification{
  def 'test all entity pojos'(){
    expect:
    testPojo(new Config())
    testPojo(new SourceDataModel())
    testPojo(new UserModel())
  }
}
