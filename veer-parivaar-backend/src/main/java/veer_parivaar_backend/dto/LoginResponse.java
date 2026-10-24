
package veer_parivaar_backend.dto;

public class LoginResponse {

    private Long id;
    private String email;
    private String role;
    private String token;

    public LoginResponse(
            Long id,
            String email,
            String role,
            String token) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}
