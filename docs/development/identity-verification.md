# Identity verification

Identity verification is a manual document review workflow. `VERIFIED` means an authorised UniWorkSL Admin reviewed the submitted NIC image; it is not a government record lookup, proof of card authenticity, or face match.

Students and Task Posters must have a complete profile and a valid NIC number before submitting a clear JPG or PNG (maximum 5 MB). The backend validates the image, strips metadata while re-encoding it, stores it temporarily in the private Cloudflare R2 `uniwork-identity` bucket, and creates a pending PostgreSQL review. The user sees: “Our team will review your NIC within 2 days. You can check the status here.” This is a target, not a guaranteed deadline.

Admins review the private image alongside profile details. Approval sets `VERIFIED` and locks the NIC field. Rejection records the reason and permits resubmission. The stored object is deleted after either decision; rollback and the cleanup sweep retry failed deletions. Keep the bucket private and grant the backend only the required object read/write/delete permissions.

Build/deployment order: apply Flyway V14 by deploying the backend first, with stable PII key, Clerk config, and private R2 credentials. Confirm backend health and migration status. Deploy web next. Rebuild and distribute the Android app because it uses the native image picker; an OTA JavaScript update alone does not add the native module to an older APK. Use synthetic NIC images and test Clerk accounts for review tests. Do not upload real personal documents during automated tests.

Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME=uniwork-identity`, and optionally `R2_ENDPOINT` only on the backend. Never place credentials in `NEXT_PUBLIC_` or `EXPO_PUBLIC_` variables.
