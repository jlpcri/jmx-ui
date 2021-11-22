package com.amvholdings.jmxui.component.sourcedata

import com.amvholdings.jmxui.application.Config
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import spock.lang.Specification

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get

class SourceDataControllerSpec extends Specification {
  Config config = new Config(
    appDataSource: 'erplySource',
    appDataSourceSystemName: 'erplyTest'
  )

  SourceDataController sourceDataController = new SourceDataController(config)

  def mvc = MockMvcBuilders.standaloneSetup(sourceDataController).build()

  def 'get source data system name'(){
    given:

    when:
    def result = mvc.perform(get('/sourceData'))

    then:
    0 * _

    and:
    result
  }

}
