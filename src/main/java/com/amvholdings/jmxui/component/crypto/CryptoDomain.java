package com.amvholdings.jmxui.component.crypto;

import com.amvholdings.jmxui.application.Config;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.security.crypto.keygen.KeyGenerators;
import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;


@AllArgsConstructor
@Component
@Slf4j
public class CryptoDomain {

    private final Config config;

    public String getKey() {
        byte[] key =  KeyGenerators.secureRandom(16).generateKey();
        byte[] encodedBytes = Base64.encodeBase64(key);
        return new String(encodedBytes);
    }

    public String encryptString(String text) {
        byte[] key = Base64.decodeBase64(config.getEncryptionKey());
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new SecureRandom());
            byte[] iv = cipher.getIV();
            byte[] value = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
            byte[] result = new byte[iv.length + value.length];
            System.arraycopy(iv, 0, result, 0, iv.length);
            System.arraycopy(value, 0, result, iv.length, value.length);
            return new String(Base64.encodeBase64(result));
        } catch (NoSuchAlgorithmException|NoSuchPaddingException|InvalidKeyException|
                IllegalBlockSizeException| BadPaddingException|NullPointerException ex) {
            log.error(ex.getMessage(), ex);
            return null;
        }
    }

    public String decryptString(String base64EncodedText) {
        byte[] key = Base64.decodeBase64(config.getEncryptionKey());
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            byte[] text = Base64.decodeBase64(base64EncodedText);
            byte[] iv = new byte[12];
            System.arraycopy(text, 0, iv, 0, iv.length);
            int contentLength = text.length - iv.length;
            byte[] content = new byte[contentLength];
            System.arraycopy(text, iv.length, content, 0, contentLength);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(16 * Byte.SIZE, iv));
            byte[] result = cipher.doFinal(content);
            return new String(result);
        } catch (NoSuchAlgorithmException|NoSuchPaddingException|InvalidKeyException|InvalidAlgorithmParameterException|
                IllegalBlockSizeException|BadPaddingException|NullPointerException ex) {
            log.error(ex.getMessage(), ex);
            return null;
        }
    }
}
