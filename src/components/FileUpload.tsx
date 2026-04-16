import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

// We use pdfjs-dist to extract text from PDF files.
// It's a bit heavy, but it's the most reliable way to do it in the browser.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onTextExtracted, isAnalyzing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // We limit the file size to 5MB to keep things snappy.
  const MAX_FILE_SIZE = 5 * 1024 * 1024; 

  /**
   * Reads a PDF file and extracts its text content.
   * We go page by page to ensure we capture everything.
   */
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
          console.warn(`Oops, couldn't read page ${i}:`, pageErr);
        }
      }
      
      if (!fullText.trim()) {
        throw new Error("We couldn't find any readable text in this PDF. It might be a scanned image.");
      }
      
      onTextExtracted(fullText);
    } catch (err: any) {
      console.error("PDF reading error:", err);
      if (err.name === 'PasswordException') {
        setError("This PDF is locked with a password. Could you upload an unprotected one?");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("We had some trouble reading that PDF. Is the file okay?");
      }
      setFile(null); 
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * Handles the file drop event.
   * We check for file size and type before proceeding.
   */
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError("That file is a bit too big for us. Try something under 5MB.");
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError("We only support PDF and TXT files for now.");
      } else {
        setError("Something went wrong with the upload. Let's try again.");
      }
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("That file is a bit too big for us. Try something under 5MB.");
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
            setError("This text file seems to be empty.");
            setFile(null);
            return;
          }
          onTextExtracted(text);
        };
        reader.onerror = () => {
          setError("We couldn't read that text file.");
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
            "organic-card p-10 sm:p-16 text-center border-2 border-dashed transition-all cursor-pointer",
            isDragActive ? "border-[#d4a373] bg-[#d4a373]/5 scale-[1.02]" : "border-gray-200 hover:border-[#d4a373]/50 hover:bg-gray-50/50",
            (isAnalyzing || isExtracting) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-8">
            <div className="p-6 bg-[#d4a373]/10 rounded-[2rem] text-[#d4a373] shadow-inner">
              <Upload size={40} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
                {isDragActive ? "Drop it right here" : "Share your resume"}
              </p>
              <p className="text-gray-500 mt-3 font-medium italic">PDF or TXT files work best</p>
            </div>
            <button className="mt-4 px-10 py-4 bg-[#d4a373] text-white rounded-[2rem] font-bold hover:bg-[#c39262] transition-all shadow-xl active:scale-95">
              Select a file
            </button>
          </div>
        </div>
      ) : (
        <div className="organic-card p-8 flex items-center justify-between border-[#d4a373]/20 bg-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-[#d4a373]/10 rounded-[2rem] text-[#d4a373]">
              <FileText size={28} />
            </div>
            <div>
              <p className="font-bold text-gray-900 truncate max-w-[180px] sm:max-w-md text-lg tracking-tight">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(isAnalyzing || isExtracting) && (
              <div className="flex items-center gap-2 text-[#d4a373] font-bold">
                <Loader2 className="animate-spin" size={20} />
                <span className="hidden sm:inline text-sm">
                  {isExtracting ? "Reading..." : "Analyzing..."}
                </span>
              </div>
            )}
            {!isAnalyzing && !isExtracting && (
              <button
                onClick={removeFile}
                className="p-2 hover:bg-rose-50 text-gray-300 hover:text-rose-500 rounded-xl transition-colors"
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
          className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-3 text-rose-800 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
            <AlertCircle size={18} />
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-xs uppercase tracking-widest mb-1">Something's not right</h4>
            <p className="text-sm font-medium opacity-80">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="p-1.5 hover:bg-rose-100 rounded-lg transition-colors text-rose-300"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
