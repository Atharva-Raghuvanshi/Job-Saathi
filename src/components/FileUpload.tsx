import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const extractTextFromPdf = async (file: File) => {
    setIsExtracting(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      if (pdf.numPages === 0) {
        throw new Error("This PDF appears to be empty.");
      }

      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        } catch (pageErr) {
          console.warn(`Failed to extract text from page ${i}:`, pageErr);
          // Continue with other pages if one fails
        }
      }
      
      if (!fullText.trim()) {
        throw new Error("No readable text could be extracted from this PDF. It might be an image-based PDF or scanned document without OCR.");
      }
      
      onTextExtracted(fullText);
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      if (err.name === 'PasswordException') {
        setError("This PDF is password protected. Please upload an unprotected version.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to read PDF. The file might be corrupted or in an unsupported format.");
      }
      setFile(null); // Reset file on error
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError("File is too large. Maximum size allowed is 5MB.");
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError("Invalid file type. Please upload a PDF or TXT file.");
      } else {
        setError("Failed to upload file. Please try again.");
      }
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File is too large. Maximum size allowed is 5MB.");
        return;
      }

      setFile(selectedFile);
      setError(null);

      if (selectedFile.type === 'application/pdf') {
        extractTextFromPdf(selectedFile);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text.trim()) {
            setError("The uploaded text file is empty.");
            setFile(null);
            return;
          }
          onTextExtracted(text);
        };
        reader.onerror = () => {
          setError("Failed to read the text file.");
          setFile(null);
        };
        reader.readAsText(selectedFile);
      }
    }
  }, [onTextExtracted]);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
            <AlertCircle size={16} />
          </div>
          <div className="flex-grow">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-0.5">Upload Error</h4>
            <p className="text-xs font-medium opacity-80">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-100 rounded-md transition-colors text-rose-400"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
