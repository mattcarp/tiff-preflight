import React, { useState } from 'react'
import { extractMetadata } from '../utils/metadataExtractor'
import { File as FileIcon, AlertCircle } from 'lucide-react'

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

  if (!files || files.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Uploaded Files:</h2>
      <ul className="space-y-4">
        {files.map((file, index) => (
          <li key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FileIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="font-medium">{file.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="p-4">
              <button 
                onClick={() => handleExtractMetadata(file)}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                disabled={loading[file.name]}
              >
                {loading[file.name] ? 'Processing...' : 'Extract Metadata'}
              </button>
              {error[file.name] && (
                <div className="mt-2 text-red-500 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{error[file.name]}</span>
                </div>
              )}
              {metadata[file.name] && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Metadata:</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                    {Object.entries(metadata[file.name]).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <span className="font-semibold">{key}: </span>
                        <span>{JSON.stringify(value, null, 2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}