import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

// We use pdfjs-dist to extract text from PDF files.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const FileUpload = ({ onTextExtracted, isAnalyzing }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // We limit the file size to 5MB to keep things snappy.
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const extractTextFromPdf = async (file) => {
    setIsExtracting(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      if (pdf.numPages === 0) {
        throw new Error("This PDF appears to be empty.");
      }

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        } catch (pageErr) {
          console.warn(`Oops, couldn't read page ${i}:`, pageErr);
        }
      }
      if (!fullText.trim()) {
        throw new Error(
          "We couldn't find any readable text in this PDF. It might be a scanned image.",
        );
      }
      onTextExtracted(fullText);
    } catch (err) {
      console.error("PDF reading error:", err);
      if (err.name === "PasswordException") {
        setError(
          "This PDF is locked with a password. Could you upload an unprotected one?",
        );
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

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(
            "That file is a bit too big for us. Try something under 5MB.",
          );
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("We only support PDF and TXT files for now.");
        } else {
          setError("Something went wrong with the upload. Let's try again.");
        }
        return;
      }

      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE) {
          setError(
            "That file is a bit too big for us. Try something under 5MB.",
          );
          return;
        }

        setFile(selectedFile);
        setError(null);

        if (selectedFile.type === "application/pdf") {
          extractTextFromPdf(selectedFile);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result;
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
    },
    [onTextExtracted],
  );

  const dropzoneOptions = {
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    disabled: isAnalyzing || isExtracting,
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions);

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "organic-card p-10 sm:p-14 text-center border-2 border-dashed transition-all cursor-pointer relative overflow-hidden",
            isDragActive
              ? "border-neon-cyan bg-neon-cyan/10 scale-[1.01] shadow-[0_0_25px_rgba(0,243,255,0.15)]"
              : "border-slate-750 bg-tech-card/60 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 hover:shadow-[0_0_20px_rgba(0,243,255,0.05)]",
            (isAnalyzing || isExtracting) && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />

          {/* Decorative scanner line */}
          {isDragActive && (
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-pulse top-2" />
          )}

          <div className="flex flex-col items-center gap-6">
            <div
              className={cn(
                "p-5 rounded-2xl transition-transform duration-300",
                isDragActive
                  ? "bg-neon-cyan/20 text-neon-cyan scale-110"
                  : "bg-slate-900/80 border border-tech-border text-slate-400 group-hover:text-neon-cyan",
              )}
            >
              <Upload className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(0,243,255,0.3)]" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif font-semibold tracking-tight text-slate-100">
                {isDragActive
                  ? "INCOMING DATA TRANSMISSION"
                  : "CONNECT YOUR RESUME"}
              </p>
              <p className="text-slate-400 mt-2 text-sm font-mono tracking-wide">
                [ PDF OR TXT SPECIFICATIONS ACCEPTED ]
              </p>
            </div>
            <button className="mt-2 px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] text-[#070a13] font-serif font-black rounded-xl transition-all duration-300 active:scale-95">
              BROWSE DISK
            </button>
          </div>
        </div>
      ) : (
        <div className="organic-card p-6 flex items-center justify-between border-tech-border bg-slate-900/90 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl text-neon-cyan relative">
              <FileText className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-emerald rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-emerald rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-100 truncate max-w-[180px] sm:max-w-md text-base font-mono">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
                {(file.size / 1024).toFixed(1)} KB // FILE_APPROVED
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(isAnalyzing || isExtracting) && (
              <div className="flex items-center gap-2 text-neon-cyan font-serif font-bold">
                <Loader2 className="animate-spin" size={16} />
                <span className="hidden sm:inline text-xs tracking-widest font-mono">
                  {isExtracting ? "DECODING_PDF..." : "COMPILING_DATA..."}
                </span>
              </div>
            )}
            {!isAnalyzing && !isExtracting && (
              <button
                onClick={removeFile}
                className="p-2 bg-slate-800/80 hover:bg-neon-pink/20 hover:text-neon-pink text-slate-400 border border-tech-border hover:border-neon-pink/30 rounded-xl transition-all cursor-pointer"
                aria-label="Remove and reset file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-5 bg-neon-pink/10 border border-neon-pink/20 rounded-2xl flex items-start gap-3 text-neon-pink shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-neon-pink/30 flex items-center justify-center text-neon-pink shrink-0 shadow-inner">
            <AlertCircle size={18} />
          </div>
          <div className="flex-grow">
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold mb-1">
              [ SYSTEM_ERROR_ALERT ]
            </h4>
            <p className="text-sm font-medium text-slate-200">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1.5 hover:bg-neon-pink/20 rounded-lg transition-colors text-neon-pink"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
