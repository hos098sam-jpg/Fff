import fs from 'fs';
import path from 'path';
import type { VaultMediaItem, DevicePresence } from '../src/types.ts';

const VAULT_DIR = path.join(process.cwd(), 'public', 'vault_storage');
const METADATA_FILE = path.join(process.cwd(), 'vault-metadata.json');

let vaultItems: VaultMediaItem[] = [];
const connectedDevices = new Map<string, DevicePresence>();

// Ensure vault directory exists
export function initVault() {
  try {
    if (!fs.existsSync(VAULT_DIR)) {
      fs.mkdirSync(VAULT_DIR, { recursive: true });
    }

    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, 'utf8');
      vaultItems = JSON.parse(data);
    } else {
      saveMetadata();
    }
  } catch (err) {
    console.error('Error initializing device vault:', err);
    vaultItems = [];
  }
}

function saveMetadata() {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(vaultItems, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving vault metadata:', err);
  }
}

// Get all vault items
export function getVaultItems(): VaultMediaItem[] {
  return vaultItems;
}

// Save a newly synced file
export function saveVaultFile(
  fileName: string,
  mimeType: string,
  buffer: Buffer,
  deviceName: string = 'Home Phone',
  dimensions?: { width: number; height: number },
  duration?: number
): VaultMediaItem {
  initVault();

  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const cleanExt = path.extname(fileName) || (mimeType.includes('video') ? '.mp4' : mimeType.includes('image') ? '.jpg' : '.bin');
  const storedFileName = `${id}${cleanExt}`;
  const filePath = path.join(VAULT_DIR, storedFileName);

  fs.writeFileSync(filePath, buffer);

  let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document';
  if (mimeType.startsWith('image/')) mediaType = 'image';
  else if (mimeType.startsWith('video/')) mediaType = 'video';
  else if (mimeType.startsWith('audio/')) mediaType = 'audio';

  const publicUrl = `/vault_storage/${storedFileName}`;

  const item: VaultMediaItem = {
    id,
    fileName: fileName || `Media_${new Date().toLocaleDateString('ar-EG')}`,
    fileSize: buffer.length,
    mimeType,
    mediaType,
    url: publicUrl,
    uploadedAt: Date.now(),
    deviceName,
    dimensions,
    duration
  };

  vaultItems.unshift(item);
  saveMetadata();
  return item;
}

// Delete item by ID
export function deleteVaultItem(id: string): boolean {
  const index = vaultItems.findIndex((i) => i.id === id);
  if (index === -1) return false;

  const item = vaultItems[index];
  const storedFileName = path.basename(item.url);
  const filePath = path.join(VAULT_DIR, storedFileName);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error unlinking vault file:', err);
  }

  vaultItems.splice(index, 1);
  saveMetadata();
  return true;
}

// Clear all files
export function clearAllVaultItems(): void {
  try {
    for (const item of vaultItems) {
      const storedFileName = path.basename(item.url);
      const filePath = path.join(VAULT_DIR, storedFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('Error clearing vault items:', err);
  }
  vaultItems = [];
  saveMetadata();
}

export function saveVaultItemFromDownload(
  title: string,
  downloadUrl: string,
  thumbnailUrl: string,
  mediaType: 'image' | 'video' | 'audio' | 'document' = 'video',
  deviceName: string = 'الهاتف (تنزيلات اليوتيوب)'
): VaultMediaItem {
  initVault();

  const id = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: VaultMediaItem = {
    id,
    fileName: title || `تنزيل_${new Date().toLocaleDateString('ar-EG')}`,
    fileSize: 0,
    mimeType: mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
    mediaType,
    url: downloadUrl,
    thumbnailUrl,
    uploadedAt: Date.now(),
    deviceName
  };

  vaultItems.unshift(item);
  saveMetadata();
  return item;
}

// Device Presence / Heartbeat
export function updateDevicePresence(presence: DevicePresence): DevicePresence {
  presence.lastSeen = Date.now();
  connectedDevices.set(presence.id, presence);
  return presence;
}

export function getActiveDevices(): DevicePresence[] {
  const now = Date.now();
  const active: DevicePresence[] = [];

  for (const [id, dev] of connectedDevices.entries()) {
    // Active if pinged in last 45 seconds
    if (now - dev.lastSeen < 45000) {
      active.push(dev);
    } else {
      connectedDevices.delete(id);
    }
  }

  return active;
}
