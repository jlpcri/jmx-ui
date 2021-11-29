package com.amvholdings.jmxui.component.user

import org.springframework.security.core.Authentication
import spock.lang.Specification

class UserControllerSpec extends Specification {
  Authentication authentication = Mock(Authentication)

  UserController userController = new UserController()

  def 'get user info'(){
    given:
    def jmxAuth = new SimpleAuthority(authority: 'ROLE_JMX')

    when:
    def result = userController.getUserInfo(authentication)

    then:
    1 * authentication.getAuthorities() >> [jmxAuth]
    1 * authentication.getName() >> 'username'
    0 * _

    and:
    result
    result.firstName == null
    result.name == 'username'
    result.roles.size() == 1
    result.roles[0] == 'JMX'
  }
}
