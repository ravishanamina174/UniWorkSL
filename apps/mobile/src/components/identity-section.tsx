import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { IdentityMatchResult, IdentityVerification } from '@uniwork/api-contracts';
import type { UniWorkApi } from '@/lib/api';
import { useTheme } from '@/theme';
import { AppButton, Card } from './ui';

export function IdentitySection({ api, initialStatus, onMatched }: { api: UniWorkApi; initialStatus: string; onMatched?: () => void }) {
  const theme = useTheme();
  const [state, setState] = useState<IdentityVerification | null>(null);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { let active = true; void api.getIdentity().then((value) => { if (active) setState(value); }).catch(() => { if (active) setMessage('Verification status could not be loaded. Please try again.'); }); return () => { active = false; }; }, [api]);
  const status = state?.status ?? initialStatus;
  async function pick() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1, exif: false });
      if (result.canceled || !result.assets?.length) return;
      const chosen = result.assets[0];
      if (chosen.fileSize && chosen.fileSize > 5_000_000) { setMessage('Choose an image under 5 MB.'); return; }
      if (chosen.mimeType && !['image/jpeg', 'image/png'].includes(chosen.mimeType)) { setMessage('Choose a JPEG or PNG image.'); return; }
      setAsset(chosen); setMessage('');
    } catch { setMessage('The image picker could not be opened. Please try again.'); }
  }
  async function submit(manual: boolean) {
    if (!asset) { setMessage('Choose your NIC image first.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await api.submitIdentity(asset, manual);
      if (manual) { setState(result as IdentityVerification); setMessage('Review Submitted. Your NIC document has been sent to the UniWorkSL safety team. Check its status here.'); }
      else {
        const match = result as IdentityMatchResult; setState(match.verification);
        if (match.outcome === 'MATCHED') onMatched?.();
        setMessage(match.outcome === 'MATCHED' ? 'NIC Matched. You can now apply for tasks.' : match.outcome === 'NOT_MATCHED' ? 'NIC Not Matched. The number differs from your profile. Check your profile NIC or request review when available.' : "We couldn't match your NIC. Please try a clearer image with the number fully visible.");
      }
      setAsset(null);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Verification could not be completed. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Card><View style={{ gap: 12 }}><Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Verify Your NIC</Text><Text style={{ color: theme.muted }}>Upload a clear photo of your NIC to check whether its number matches your profile. This is document matching, not government identity verification. Automatic images are discarded; manual review images are kept privately until a decision or expiry, then deleted.</Text>
    <Text style={{ fontWeight: '700', color: status === 'VERIFIED' ? theme.success : status === 'MANUAL_REVIEW_PENDING' ? theme.warning : theme.accent }}>{status === 'VERIFIED' ? 'NIC Matched' : status === 'MANUAL_REVIEW_PENDING' ? 'NIC Verification Pending' : status === 'REJECTED' ? 'Submission Rejected' : state?.lastReviewStatus === 'EXPIRED' ? 'Review Expired' : 'Verification Required'}</Text>
    {status === 'VERIFIED' ? <Text style={{ color: theme.text }}>Your NIC is locked after matching. Contact support for corrections.</Text> : status === 'MANUAL_REVIEW_PENDING' ? <Text style={{ color: theme.text }}>Your document is awaiting safety team review.</Text> : <>{state?.lastReviewStatus === 'EXPIRED' && status === 'UNVERIFIED' ? <Text style={{ color: theme.warning }}>Your previous review expired and its image was deleted. You can submit a new image.</Text> : null}<AppButton title={asset ? `Selected: ${asset.fileName || 'NIC image'}` : 'Choose NIC image'} variant="secondary" onPress={() => void pick()} />{asset ? <Image source={{ uri: asset.uri }} style={{ width: '100%', height: 180, resizeMode: 'contain' }} accessibilityLabel="Selected NIC image preview" /> : null}<Text style={{ color: theme.muted }}>JPEG or PNG, under 5 MB. Keep the number visible.</Text><AppButton title="Check NIC image" loading={busy} onPress={() => void submit(false)} />{state?.manualReviewAvailable ? <AppButton title="Request Manual Review" variant="secondary" loading={busy} onPress={() => void submit(true)} /> : null}</>}
    {message ? <Text accessibilityRole="alert" style={{ color: theme.accent }}>{message}</Text> : null}</View></Card>;
}
