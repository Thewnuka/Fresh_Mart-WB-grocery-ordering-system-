package com.supermarket.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;

/**
 * Web settings shared by every REST controller:
 * 1. CORS - lets the React app (http://localhost:5173) call the API with the session cookie.
 * 2. Login check - every /api request except /api/auth/** needs a logged-in admin.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer, HandlerInterceptor {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**"); // login, sign up, logout and "who am I" are open
    }

    /** Runs before each protected request. Returns false (and 401) when nobody is logged in. */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equals(request.getMethod())) {
            return true; // browser CORS check, it never carries the session cookie
        }

        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("adminId") != null) {
            return true;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Please log in to continue.\"}");
        return false;
    }
}
