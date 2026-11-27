package lk.uniwork.identity;

import java.util.Locale;
import java.util.regex.Pattern;

/** Structural checks only. A valid number here is not proof of a government record. */
public final class NicNumbers {
    private static final Pattern OLD = Pattern.compile("[0-9]{9}[VX]");
    private static final Pattern NEW = Pattern.compile("[0-9]{12}");
    private NicNumbers() { }

    public static String normalize(String value) {
        return value == null ? "" : value.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT);
    }

    public static boolean valid(String value) {
        String nic = normalize(value);
        if (!OLD.matcher(nic).matches() && !NEW.matcher(nic).matches()) return false;
        int day = Integer.parseInt(nic.substring(NEW.matcher(nic).matches() ? 4 : 2, NEW.matcher(nic).matches() ? 7 : 5));
        if (!((day >= 1 && day <= 366) || (day >= 501 && day <= 866))) return false;
        if (NEW.matcher(nic).matches()) {
            int year = Integer.parseInt(nic.substring(0, 4));
            return year >= 1900 && year <= 2100;
        }
        return true;
    }

}
