import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { cn } from '@/src/lib/utils';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onTextExtracted, isAnalyzing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractTextFromPdf = async (file: File) => {
    setIsExtracting(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      if (!fullText.trim()) {
        throw new Error("No text could be extracted from this PDF.");
      }
      
      onTextExtracted(fullText);
    } catch (err) {
      console.error("PDF extraction error:", err);
      setError("Failed to read PDF. Please ensure it's not password protected or corrupted.");
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type === 'application/pdf') {
        extractTextFromPdf(selectedFile);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          onTextExtracted(text);
        };
        reader.readAsText(selectedFile);
      }
    }
  }, [onTextExtracted]);

  const dropzoneOptions: any = {
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    disabled: isAnalyzing || isExtracting
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
            (isAnalyzing || isExtracting) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-gray-500 mt-1">PDF or TXT files supported</p>
            </div>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Select File
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isAnalyzing || isExtracting) && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Loader2 className="animate-spin" size={20} />
                <span className="hidden sm:inline">
                  {isExtracting ? "Reading..." : "Analyzing..."}
                </span>
              </div>
            )}
            {!isAnalyzing && !isExtracting && (
              <button
                onClick={removeFile}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-4 text-center text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};
