"use client";

import { useCallback, useRef, useState } from "react";

interface ResumeUploaderProps {
  file: File | null;
  onFileSelected: (file: File | null) => void;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function ResumeUploader({ file, onFileSelected }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      const picked = fileList?.[0];
      if (!picked) return;
      if (!isAcceptedFile(picked)) {
        onFileSelected(null);
        return;
      }
      onFileSelected(picked);
    },
    [onFileSelected],
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-zinc-300 hover:border-indigo-400 dark:border-zinc-700"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-8 w-8 text-zinc-400"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 8.25 12 3.75m0 0L7.5 8.25M12 3.75v12"
          />
        </svg>
        {file ? (
          <div className="text-sm">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
            <p className="text-zinc-500">{(file.size / 1024).toFixed(0)} KB &middot; click to replace</p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Drop your resume here, or click to browse
            </p>
            <p className="text-zinc-500">PDF, DOCX, or TXT &middot; up to 8 MB</p>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
