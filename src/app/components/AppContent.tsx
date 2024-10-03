'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import FileList from './components/FileList'

export function Page() {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/tiff': ['.tif', '.tiff']
    }
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Tiff Fixer</h1>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-900' : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-300">Drop the TIFF files here ...</p>
          ) : (
            <p className="text-gray-300">Drag 'n' drop some TIFF files here, or click to select files</p>
          )}
        </div>
        <FileList files={files} />
      </div>
    </main>
  )
}