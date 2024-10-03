import * as UTIF from 'utif'
import EXIF from 'exif-js'

const TIFF_TAGS: { [key: number]: string } = {
  254: 'NewSubfileType',
  256: 'ImageWidth',
  257: 'ImageLength',
  258: 'BitsPerSample',
  259: 'Compression',
  262: 'PhotometricInterpretation',
  // ... (include other TIFF tags as needed)
}

const EXIF_TAGS: { [key: number]: string } = {
  36864: 'ExifVersion',
  36867: 'DateTimeOriginal',
  36868: 'DateTimeDigitized',
  // ... (include other EXIF tags as needed)
}

function getTagName(tagNumber: number, isExif: boolean = false): string {
  const tags = isExif ? EXIF_TAGS : TIFF_TAGS;
  return tags[tagNumber] || `Unknown${isExif ? 'Exif' : 'Tiff'}Tag_${tagNumber}`;
}

export async function extractMetadata(file: File): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error('Invalid file object: not an instance of File'));
      return;
    }

    if (!file.type.startsWith('image/tiff')) {
      reject(new Error('Invalid file type: not a TIFF image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
        reject(new Error('Failed to read file: invalid result'));
        return;
      }

      const buffer = e.target.result;
      let metadata: Record<string, any> = {};

      try {
        // Extract TIFF metadata using UTIF
        const ifds = UTIF.decode(buffer);
        if (ifds && ifds.length > 0) {
          metadata.TIFF = {};
          ifds.forEach((ifd: any, index: number) => {
            metadata.TIFF[`IFD${index}`] = {};
            for (const [key, value] of Object.entries(ifd)) {
              const tagName = getTagName(parseInt(key));
              metadata.TIFF[`IFD${index}`][tagName] = value;
            }
          });
        } else {
          throw new Error('No TIFF data found in the file');
        }

        // Extract EXIF metadata
        EXIF.getData(file as any, function(this: any) {
          const exifData = EXIF.getAllTags(this);
          if (exifData && Object.keys(exifData).length > 0) {
            metadata.EXIF = {};
            for (const [key, value] of Object.entries(exifData)) {
              const tagName = getTagName(parseInt(key), true);
              metadata.EXIF[tagName] = value;
            }
          }

          // Add basic file information
          metadata.FileName = file.name;
          metadata.FileSize = file.size;
          metadata.FileType = file.type;
          metadata.LastModified = new Date(file.lastModified).toISOString();

          resolve(metadata);
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unknown error occurred during metadata extraction'));
      }
    };

    reader.onerror = function(e) {
      reject(new Error('Error reading file: ' + (e.target?.error?.message || 'unknown error')));
    };

    reader.readAsArrayBuffer(file);
  });
}