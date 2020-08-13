package com.amvholdings.jmxui.component.crypto;

import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

@AllArgsConstructor
public class CryptoEncoder implements PasswordEncoder {

    private final CryptoDomain cryptoDomain;

    @Override
    public String encode(CharSequence rawPassword) {
        return cryptoDomain.encryptString(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String password = cryptoDomain.decryptString(encodedPassword);
        return password.equals(rawPassword.toString());
    }
}
