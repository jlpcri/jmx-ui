package com.amvholdings.jmxui.application

import com.amvholdings.jmxui.component.crypto.CryptoDomain
import com.netflix.zuul.context.RequestContext
import org.mockito.Mockito
import spock.lang.Specification

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class BasicAuthFilterSpec extends Specification {
  Config config = new Config(
    amvDataApiUsername: 'username',
    amvDataApiPassword: 'password'
  )
  CryptoDomain cryptoDomain = Mock(CryptoDomain)

  BasicAuthFilter basicAuthFilter = new BasicAuthFilter(config, cryptoDomain)

  def 'filter type'(){
    when:
    def result = basicAuthFilter.filterType()

    then:
    0 * _

    and:
    result == 'pre'
  }

  def 'filter order'(){
    when:
    def result = basicAuthFilter.filterOrder()

    then:
    0 * _

    and:
    result == 10
  }

  def 'should filter'(){
    when:
    def result = basicAuthFilter.shouldFilter()

    then:
    0 * _

    and:
    result
  }

  def 'run'() {
    given:
    def request = Mockito.mock(HttpServletRequest.class)
    def response = Mockito.mock(HttpServletResponse.class)
    RequestContext.getCurrentContext().request = request
    RequestContext.getCurrentContext().response = response
    RequestContext.getCurrentContext().setResponseGZipped(true)


    when:
    def result = basicAuthFilter.run()

    then:
    1* cryptoDomain.decryptString('password')
    0 * _

    and:
    !result
  }
}
