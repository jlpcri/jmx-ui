package com.amvholdings.jmxui.application;

import com.amvholdings.jmxui.component.crypto.CryptoDomain;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
@RequiredArgsConstructor
public class BasicAuthFilter extends ZuulFilter {

    private final Config config;
    private final CryptoDomain cryptoDomain;

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 10;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        ctx.getRequest().getRequestURL();
        String auth = config.amvDataApiUsername + ":" + cryptoDomain.decryptString(config.amvDataApiUsername);
        String b64Auth = "Basic " + new String(Base64.getEncoder().encode(auth.getBytes()));
        ctx.addZuulRequestHeader("Authorization", b64Auth);
        return null;
    }
}
