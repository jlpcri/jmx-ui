package com.amvholdings.jmxui.component.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class UserController {

    @GetMapping("/user/user-info")
    UserModel getUserInfo(Authentication auth)  {
        List<String> roles = auth.getAuthorities().stream()
                .map(Object::toString)
                .map(role -> role.replaceFirst("^ROLE_",""))
                .collect(Collectors.toList());

        DefaultOidcUser principal = (DefaultOidcUser)auth.getPrincipal();
        Map<String, Object> principalAttributes = principal.getAttributes();
        String username = principalAttributes.get("upn").toString();

        return UserModel.builder()
                .username(username)
                .name(auth.getName())
                .roles(roles)
                .signed(true)
                .build();
    }

}
