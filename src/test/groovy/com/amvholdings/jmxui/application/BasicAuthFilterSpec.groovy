package com.amvholdings.jmxui.application

import com.amvholdings.jmxui.component.crypto.CryptoDomain
import spock.lang.Specification

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
}
