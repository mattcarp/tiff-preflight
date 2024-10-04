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
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-violet-900 text-violet-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-violet-400">TIFF Preflight Checker</h1>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-violet-500 bg-violet-800' : 'border-gray-600 hover:border-violet-500'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-violet-300">Drop the TIFF files here ...</p>
          ) : (
            <p className="text-violet-300">Drag & drop some TIFF files here, or click to select files</p>
          )}
        </div>
        <FileList files={files} />
      </div>
    </main>
  )
}