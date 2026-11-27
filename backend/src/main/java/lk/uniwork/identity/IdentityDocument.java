package lk.uniwork.identity;

import lk.uniwork.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class IdentityDocument {
    private static final long MAX_PIXELS = 12_000_000L;
    private static final int MAX_DIMENSION = 6000;
    public record Image(byte[] bytes, String contentType) { }

    public Image read(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 5_000_000L)
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_NIC_IMAGE", "Choose a JPEG or PNG image under 5 MB.");
        try {
            byte[] input = file.getBytes();
            String format = input.length >= 8 && input[0] == (byte) 0x89 && input[1] == 0x50 && input[2] == 0x4e && input[3] == 0x47 ? "png"
                    : input.length >= 3 && input[0] == (byte) 0xff && input[1] == (byte) 0xd8 && input[2] == (byte) 0xff ? "jpg" : "";
            if (format.isEmpty()) throw invalid();
            BufferedImage decoded;
            try (var source=ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(input))) {
                if (source==null) throw invalid();
                var readers=ImageIO.getImageReaders(source);
                if (!readers.hasNext()) throw invalid();
                var reader=readers.next();
                try {
                    reader.setInput(source);
                    int width=reader.getWidth(0), height=reader.getHeight(0);
                    if (width<300 || height<150 || width>MAX_DIMENSION || height>MAX_DIMENSION
                            || (long)width*height>MAX_PIXELS) throw invalid();
                    decoded=reader.read(0);
                } finally { reader.dispose(); }
            }
            if (decoded==null) throw invalid();
            // Re-encoding removes EXIF and other metadata before OCR or private storage.
            ByteArrayOutputStream clean = new ByteArrayOutputStream();
            BufferedImage rgb = new BufferedImage(decoded.getWidth(), decoded.getHeight(), BufferedImage.TYPE_INT_RGB);
            var graphics = rgb.createGraphics();
            graphics.setColor(java.awt.Color.WHITE); graphics.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
            graphics.drawImage(decoded, 0, 0, null); graphics.dispose();
            if (!ImageIO.write(rgb, "jpg", clean)) throw invalid();
            if (clean.size()>5_000_000) throw invalid();
            return new Image(clean.toByteArray(), "image/jpeg");
        } catch (IOException failure) { throw invalid(); }
    }

    private ApiException invalid() { return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_NIC_IMAGE", "Choose a clear JPEG or PNG image under 5 MB."); }
}
