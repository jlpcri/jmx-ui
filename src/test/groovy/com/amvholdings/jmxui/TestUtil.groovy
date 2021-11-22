package com.amvholdings.jmxui

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import groovy.util.logging.Slf4j

@Slf4j
class TestUtil {
  static String fileContent(String fileName) {
    return TestUtil.classLoader.getResourceAsStream("data/${fileName}").text
  }

  static <T> T jsonContent(String fileName, Class<T> object) {
    ObjectMapper mapper = new ObjectMapper()
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    String content = TestUtil.classLoader.getResourceAsStream("data/${fileName}").text
    return mapper.readValue(content, object)
  }

  static <T> boolean testPojo(T pojo) {
    Object value
    Object result
    pojo.properties.forEach { key, val ->
      def prop = key.toString()
      log.info(prop)
      if (key == 'class')
        return
      pojo[prop] = value
      result = pojo[prop]
    }
    return true
  }
}
