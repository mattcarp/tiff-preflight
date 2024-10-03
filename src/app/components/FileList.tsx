import React, { useState } from 'react'
import { extractMetadata } from '../utils/metadataExtractor'

interface FileListProps {
  files: File[]
}

export default function FileList({ files }: FileListProps) {
  const [metadata, setMetadata] = useState<Record<string, Record<string, any>>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<Record<string, string>>({})

  const handleExtractMetadata = async (file: File) => {
    setLoading(prev => ({ ...prev, [file.name]: true }))
    setError(prev => ({ ...prev, [file.name]: '' }))
    try {
      const extractedMetadata = await extractMetadata(file)
      setMetadata(prev => ({ ...prev, [file.name]: extractedMetadata }))
    } catch (error) {
      console.error('Failed to extract metadata:', error)
      setError(prev => ({ ...prev, [file.name]: error instanceof Error ? error.message : 'Failed to extract metadata' }))
    } finally {
      setLoading(prev => ({ ...prev, [file.name]: false }))
    }
  }

  if (files.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Uploaded Files:</h2>
      <ul className="space-y-4">
        {files.map((file, index) => (
          <li key={index} className="bg-gray-800 p-4 rounded text-gray-300">
            <div className="flex justify-between items-center">
              <span>{file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <button 
                onClick={() => handleExtractMetadata(file)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                disabled={loading[file.name]}
              >
                {loading[file.name] ? 'Processing...' : 'Extract Metadata'}
              </button>
            </div>
            {error[file.name] && (
              <div className="mt-2 text-red-500">{error[file.name]}</div>
            )}
            {metadata[file.name] && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Metadata:</h3>
                <pre className="bg-gray-700 p-2 rounded overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(metadata[file.name], null, 2)}
                </pre>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}