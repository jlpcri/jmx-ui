package com.amvholdings.jmxui.component.user


import org.springframework.test.web.servlet.setup.MockMvcBuilders
import spock.lang.Specification

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get

class UserControllerSpec extends Specification {
  def mvc = MockMvcBuilders.standaloneSetup().build()

  def 'get user info'(){
    given:

    when:
    def result = mvc.perform(get('/user/user-info'))

    then:
    0 * _

    and:
    result
  }
}
