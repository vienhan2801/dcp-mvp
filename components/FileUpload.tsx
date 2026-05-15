"use client";
import { useState, useRef, useCallback } from "react";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxFiles?: number;
  hint?: string;
  accentColor?: string;
  onFilesChange?: (files: File[]) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  label,
  accept = "image/*,application/pdf",
  maxFiles = 3,
  hint,
  accentColor = "#024430",
  onFilesChange,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const next = [...files];
      for (let i = 0; i < incoming.length; i++) {
        const f = incoming[i];
        if (next.length >= maxFiles) break;
        if (!next.some((existing) => existing.name === f.name && existing.size === f.size)) {
          next.push(f);
        }
      }
      setFiles(next);
      onFilesChange?.(next);
    },
    [files, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      setFiles(next);
      onFilesChange?.(next);
    },
    [files, onFilesChange]
  );

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    // Reset so the same file can be re-selected if removed
    if (inputRef.current) inputRef.current.value = "";
  }

  const dropzoneBorder = isDragOver ? accentColor : "#E4EAE7";
  const dropzoneBg = isDragOver ? `${accentColor}0D` : "#F6F8F7"; // 0D ≈ 5% opacity

  return (
    <div className="flex flex-col gap-2">
      {/* Section label */}
      <label className="text-sm font-semibold text-[#10231C]">{label}</label>

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Tải lên ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ borderColor: dropzoneBorder, backgroundColor: dropzoneBg }}
        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors select-none"
      >
        {/* Upload cloud icon */}
        <svg
          className="w-10 h-10"
          style={{ color: "#6B7A73" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5v-9m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.82 11.095"
          />
        </svg>
        <div className="text-center">
          <p className="text-sm text-[#10231C]">
            Kéo &amp; thả file vào đây, hoặc{" "}
            <span className="font-semibold" style={{ color: accentColor }}>
              Chọn file
            </span>
          </p>
          <p className="text-xs text-[#6B7A73] mt-1">
            PDF, JPG, PNG · Tối đa {maxFiles} file · 10MB mỗi file
          </p>
          {hint && <p className="text-xs text-[#6B7A73] mt-0.5">{hint}</p>}
        </div>
        {files.length >= maxFiles && (
          <p className="text-xs text-amber-600 font-medium">Đã đạt tối đa {maxFiles} file</p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${file.size}-${idx}`}
              className="flex items-center gap-3 bg-white border border-[#E4EAE7] rounded-lg px-3 py-2"
            >
              {/* File icon */}
              <span className="text-lg flex-shrink-0" aria-hidden="true">
                📄
              </span>
              {/* Name + size */}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-[#10231C] truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="block text-xs text-[#6B7A73]">{formatBytes(file.size)}</span>
              </span>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                aria-label={`Xóa ${file.name}`}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#6B7A73] hover:bg-red-50 hover:text-red-600 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
