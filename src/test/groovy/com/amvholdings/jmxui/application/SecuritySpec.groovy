package com.amvholdings.jmxui.application

import org.springframework.security.config.annotation.ObjectPostProcessor
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import spock.lang.Specification

class SecuritySpec extends Specification {
  Config config = new Config()
  OAuth2UserService oidcUserRequest = Mock(OAuth2UserService)
  def postProcessor = Mock(ObjectPostProcessor)
  def auth = Mock(AuthenticationManagerBuilder)
  def security = new Security(config, oidcUserRequest)

  def 'configure basic auth security'() {
    given:
    def httpSecurity = new HttpSecurity(postProcessor, auth, [:])

    when:
    security.configure(httpSecurity)

    then:
    0 * _
  }
}
