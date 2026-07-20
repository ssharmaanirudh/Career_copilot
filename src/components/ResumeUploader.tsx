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

function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
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
        className={`group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-all ${
          isDragging
            ? "border-gl-teal bg-gl-teal-bg scale-[1.01]"
            : file
              ? "border-gl-teal/40 bg-gl-teal-bg/50"
              : "border-gl-ink/20 hover:border-gl-teal/60 hover:bg-gl-teal-bg/40"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            file
              ? "bg-gl-teal-bg text-gl-teal"
              : "bg-gl-teal-bg text-gl-teal group-hover:bg-gl-teal-bg/70"
          }`}
        >
          {file ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 8.25 12 3.75m0 0L7.5 8.25M12 3.75v12"
              />
            </svg>
          )}
        </div>
        {file ? (
          <div className="text-sm">
            <p className="font-medium text-gl-ink">{file.name}</p>
            <p className="text-gl-ink-faint">
              {fileSizeLabel(file.size)} &middot; click to replace
            </p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="font-medium text-gl-ink">
              Drop your resume here, or click to browse
            </p>
            <p className="text-gl-ink-faint">PDF, DOCX, or TXT &middot; up to 8 MB</p>
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
