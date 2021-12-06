package com.amvholdings.jmxui.application

import org.springframework.boot.SpringApplication
import spock.lang.Specification

import static com.amvholdings.jmxui.application.Main.main

class MainSpec extends Specification{
  SpringApplication springApplication = Mock(SpringApplication)

  def 'test main method'() {
    given:
    def args = ['one', 'two']

    when:
    main(args as String)

    then:
    0 * _
  }
}
