"use client";

import React, { useEffect, useRef, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { apiFetch } from "@/utils/api";

interface ActionInfo {
    id:     number;
    code:   string;
    name:   string;
}

interface ModuleRow {
    module_id:      number;
    module_code:    string;
    module_name:    string;
    parent_id:      number | null;
    parent_name:    string | null;
    actions:        ActionInfo[];
    permissions:    Record<string, boolean>;
}

interface PermissionMatrix {
    role_id:    number;
    role_name:  string;
    modules:    ModuleRow[];
}

interface AssignPermissionsModalProps {
    show:       boolean;
    onHide:     () => void;
    roleId:     number | null;
    roleName:   string;
    urlbase:    string;
}

export default function AssignPermissionsModal({
    show, onHide, roleId, roleName, urlbase,
}: AssignPermissionsModalProps) {
    const [matrix, setMatrix]           = useState<PermissionMatrix | null>(null);
    const [loading, setLoading]         = useState(false);
    const [saving, setSaving]           = useState(false);
    // Cambios pendientes: clave "moduleId-actionId" → { module_id, action_id, allows }
    const changes = useRef<Map<string, { module_id: number; action_id: number; allows: boolean }>>(new Map());

    useEffect(() => {
        if (!show || !roleId) return;
        const ctrl = new AbortController();
        changes.current.clear();

        const load = async () => {
            setLoading(true);
            try {
                const data = await apiFetch(`${urlbase}/admin/permissions/${roleId}`, {
                    signal: ctrl.signal,
                });
                setMatrix(data);
            } catch (err: any) {
                if (err.name !== "AbortError")
                    toast.error(`Error cargando permisos: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => ctrl.abort();
    }, [show, roleId]);

    const handleClose = () => {
        setMatrix(null);
        changes.current.clear();
        onHide();
    };

    const handleToggle = (mod: ModuleRow, action: ActionInfo) => {
        if (!matrix) return;
        const key = `${mod.module_id}-${action.id}`;
        const current = mod.permissions[action.code] ?? false;
        const newVal  = !current;

        // Registrar cambio
        changes.current.set(key, {
            module_id: mod.module_id,
            action_id: action.id,
            allows:    newVal,
        });

        // Actualizar estado local
        setMatrix(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                modules: prev.modules.map(m =>
                    m.module_id === mod.module_id
                        ? { ...m, permissions: { ...m.permissions, [action.code]: newVal } }
                        : m
                ),
            };
        });
    };

    const handleSave = async () => {
        if (!roleId || changes.current.size === 0) {
            toast.info("No hay cambios para guardar.");
            return;
        }
        setSaving(true);
        try {
            await apiFetch(`${urlbase}/admin/permissions/${roleId}`, {
                method: "POST",
                body: JSON.stringify({ changes: Array.from(changes.current.values()) }),
            });
            toast.success("Permisos actualizados correctamente.");
            changes.current.clear();
            onHide();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar permisos.");
        } finally {
            setSaving(false);
        }
    };

    // Agrupar módulos por parent
    const grouped = matrix
        ? matrix.modules.reduce<Record<string, { parentName: string; rows: ModuleRow[] }>>(
            (acc, mod) => {
                const key = String(mod.parent_id ?? 0);
                if (!acc[key]) acc[key] = { parentName: mod.parent_name ?? "General", rows: [] };
                acc[key].rows.push(mod);
                return acc;
            }, {}
          )
        : {};

    // Todas las acciones únicas presentes en la matriz (para cabecera global)
    const allActions: ActionInfo[] = matrix
        ? Array.from(
            new Map(
                matrix.modules.flatMap(m => m.actions).map(a => [a.code, a])
            ).values()
          )
        : [];

    return (
        <Modal size="xl" show={show} onHide={handleClose} centered className="fade" dialogClassName="modal-xxl" tabIndex={-1}>
            <Modal.Header className="py-2 px-3">
                <div className="d-flex align-items-center gap-2">
                    <i className="ri-shield-keyhole-line fs-18 text-primary"></i>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        Asignar Permisos —
                        <span className="text-primary ms-1">{roleName}</span>
                    </span>
                </div>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body className="px-3 py-2">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <span style={{ fontSize: "0.85rem" }}>Cargando permisos...</span>
                    </div>
                ) : !matrix ? null : (
                    <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
                        <table style={{ fontSize: "0.8rem", borderCollapse: "collapse", width: "100%", overflowX: "auto", maxHeight: "600px", display: "block" }}>
                            <thead className="table-light" style={{ position: "sticky", top: 0, left: 0, background: "var(--default-background)", color: "var(--text-muted)", zIndex: 3, whiteSpace: "nowrap" }}>
                                <tr>
                                    <th style={{ minWidth: 180, position: "sticky", left: 0, zIndex: 5, whiteSpace: "nowrap" }}>Módulo</th>
                                    {allActions.map(a => (
                                        <th key={a.code} className="text-center" style={{ minWidth: 90, textAlign: "center", whiteSpace: "normal", color: "var(--text-muted)", wordBreak: "break-word" }}>
                                            {a.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(grouped).map(([parentKey, group]) => (
                                    <React.Fragment key={parentKey}>
                                        {/* Fila separadora de grupo */}
                                        <tr>
                                            <td
                                                colSpan={allActions.length + 1}
                                                className="fw-semibold py-1 px-2"
                                                style={{
                                                    fontSize: "0.75rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                    background: "var(--default-background)",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                <i className="ri-folder-line me-1"></i>
                                                { group.parentName }
                                            </td>
                                        </tr>

                                        {/* Filas de módulos hijos */}
                                        {group.rows.map(mod => (
                                            <tr key={mod.module_id}>
                                                <td className="ps-3 align-middle" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--default-background)", color: "var(--text-muted)", position: "sticky", left: 0, zIndex: 1, }} > { mod.module_name } </td>
                                                {allActions.map(action => {
                                                    const applies = mod.actions.some(a => a.code === action.code);
                                                    const active  = mod.permissions[action.code] ?? false;
                                                    return (
                                                        <td key={action.code} className="text-center align-middle" style={{ whiteSpace: "nowrap" }}>
                                                            {applies ? (
                                                                <div
                                                                    className={`toggle toggle-info ${active ? "on" : "off"}`}
                                                                    style={{ margin: "0 auto" }}
                                                                    onClick={() => handleToggle(mod, action)}
                                                                >
                                                                    <span></span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="py-2 px-3 d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                    {changes.current.size > 0
                        ? <><i className="ri-error-warning-line me-1 text-warning"></i>{changes.current.size} cambio(s) sin guardar</>
                        : <><i className="ri-check-line me-1 text-success"></i>Sin cambios pendientes</>
                    }
                </span>
                <div className="d-flex gap-2">
                    <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={handleClose}>
                        <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                    </SpkButton>
                    <SpkButton
                        Buttonvariant="primary"
                        Buttontype="button"
                        Disabled={saving}
                        Customclass={saving ? "btn-loader" : "waves-light"}
                        onClickfunc={handleSave}
                    >
                        {saving
                            ? <><span className="loading"><i className="ri-loader-2-fill fs-16"></i></span><span className="me-1">Guardando...</span></>
                            : <><i className="ri-save-3-line align-middle me-1"></i><span className="me-1">Guardar</span></>
                        }
                    </SpkButton>
                </div>
            </Modal.Footer>
        </Modal>
    );
}