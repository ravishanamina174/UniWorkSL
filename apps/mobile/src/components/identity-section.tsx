import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { IdentityVerification } from '@uniwork/api-contracts';
import type { UniWorkApi } from '@/lib/api';
import { useTheme } from '@/theme';
import { AppButton, Card } from './ui';

const pendingMessage = 'Our team will review your NIC within 2 days. You can check the status here.';

export function IdentitySection({ api, initialStatus, onReviewed }: { api: UniWorkApi; initialStatus: string; onReviewed?: () => void }) {
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
  async function submit() {
    if (!asset) { setMessage('Choose your NIC image first.'); return; }
    setBusy(true); setMessage('');
    try { setState(await api.submitIdentity(asset)); setAsset(null); setMessage(pendingMessage); onReviewed?.(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Verification could not be submitted. Please try again.'); }
    finally { setBusy(false); }
  }
  const heading = status === 'VERIFIED' ? 'NIC Reviewed' : status === 'MANUAL_REVIEW_PENDING' ? 'Verification Pending' : status === 'REJECTED' ? 'Submission Rejected' : 'Verification Required';
  return <Card><View style={{ gap: 12 }}><Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Verify Your NIC</Text><Text style={{ color: theme.muted }}>Upload a clear photo of your NIC for review by the UniWorkSL safety team. This is a document review, not government identity verification.</Text>
    <Text style={{ fontWeight: '700', color: status === 'VERIFIED' ? theme.success : status === 'MANUAL_REVIEW_PENDING' ? theme.warning : theme.accent }}>{heading}</Text>
    {status === 'VERIFIED' ? <Text style={{ color: theme.text }}>Your NIC was reviewed and approved. It is locked after approval.</Text> : status === 'MANUAL_REVIEW_PENDING' ? <Text style={{ color: theme.text }}>{pendingMessage}</Text> : <>{status === 'REJECTED' && state?.lastReviewReason ? <Text style={{ color: theme.danger }}>Reason: {state.lastReviewReason}</Text> : null}<AppButton title={asset ? `Selected: ${asset.fileName || 'NIC image'}` : 'Choose NIC image'} variant="secondary" onPress={() => void pick()} />{asset ? <Image source={{ uri: asset.uri }} style={{ width: '100%', height: 180, resizeMode: 'contain' }} accessibilityLabel="Selected NIC image preview" /> : null}<Text style={{ color: theme.muted }}>JPEG or PNG, under 5 MB. Keep the number visible.</Text><AppButton title="Submit for Verification" loading={busy} onPress={() => void submit()} /></>}
    {message && message !== pendingMessage ? <Text accessibilityRole="alert" style={{ color: theme.accent }}>{message}</Text> : null}</View></Card>;
}
