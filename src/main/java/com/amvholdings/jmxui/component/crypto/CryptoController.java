package com.amvholdings.jmxui.component.crypto;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/v1")
public class CryptoController {

    private final CryptoDomain cryptoDomain;

    @GetMapping("/get-key")
    String getKey() {
        return cryptoDomain.getKey();
    }

    @GetMapping("/encrypt")
    String encryptString(@RequestParam String text) {
        return cryptoDomain.encryptString(text);
    }
}
