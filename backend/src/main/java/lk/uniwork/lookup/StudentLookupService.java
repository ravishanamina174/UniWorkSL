package lk.uniwork.lookup;

import lk.uniwork.ai.GeminiTextService;
import lk.uniwork.common.ApiException;
import lk.uniwork.user.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentLookupService {
    private final UserIdentityService identities; private final StudentProfessionalProfileRepository profiles; private final StudentProfileRepository studentProfiles; private final GeminiTextService gemini; private final ObjectMapper mapper;
    public StudentLookupService(UserIdentityService identities, StudentProfessionalProfileRepository profiles, StudentProfileRepository studentProfiles, GeminiTextService gemini, ObjectMapper mapper) { this.identities=identities; this.profiles=profiles; this.studentProfiles=studentProfiles; this.gemini=gemini; this.mapper=mapper; }
    @Transactional(readOnly = true)
    public StudentLookupResponse search(String subject, String query) {
        identities.requireTaskPoster(subject);
        StudentLookupCriteria criteria = parse(gemini.interpretLookup(query));
        List<StudentLookupCandidate> result = new ArrayList<>();
        for (StudentProfessionalProfile profile : profiles.findTop200ByDiscoverableTrue()) {
            StudentProfile student = studentProfiles.findById(profile.getUserId()).orElse(null); if (student == null) continue;
            result.add(score(profile, student.getFullName(), criteria));
        }
        return new StudentLookupResponse(criteria, result.stream().sorted(Comparator.comparingInt(StudentLookupCandidate::matchScore).reversed()).limit(10).toList());
    }
    private StudentLookupCriteria parse(String json) {
        try {
            JsonNode root=mapper.readTree(json); List<String> skills=new ArrayList<>(); root.path("skills").forEach(n->{if(n.isTextual()&&!n.asText().isBlank()) skills.add(n.asText().trim());}); List<Availability> av=enumValues(root.path("availability"), Availability.class); List<ProfessionalLanguage> lang=enumValues(root.path("languages"), ProfessionalLanguage.class); String location=root.path("location").isTextual()?root.path("location").asText().trim():null; return new StudentLookupCriteria(skills.stream().distinct().limit(20).toList(), location==null||location.isBlank()?null:location, av, lang);
        } catch (Exception e) { throw new ApiException(HttpStatus.BAD_GATEWAY, "AI_INVALID_OUTPUT", "The AI returned invalid search criteria."); }
    }
    private <E extends Enum<E>> List<E> enumValues(JsonNode node, Class<E> type) { List<E> values=new ArrayList<>(); node.forEach(n->{if(n.isTextual()) try { values.add(Enum.valueOf(type,n.asText().trim().toUpperCase(Locale.ROOT))); } catch (IllegalArgumentException ignored) {} }); return values.stream().distinct().toList(); }
    private StudentLookupCandidate score(StudentProfessionalProfile p, String name, StudentLookupCriteria c) {
        Set<String> candidateSkills=p.getSkills().stream().map(this::norm).collect(Collectors.toSet()); List<String> matchedSkills=c.skills().stream().filter(s->candidateSkills.contains(norm(s))).toList(); boolean skillMatch=!c.skills().isEmpty()&&matchedSkills.size()==c.skills().size(); boolean locationMatch=c.location()==null||contains(p.getPrimaryLocation(),c.location())||contains(p.getSecondaryLocation(),c.location()); boolean availabilityMatch=c.availability().isEmpty()||p.getAvailability().containsAll(c.availability()); boolean languageMatch=c.languages().isEmpty()||p.getLanguages().containsAll(c.languages()); int score=0; if(!c.skills().isEmpty()) score+=Math.round(45f*matchedSkills.size()/c.skills().size()); else score+=45; if(locationMatch) score+=25; if(availabilityMatch) score+=20; if(languageMatch) score+=10; List<String> reasons=new ArrayList<>(); if(skillMatch) reasons.add("Relevant skills match"); if(c.location()!=null&&locationMatch) reasons.add("Preferred location matches"); if(!c.availability().isEmpty()&&availabilityMatch) reasons.add("Availability matches"); if(!c.languages().isEmpty()&&languageMatch) reasons.add("Languages match"); return new StudentLookupCandidate(p.getUserId(),name,p.getProfessionalSummary(),p.getSkills().stream().sorted().toList(),p.getPrimaryLocation(),p.getSecondaryLocation(),p.getAvailability().stream().sorted().toList(),p.getLanguages().stream().sorted().toList(),Math.min(100,score),reasons);
    }
    private boolean contains(String value,String required){return value!=null&&value.toLowerCase(Locale.ROOT).contains(required.toLowerCase(Locale.ROOT));} private String norm(String value){return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]","");}
}
