package lk.uniwork.user;

import lk.uniwork.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class StudentProfessionalProfileService {
    private final UserIdentityService identities;
    private final StudentProfileRepository studentProfiles;
    private final StudentProfessionalProfileRepository profiles;
    public StudentProfessionalProfileService(UserIdentityService identities, StudentProfileRepository studentProfiles, StudentProfessionalProfileRepository profiles) { this.identities = identities; this.studentProfiles = studentProfiles; this.profiles = profiles; }

    @Transactional(readOnly = true)
    public StudentProfessionalProfileResponse get(String subject) {
        UniWorkUser user = identities.requireStudent(subject);
        return profiles.findByUserId(user.getId()).map(this::response).orElse(empty(user.getId()));
    }
    @Transactional
    public StudentProfessionalProfileResponse save(String subject, StudentProfessionalProfileRequest request) {
        UniWorkUser user = identities.requireStudent(subject);
        if (request.professionalSummary() != null && wordCount(request.professionalSummary()) > 120) throw new ApiException(HttpStatus.BAD_REQUEST, "SUMMARY_TOO_LONG", "Professional summary must be 120 words or fewer.");
        validateCoordinates(request.primaryLatitude(), request.primaryLongitude(), "primary"); validateCoordinates(request.secondaryLatitude(), request.secondaryLongitude(), "secondary");
        Set<String> skills = new LinkedHashSet<>();
        if (request.skills() != null) for (String skill : request.skills()) { String clean = skill == null ? "" : skill.trim(); if (!clean.isBlank()) skills.add(clean); }
        if (skills.size() > 20) throw new ApiException(HttpStatus.BAD_REQUEST, "TOO_MANY_SKILLS", "Add at most 20 skills.");
        StudentProfessionalProfile profile = profiles.findByUserId(user.getId()).orElseGet(() -> new StudentProfessionalProfile(user.getId()));
        profile.update(clean(request.professionalSummary()), clean(request.primaryLocation()), request.primaryLatitude(), request.primaryLongitude(), clean(request.secondaryLocation()), request.secondaryLatitude(), request.secondaryLongitude(), skills, new LinkedHashSet<>(request.availability() == null ? java.util.List.of() : request.availability()), new LinkedHashSet<>(request.languages() == null ? java.util.List.of() : request.languages()), request.discoverable());
        return response(profiles.save(profile));
    }
    private void validateCoordinates(Double lat, Double lng, String label) { if ((lat == null) != (lng == null) || lat != null && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_" + label.toUpperCase(Locale.ROOT) + "_COORDINATES", "Provide both valid " + label + " coordinates or leave them empty."); }
    private int wordCount(String text) { return text.trim().isBlank() ? 0 : text.trim().split("\\s+").length; }
    private String clean(String value) { return value == null ? null : value.trim().replaceAll("\\s+", " "); }
    private StudentProfessionalProfileResponse empty(java.util.UUID id) { return new StudentProfessionalProfileResponse(id, null, null, null, null, null, null, null, java.util.List.of(), java.util.List.of(), java.util.List.of(), false, null); }
    private StudentProfessionalProfileResponse response(StudentProfessionalProfile p) { return new StudentProfessionalProfileResponse(p.getUserId(), p.getProfessionalSummary(), p.getPrimaryLocation(), p.getPrimaryLatitude(), p.getPrimaryLongitude(), p.getSecondaryLocation(), p.getSecondaryLatitude(), p.getSecondaryLongitude(), p.getSkills().stream().sorted().toList(), p.getAvailability().stream().sorted().toList(), p.getLanguages().stream().sorted().toList(), p.isDiscoverable(), p.getUpdatedAt()); }
}
