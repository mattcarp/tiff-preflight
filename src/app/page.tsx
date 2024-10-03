'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import FileList from './components/FileList'

export default function Home() {
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
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">TIFF Preflight Checker</h1>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500 text-lg">Drop the TIFF file here ...</p>
          ) : (
            <p className="text-gray-500 text-lg">Drag and drop a TIFF file here, or click to select a file</p>
          )}
        </div>
        <FileList files={files} />
      </div>
    </main>
  )
}