package com.amvholdings.jmxui.component.crypto

import spock.lang.Specification

class CryptoEncoderSpec extends Specification {
  CryptoDomain cryptoDomain = Mock(CryptoDomain)

  CryptoEncoder cryptoEncoder = new CryptoEncoder(cryptoDomain)

  CharSequence rawPass = 'raw password'
  def encodedPass = 'encoded password'

  def 'encode'(){
    given:

    when:
    def result = cryptoEncoder.encode(rawPass)

    then:
    1 * cryptoDomain.encryptString(rawPass.toString()) >> encodedPass
    0 * _

    and:
    result
    result == encodedPass
  }

  def 'matches - true'(){
    given:

    when:
    def result = cryptoEncoder.matches(rawPass, encodedPass)

    then:
    1 * cryptoDomain.decryptString(encodedPass) >> 'raw password'
    0 * _

    and:
    result
  }

  def 'matches - false'(){
    given:

    when:
    def result = cryptoEncoder.matches(rawPass, encodedPass)

    then:
    1 * cryptoDomain.decryptString(encodedPass) >> 'raw pass'
    0 * _

    and:
    !result
  }
}

