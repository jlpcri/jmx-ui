package com.amvholdings.jmxui.component.user

import org.springframework.security.core.GrantedAuthority

class SimpleAuthority implements GrantedAuthority{
  String authority

  @Override
  String toString() {
    return authority
  }
}
