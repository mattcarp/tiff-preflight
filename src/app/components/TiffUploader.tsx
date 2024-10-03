"use client";

import React, { useState } from 'react';
import * as UTIF from 'utif';
import EXIF from 'exif-js';

// Define types for our metadata
interface TiffMetadata {
  [key: string]: any;
}

interface ExifMetadata {
  [key: string]: any;
}

interface Metadata {
  tiff: TiffMetadata;
  exif: ExifMetadata;
}

function TiffUploader() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    try {
      setError(null);
      let file: File | undefined;
      
      if ('dataTransfer' in event) {
        file = event.dataTransfer.files[0];
      } else {
        file = event.target.files?.[0];
      }

      if (!file) {
        setError("No file selected");
        return;
      }

      // Read TIFF metadata
      const arrayBuffer = await file.arrayBuffer();
      const ifds = UTIF.decode(arrayBuffer);
      const tiffMetadata: TiffMetadata = {};

      // Extract metadata from the first IFD
      if (ifds.length > 0) {
        for (const [key, value] of Object.entries(ifds[0])) {
          if (typeof value !== 'function') {
            tiffMetadata[key] = value;
          }
        }
      }

      // Read EXIF metadata
      const exifData = await new Promise<ExifMetadata>((resolve) => {
        EXIF.getData(file, function(this: any) {
          resolve(EXIF.getAllTags(this));
        });
      });

      setMetadata({ tiff: tiffMetadata, exif: exifData });
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const autocorrectMetadata = () => {
    if (!metadata) return;

    const correctedMetadata = {
      ...metadata,
      tiff: {
        ...metadata.tiff,
        // Add default values or corrections here
        ImageDescription: metadata.tiff.ImageDescription || 'No description',
        // Add more fields as needed
      },
      exif: {
        ...metadata.exif,
        // Add default values or corrections here
        DateTimeOriginal: metadata.exif.DateTimeOriginal || new Date().toISOString(),
        // Add more fields as needed
      }
    };

    setMetadata(correctedMetadata);
  };

  return (
    <div>
      <div 
        style={{ 
          border: '2px dashed #ccc', 
          padding: '20px', 
          textAlign: 'center' 
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input type="file" onChange={handleFileUpload} accept=".tiff,.tif" />
        <p>Drag and drop a TIFF file here, or click to select a file</p>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {metadata && (
        <div>
          <h2>Metadata</h2>
          <h3>TIFF Metadata</h3>
          <pre>{JSON.stringify(metadata.tiff, null, 2)}</pre>
          <h3>EXIF Metadata</h3>
          <pre>{JSON.stringify(metadata.exif, null, 2)}</pre>
          <button onClick={autocorrectMetadata}>Autocorrect Metadata</button>
        </div>
      )}
    </div>
  );
}

export default TiffUploader;