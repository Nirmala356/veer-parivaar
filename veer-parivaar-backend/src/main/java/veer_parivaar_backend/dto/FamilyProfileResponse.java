package veer_parivaar_backend.dto;

public class FamilyProfileResponse {

    private Long id;
    private Long userId;
    private String email;
    private String phoneNumber;
    private String address;
    private String serviceDetails;

    public FamilyProfileResponse(
            Long id,
            Long userId,
            String email,
            String phoneNumber,
            String address,
            String serviceDetails) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.serviceDetails = serviceDetails;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public String getServiceDetails() {
        return serviceDetails;
    }
}
