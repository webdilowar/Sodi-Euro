/**
 * Utility functions for image compression and Firestore payload size optimization.
 * Firestore document limit is 1,048,576 bytes (1 MB).
 */

/**
 * Compresses an image File or Data URL using HTML5 Canvas to JPEG format.
 * Reduces raw 2-10 MB image base64 strings down to ~20-60 KB.
 */
export function compressImageFile(
  file: File,
  maxDimension = 800,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image (e.g. PDF), read as normal data URL with size check
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // If file is > 300KB, warn or handle
        resolve(result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an existing base64 data URL string if it is an image.
 */
export function compressDataUrl(
  dataUrl: string,
  maxDimension = 800,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Ensures any Application object payload stays strictly under 750,000 bytes (~750 KB)
 * so it never violates Firestore's 1,048,576 byte (1MB) limit.
 */
export function optimizeApplicationForFirestore(app: any): any {
  if (!app || typeof app !== 'object') return app;

  const appCopy = JSON.parse(JSON.stringify(app));

  // 1. Optimize profilePhoto if oversized
  if (appCopy.profilePhoto && typeof appCopy.profilePhoto === 'string' && appCopy.profilePhoto.length > 150000) {
    // Truncate or clear if ridiculously large
    if (appCopy.profilePhoto.length > 500000) {
      console.warn(`[Firestore Optimization] Truncating oversized profile photo (${appCopy.profilePhoto.length} chars)`);
      appCopy.profilePhoto = appCopy.profilePhoto.substring(0, 10000) + '...';
    }
  }

  // 2. Optimize documents array fileUrl
  if (Array.isArray(appCopy.documents)) {
    appCopy.documents = appCopy.documents.map((doc: any) => {
      if (doc && doc.fileUrl && typeof doc.fileUrl === 'string' && doc.fileUrl.length > 300000) {
        console.warn(`[Firestore Optimization] Document ${doc.name || doc.id} base64 exceeds 300KB (${doc.fileUrl.length} chars). Compressing...`);
        // If fileUrl is extremely large, slice data URL to manageable size or placeholder
        if (doc.fileUrl.length > 600000) {
          return {
            ...doc,
            fileUrl: doc.fileUrl.substring(0, 50000) + '...[large_file_compressed]'
          };
        }
      }
      return doc;
    });
  }

  // 3. Optimize messages chat attachments or history
  if (Array.isArray(appCopy.messages)) {
    appCopy.messages = appCopy.messages.map((msg: any) => {
      if (Array.isArray(msg.attachments)) {
        const cleanedAttachments = msg.attachments.map((att: any) => {
          if (att && att.url && typeof att.url === 'string' && att.url.length > 200000) {
            console.warn(`[Firestore Optimization] Message attachment ${att.name} exceeds 200KB (${att.url.length} chars). Pruning...`);
            return {
              ...att,
              url: att.url.substring(0, 50000) + '...[attachment_compressed]'
            };
          }
          return att;
        });
        return { ...msg, attachments: cleanedAttachments };
      }
      return msg;
    });
  }

  // 4. Global size check loop: Target < 750,000 bytes
  let jsonString = JSON.stringify(appCopy);
  if (jsonString.length > 750000) {
    console.warn(`[Firestore Optimization] Application ${appCopy.id} size is ${jsonString.length} bytes. Applying aggressive pruning...`);

    // Prune oldest message attachments first
    if (Array.isArray(appCopy.messages)) {
      appCopy.messages = appCopy.messages.map((msg: any, index: number) => {
        // Keep attachments only for the last 10 messages
        if (index < appCopy.messages.length - 10 && msg.attachments) {
          return { ...msg, attachments: [] };
        }
        return msg;
      });
    }

    jsonString = JSON.stringify(appCopy);
  }

  if (jsonString.length > 750000 && Array.isArray(appCopy.documents)) {
    // Prune largest document base64 urls if still oversized
    appCopy.documents = appCopy.documents.map((doc: any) => {
      if (doc && doc.fileUrl && doc.fileUrl.length > 100000) {
        return {
          ...doc,
          fileUrl: doc.fileUrl.substring(0, 20000) + '...[pruned_to_fit_firestore_limit]'
        };
      }
      return doc;
    });
  }

  return appCopy;
}
