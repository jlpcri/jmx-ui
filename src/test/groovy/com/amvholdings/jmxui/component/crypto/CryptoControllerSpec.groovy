package com.amvholdings.jmxui.component.crypto

import org.springframework.test.web.servlet.setup.MockMvcBuilders
import spock.lang.Specification

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get

class CryptoControllerSpec extends Specification {
  CryptoDomain cryptoDomain = Mock(CryptoDomain)

  CryptoController cryptoController = new CryptoController(cryptoDomain)

  def mvc = MockMvcBuilders.standaloneSetup(cryptoController).build()

  def 'request a new encryption key'(){
    given:

    when:
    def result = mvc.perform(get("/v1/get-key"))

    then:
    1 * cryptoDomain.getKey()
    0 * _

    and:
    result
  }

  def 'encrypt a string'(){
    given:
    def decryptedText = 'password'

    when:
    def result = mvc.perform(get('/v1/encrypt?text=' + decryptedText))

    then:
    1 * cryptoDomain.encryptString(decryptedText)
    0 * _

    and:
    result
  }
}
