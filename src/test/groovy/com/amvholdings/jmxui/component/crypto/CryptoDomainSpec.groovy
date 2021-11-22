package com.amvholdings.jmxui.component.crypto

import com.amvholdings.jmxui.application.Config
import spock.lang.Specification

class CryptoDomainSpec extends Specification {
  Config config = new Config(
    encryptionKey: 'T9mDWnPv1iuK5rnF7Mx33A=='
  )

  CryptoDomain cryptoDomain = new CryptoDomain(config)

  def encryptedText = 'XsHwXxWp8c+dSDVPTOK4wg0nJXMmuR4U5q2VyEUrnIQYCuiO'
  def decryptedText = 'password'

  def 'encrypt a string returns null on error'() {
    when:
    def result = cryptoDomain.encryptString(null)

    then:
    result == null
  }

  def 'encrypt a string'() {
    when:
    def result = cryptoDomain.encryptString(decryptedText)

    then:
    result
  }

  def 'decrypt a string'() {
    when:
    def result = cryptoDomain.decryptString(encryptedText)

    then:
    result
  }

  def 'decrypt a string returns null on error'() {
    given:
    config.encryptionKey = '1234'

    when:
    def text = cryptoDomain.decryptString(encryptedText)

    then:
    text == null
  }

  def 'get key'(){
    given:

    when:
    def result = cryptoDomain.getKey()

    then:
    0 * _

    and:
    result
  }
}
