/**
 * Universal cross-platform camera utility supporting:
 * - Laptops (integrated webcams, MacBook FaceTime HD, USB webcams)
 * - Desktop PCs (external USB cameras, capture devices)
 * - Mobile Phones & Tablets (front selfie camera & rear multi-lens cameras)
 */

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export async function getAvailableVideoDevices(): Promise<CameraDeviceInfo[]> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(d => d.kind === 'videoinput')
      .map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${d.deviceId.slice(0, 5)}`,
        kind: d.kind,
      }));
  } catch {
    return [];
  }
}

export async function requestUniversalCameraStream(options?: {
  facingMode?: 'user' | 'environment';
  deviceId?: string;
  idealWidth?: number;
  idealHeight?: number;
}): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Camera API (navigator.mediaDevices.getUserMedia) is not supported in this browser environment.'
    );
  }

  const idealWidth = options?.idealWidth || 1280;
  const idealHeight = options?.idealHeight || 720;

  // 1. If explicit deviceId provided
  if (options?.deviceId) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: options.deviceId },
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
        },
        audio: false,
      });
    } catch (err) {
      console.warn(`[CameraUtil] deviceId: ${options.deviceId} failed, trying fallback:`, err);
    }
  }

  // 2. Try with requested facingMode (ideal for mobile or laptop)
  const facingMode = options?.facingMode || 'user';

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: idealWidth },
        height: { ideal: idealHeight },
      },
      audio: false,
    });
  } catch (err) {
    console.warn(`[CameraUtil] ideal facingMode: ${facingMode} failed, trying generic video constraints:`, err);
  }

  // 3. Fallback: Generic video request for desktops / external USB cameras with no facingMode
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  } catch (err: any) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error('Camera access permission was denied. Please allow camera permissions in your browser bar.');
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      throw new Error('No camera hardware found on this system. Please connect a webcam.');
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      throw new Error('Camera is already in use by another application. Please close other camera tabs.');
    }
    throw err;
  }
}
