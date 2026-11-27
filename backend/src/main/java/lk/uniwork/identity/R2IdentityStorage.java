package lk.uniwork.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class R2IdentityStorage {
    private final String accountId, accessKey, secret, bucket, endpoint;
    public R2IdentityStorage(@Value("${uniwork.identity.r2-account-id:}") String accountId,
            @Value("${uniwork.identity.r2-access-key-id:}") String accessKey,
            @Value("${uniwork.identity.r2-secret-access-key:}") String secret,
            @Value("${uniwork.identity.r2-bucket-name:uniwork-identity}") String bucket,
            @Value("${uniwork.identity.r2-endpoint:}") String endpoint) {
        this.accountId=accountId; this.accessKey=accessKey; this.secret=secret; this.bucket=bucket; this.endpoint=endpoint;
    }
    private S3Client client() {
        if (accountId.isBlank() || accessKey.isBlank() || secret.isBlank()) throw new IllegalStateException("Private identity storage is not configured.");
        String url = endpoint.isBlank() ? "https://" + accountId + ".r2.cloudflarestorage.com" : endpoint;
        return S3Client.builder().endpointOverride(URI.create(url)).region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secret)))
                .forcePathStyle(true).build();
    }
    public void put(String key, byte[] bytes) {
        try (S3Client s3=client()) { s3.putObject(PutObjectRequest.builder().bucket(bucket).key(key).contentType("image/jpeg").build(), RequestBody.fromBytes(bytes)); }
    }
    public byte[] get(String key) {
        try (S3Client s3=client()) { return s3.getObjectAsBytes(GetObjectRequest.builder().bucket(bucket).key(key).build()).asByteArray(); }
    }
    public void delete(String key) {
        try (S3Client s3=client()) { s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build()); }
    }
    public List<String> orphanCandidates(Instant olderThan) {
        try (S3Client s3=client()) {
            var keys=new ArrayList<String>();
            for (var page:s3.listObjectsV2Paginator(ListObjectsV2Request.builder().bucket(bucket).prefix("nic-reviews/").build()))
                for (var object:page.contents()) if (object.lastModified().isBefore(olderThan)) keys.add(object.key());
            return keys;
        }
    }
}
