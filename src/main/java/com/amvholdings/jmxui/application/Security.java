package com.amvholdings.jmxui.application;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@AllArgsConstructor
@Configuration
@EnableWebSecurity
public class Security extends WebSecurityConfigurerAdapter {
    private final Config config;

    @Autowired
    private final OAuth2UserService<OidcUserRequest, OidcUser> oidcUserRequest;


    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable();
        http.authorizeRequests()
                .antMatchers("/user/user-info")
                .authenticated()
                .antMatchers("/api/**")
                .hasRole("JMX App")
              .and()
                .logout()
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .deleteCookies()
                .invalidateHttpSession(true)
                .logoutSuccessUrl(config.getEndSessionEndpoint() + config.getAppBaseUrl())
              .and()
                .oauth2Login()
                .loginPage("/login/login.html")
                .userInfoEndpoint()
                .oidcUserService(oidcUserRequest)
        ;
    }
}
