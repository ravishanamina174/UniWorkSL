package lk.uniwork.identity;

import lk.uniwork.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Component
public class NicOcr {
    private static final Pattern CANDIDATE = Pattern.compile("(?<![A-Z0-9])(?:[0-9]{12}|[0-9]{9}[VX])(?![A-Z0-9])");
    private final String command;
    public NicOcr(@Value("${uniwork.identity.tesseract-command:tesseract}") String command) { this.command = command; }

    public Set<String> extract(byte[] image) {
        Path temporary = null, output = null;
        try {
            temporary = Files.createTempFile("uniwork-nic-", ".jpg");
            output = Files.createTempFile("uniwork-nic-ocr-", ".tsv");
            Files.write(temporary, image);
            Process process = new ProcessBuilder(command, temporary.toString(), "stdout", "-l", "eng", "--psm", "11", "tsv")
                    .redirectErrorStream(true).redirectOutput(output.toFile()).start();
            boolean completed = process.waitFor(Duration.ofSeconds(15).toMillis(), TimeUnit.MILLISECONDS);
            if (!completed) { process.destroyForcibly(); throw unavailable(); }
            if (process.exitValue() != 0) throw unavailable();
            if (Files.size(output)>2_000_000) throw unavailable();
            String tsv = Files.readString(output, java.nio.charset.StandardCharsets.UTF_8);
            return candidatesFromTsv(tsv);
        } catch (java.io.IOException failure) {
            throw unavailable();
        } catch (InterruptedException failure) {
            Thread.currentThread().interrupt(); throw unavailable();
        } finally {
            if (temporary != null) try { Files.deleteIfExists(temporary); } catch (Exception ignored) { }
            if (output != null) try { Files.deleteIfExists(output); } catch (Exception ignored) { }
        }
    }
    static Set<String> candidatesFromTsv(String tsv) {
        record Line(StringBuilder text, int confidence, int words) { }
        Map<String,Line> lines=new HashMap<>();
        for (String row:tsv.split("\\R")) {
            String[] fields=row.split("\\t",12);
            if (fields.length<12 || !fields[0].equals("5")) continue;
            try {
                int confidence=(int)Double.parseDouble(fields[10]);
                if (confidence<0 || fields[11].isBlank()) continue;
                String key=fields[1]+"/"+fields[2]+"/"+fields[3]+"/"+fields[4];
                Line previous=lines.get(key);
                if (previous==null) lines.put(key,new Line(new StringBuilder(fields[11]),confidence,1));
                else lines.put(key,new Line(previous.text().append(fields[11]),previous.confidence()+confidence,previous.words()+1));
            } catch (NumberFormatException ignored) { }
        }
        Set<String> candidates=new HashSet<>();
        for (Line line:lines.values()) {
            if (line.confidence()/line.words()<70) continue;
            String compact=line.text().toString().replaceAll("[\\s-]", "").toUpperCase();
            var match=CANDIDATE.matcher(compact);
            while (match.find()) if (NicNumbers.valid(match.group())) candidates.add(match.group());
        }
        return candidates;
    }
    private ApiException unavailable() { return new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"OCR_UNAVAILABLE","NIC image reading is temporarily unavailable. Please try again later."); }
}
