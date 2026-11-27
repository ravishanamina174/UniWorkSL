package lk.uniwork.identity;

import lk.uniwork.common.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import static org.junit.jupiter.api.Assertions.*;

class IdentityDocumentTest {
    @Test void acceptsRealImageAndReencodesIt() throws Exception {
        var bytes=new ByteArrayOutputStream(); ImageIO.write(new BufferedImage(400,200,BufferedImage.TYPE_INT_RGB),"png",bytes);
        var clean=new IdentityDocument().read(new MockMultipartFile("image","nic.png","image/png",bytes.toByteArray()));
        assertEquals("image/jpeg",clean.contentType()); assertEquals((byte)0xff,clean.bytes()[0]);
    }
    @Test void rejectsContentThatOnlyClaimsToBeAnImage() {
        assertThrows(ApiException.class,()->new IdentityDocument().read(new MockMultipartFile("image","nic.png","image/png","not an image".getBytes())));
    }
}
