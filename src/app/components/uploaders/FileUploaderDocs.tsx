"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export type DocFileData = {
    id?:         number;
    file?:       File;
    name:        string;
    file_path:   string;
    isNew:       boolean;
    size?:       number;
    uploadedAt?: string;
};

type Props = {
    maxFiles?:     number;
    accept?:       string;
    initialFiles?: DocFileData[];
    onNewFiles?:   (files: File[]) => void;       // archivos nuevos listos para subir
    onDeleteFile?: (id: number) => void;           // eliminar archivo guardado
    onViewFile?:   (file_path: string) => void;
};

const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUploaderDocs({
    maxFiles     = 10,
    accept       = ".pdf",
    initialFiles = [],
    onNewFiles,
    onDeleteFile,
    onViewFile,
}: Props) {
    const [savedFiles, setSavedFiles] = useState<DocFileData[]>([]);
    const [newFiles,   setNewFiles]   = useState<DocFileData[]>([]);
    const inputRef                    = useRef<HTMLInputElement>(null);
    const prevInitialKey              = useRef<string>("");

    // Sincroniza archivos guardados solo cuando cambia la lista real de BD
    useEffect(() => {
        const key = initialFiles.filter(f => !f.isNew).map(f => f.file_path).join("|");
        if (key === prevInitialKey.current) return;
        prevInitialKey.current = key;
        setSavedFiles(
            initialFiles
                .filter(f => !f.isNew && f.file_path)
                .map(f => {
                    const name = f.name || f.file_path.split("/").filter(Boolean).pop() || f.file_path;
                    return { ...f, name, isNew: false };
                })
        );
        setNewFiles([]);
    }, [initialFiles]);

    const totalCount = savedFiles.length + newFiles.length;

    const addFiles = (selected: File[]) => {
        const allowed = maxFiles - totalCount;
        if (allowed <= 0) {
            toast.error(`Máximo ${maxFiles} archivo(s) permitido(s).`);
            return;
        }
        const toAdd: DocFileData[] = selected.slice(0, allowed).map(f => ({
            file:      f,
            name:      f.name,
            file_path: "",
            isNew:     true,
            size:      f.size,
        }));
        const updated = [...newFiles, ...toAdd];
        setNewFiles(updated);
        onNewFiles?.(updated.map(f => f.file!));
    };

    const removeSaved = (index: number) => {
        const target = savedFiles[index];
        if (target.id !== undefined && onDeleteFile) onDeleteFile(target.id);
        setSavedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeNew = (index: number) => {
        const updated = newFiles.filter((_, i) => i !== index);
        setNewFiles(updated);
        onNewFiles?.(updated.map(f => f.file!));
    };

    const handleDrop   = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(Array.from(e.target.files ?? []));

    return (
        <div>
            {/* ── Zona de drop ── */}
            <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                    border: "2px dashed #cbd5e1", borderRadius: "10px",
                    padding: "1.25rem 1.5rem", textAlign: "center",
                    cursor: "pointer", background: "#f8fafc",
                    transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#cbd5e1")}
            >
                <i className="ri-upload-cloud-2-line" style={{ fontSize: "2rem", color: "#94a3b8" }}></i>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                    Arrastra archivos aquí o <span style={{ color: "#6366f1", fontWeight: 600 }}>haz clic para seleccionar</span>
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
                    {accept.toUpperCase().replace(/\./g, "")} · Máx. {maxFiles} archivo(s)
                </p>
                <input ref={inputRef} type="file" multiple accept={accept} style={{ display: "none" }} onChange={handleChange} />
            </div>

            {/* ── Lista ── */}
            {(savedFiles.length > 0 || newFiles.length > 0) && (
                <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                    {/* Guardados en BD */}
                    {savedFiles.map((f, idx) => (
                        <div key={`saved-${idx}`} style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.5rem 0.75rem", borderRadius: "8px",
                            border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.82rem",
                        }}>
                            <i className="ri-file-pdf-2-line" style={{ fontSize: "1.4rem", color: "#ef4444", flexShrink: 0 }}></i>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e293b" }}>
                                    {f.name}
                                </div>
                                <div style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "0.1rem" }}>
                                    {f.uploadedAt ? `Subido el ${new Date(f.uploadedAt).toLocaleDateString("es-PE")}` : "Guardado"}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                {onViewFile && f.file_path && (
                                    <button type="button" className="btn btn-sm btn-info-light" onClick={() => onViewFile(f.file_path)} title="Ver archivo">
                                        <i className="ri-eye-line"></i>
                                    </button>
                                )}
                                <button type="button" className="btn btn-sm btn-danger-light" onClick={() => removeSaved(idx)} title="Eliminar">
                                    <i className="ri-delete-bin-line"></i>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Nuevos (pendientes de guardar) */}
                    {newFiles.map((f, idx) => (
                        <div key={`new-${idx}`} style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.5rem 0.75rem", borderRadius: "8px",
                            border: "1px solid #bbf7d0", background: "#f0fdf4", fontSize: "0.82rem",
                        }}>
                            <i className="ri-file-pdf-2-line" style={{ fontSize: "1.4rem", color: "#ef4444", flexShrink: 0 }}></i>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e293b" }}>
                                    {f.name}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.15rem" }}>
                                    <span style={{ color: "#22c55e", fontWeight: 600, fontSize: "0.72rem" }}>
                                        Listo para subir · {formatSize(f.size)}
                                    </span>
                                    <div style={{ flex: 1, height: 4, borderRadius: 4, background: "#dcfce7", overflow: "hidden", maxWidth: 120 }}>
                                        <div style={{ width: "100%", height: "100%", background: "#22c55e", borderRadius: 4 }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, alignItems: "center" }}>
                                <i className="ri-checkbox-circle-fill" style={{ color: "#22c55e", fontSize: "1.1rem" }} title="Listo para guardar"></i>
                                <button type="button" className="btn btn-sm btn-danger-light" onClick={() => removeNew(idx)} title="Quitar">
                                    <i className="ri-delete-bin-line"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}