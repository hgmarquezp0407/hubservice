// hooks/useCrud.ts

import { useState, useCallback } from "react"
import { apiFetch, apiFetchRaw, NetworkError } from "@/utils/api"
import Swal from "sweetalert2"
import { toast } from "react-toastify"

interface UseCrudOptions {
    endpoint: string
    urlbase?: string
    itemsPerPage?: number
}

// Helpers
const handleError = (error: any) => {
    if (error instanceof NetworkError) {
        toast.warn("⚠️ " + error.message, {
            autoClose: false,
            toastId:   "network",
        })
    } else {
        toast.error(error.message || "Ocurrió un error inesperado.")
    }
}

const handleErrorSwal = (error: any) => {
    if (error instanceof NetworkError) {
        toast.warn("⚠️ " + error.message, {
            autoClose: false,
            toastId:   "network",
        })
        return
    }

    // El backend puede devolver detail como string o como objeto {title, message, ...}
    const detail = error.detail
    if (detail && typeof detail === "object" && detail.title) {
        Swal.fire(detail.title, detail.message || "Ocurrió un error inesperado.", "error")
    } else {
        Swal.fire("¡Error!", error.message || "Ocurrió un error inesperado.", "error")
    }
}

// Hook 
export function useCrud<T extends { id?: number | null }>({
    endpoint,
    itemsPerPage = 10,
}: UseCrudOptions) {
    const [items, setItems]               = useState<T[]>([])
    const [loading, setLoading]           = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentPage, setCurrentPage]   = useState(1)
    const [total, setTotal]               = useState(0)
    const [totalPages, setTotalPages]     = useState(1)
    const [permissions, setPermissions]   = useState<string[]>([])

    const from = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const to   = Math.min(currentPage * itemsPerPage, total)
    const can  = useCallback((action: string) => permissions.includes(action), [permissions])

    // Fetch listado
    // const fetchItems = useCallback(async (page: number, search = "") => {
    //     setLoading(true)
    //     try {
    //         const data = await apiFetch(
    //             `${endpoint}?search=${search}&page=${page}&size=${itemsPerPage}`
    //         )
    //         setItems(data.items)
    //         setTotalPages(data.pages)
    //         setTotal(data.total)
    //         setPermissions(data.permissions ?? [])
    //     } catch (error: any) {
    //         handleError(error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }, [endpoint, itemsPerPage])

    
    // Fetch listado
    const fetchItems = useCallback(async (page: number, search = "", search_column = "") => {
        setLoading(true)
        try {
            const qs = new URLSearchParams({
                page: String(page),
                size: String(itemsPerPage),
                ...(search        && { search }),
                ...(search_column && search_column !== "all" && { search_column }),
            })
            const data = await apiFetch(`${endpoint}?${qs.toString()}`)
            setItems(data.items)
            setTotalPages(data.pages)
            setTotal(data.total)
            setPermissions(data.permissions ?? [])
        } catch (error: any) {
            handleError(error)
        } finally {
            setLoading(false)
        }
    }, [endpoint, itemsPerPage])

    // Fetch un registro
    const fetchItem = useCallback(async (id: number): Promise<T | null> => {
        try {
            return await apiFetch(`${endpoint}/${id}`)
        } catch (error: any) {
            handleError(error)
            return null
        }
    }, [endpoint])

    // Crear / Editar
    const saveItem = useCallback(async <F = T>(values: F, onSuccess?: () => void): Promise<boolean> => {
        setIsSubmitting(true)
        try {
            const id   = (values as any).id
            const data = await apiFetch(
                id ? `${endpoint}/${id}` : endpoint,
                {
                    method: id ? "PUT" : "POST",
                    body:   JSON.stringify(values),
                }
            )
            await Swal.fire("¡Éxito!", data.message || "Operación realizada correctamente.", "success")
            onSuccess?.()
            return true
        } catch (error: any) {
            handleErrorSwal(error)
            return false
        } finally {
            setIsSubmitting(false)
        }
    }, [endpoint])

    // Eliminar
    const deleteItem = useCallback(async (id: number, onSuccess?: () => void): Promise<void> => {
        const result = await Swal.fire({
            title:              "¿Estás seguro?",
            text:               "No podrás revertir esto.",
            icon:               "warning",
            showCancelButton:   true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor:  "#d33",
            confirmButtonText:  "Sí, eliminar",
            cancelButtonText:   "Cancelar",
        })

        if (!result.isConfirmed) return

        try {
            const data = await apiFetch(`${endpoint}/${id}`, { method: "DELETE" })
            await Swal.fire("¡Eliminado!", data.message || "Eliminado correctamente.", "success")
            onSuccess?.()
        } catch (error: any) {
            handleErrorSwal(error)
        }
    }, [endpoint])

    // Restaurar
    const restoreItem = useCallback(async (id: number, onSuccess?: () => void): Promise<void> => {
        const result = await Swal.fire({
            title:              "¿Restaurar este registro?",
            text:               "El registro volverá a estar activo.",
            icon:               "question",
            showCancelButton:   true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor:  "#d33",
            confirmButtonText:  "Sí, restaurar",
            cancelButtonText:   "Cancelar",
        })

        if (!result.isConfirmed) return

        try {
            const data = await apiFetch(`${endpoint}/${id}/restore`, { method: "PATCH" })
            await Swal.fire("¡Restaurado!", data.message || "Registro restaurado correctamente.", "success")
            onSuccess?.()
        } catch (error: any) {
            handleErrorSwal(error)
        }
    }, [endpoint])

    // Ejecutar acción operativa
    const executeAction = useCallback(async (id: number, action: string, reason?: string, onSuccess?: () => void): Promise<void> => {
        try {
            const data = await apiFetch(`${endpoint}/${id}/actions`, {
                method: "POST",
                body:   JSON.stringify({ action, reason }),
            })
            await Swal.fire("¡Éxito!", data.message || "Acción ejecutada correctamente.", "success")
            onSuccess?.()
        } catch (error: any) {
            handleErrorSwal(error)
        }
    }, [endpoint])

     // Fetch datos relacionados (ej: provincias por departamento)
    const fetchRelated = useCallback(async <R = unknown>(relEndpoint: string, id: number | string): Promise<R[]> => {
        try {
            return await apiFetch(`${relEndpoint}/${id}`)
        } catch (error: any) {
            handleError(error)
            return []
        }
    }, [])

    // Cambiar estado
    const changeState = useCallback(async (id: number, stateId: string, reason?: string, onSuccess?: () => void): Promise<void> => {
        try {
            const data = await apiFetch(`${endpoint}/${id}/state`, {
                method: "PATCH",
                body:   JSON.stringify({ state_id: stateId, reason }),
            })
            await Swal.fire("¡Éxito!", data.message || "Estado actualizado correctamente.", "success")
            onSuccess?.()
        } catch (error: any) {
            handleErrorSwal(error)
        }
    }, [endpoint])

    const exportToExcel = useCallback(async (search: string = "", search_column: string = "") => {
        try {
            const qs = new URLSearchParams({
                ...(search        && { search }),
                ...(search_column && search_column !== "all" && { search_column }),
            })
            const qsStr = qs.toString()
            const response = await apiFetchRaw(`${endpoint}/export${qsStr ? `?${qsStr}` : ""}`, { method: "GET" })

            if (!response.ok) throw new Error("Error al exportar");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            const disposition = response.headers.get("Content-Disposition");
            const filename = disposition
                ? disposition.split("filename=")[1]?.replace(/"/g, "") ?? "export.xlsx"
                : "export.xlsx";

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            toast.error(err.message || "Error al exportar el archivo.");
        }
    }, [endpoint]);


    // Envía un archivo Excel al backend vía multipart/form-data.
    // El backend debe exponer POST /{endpoint}/import
    const importFromExcel = useCallback(async (file: File, onSuccess?: () => void): Promise<void> => {
        const result = await Swal.fire({
            title:             "¿Importar registros?",
            text:              `Se procesará el archivo "${file.name}". Esta acción no se puede deshacer.`,
            icon:              "warning",
            showCancelButton:  true,
            confirmButtonColor:"#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, importar",
            cancelButtonText:  "Cancelar",
        })

        if (!result.isConfirmed) return

        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            // apiFetchRaw para no serializar como JSON
            const response = await apiFetchRaw(`${endpoint}/import`, {
                method: "POST",
                body:   formData,
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err?.detail?.message || err?.detail || "Error al importar.")
            }

            const data = await response.json()
            await Swal.fire("¡Importado!", data.message || "Importación completada correctamente.", "success")
            onSuccess?.()
        } catch (error: any) {
            handleErrorSwal(error)
        } finally {
            setIsSubmitting(false)
        }
    }, [endpoint])


    // Obtiene el historial de auditoría de un registro específico.
    // El backend debe exponer GET /{endpoint}/{id}/audit
    const fetchAudit = useCallback(async <A = unknown>(id: number): Promise<A[]> => {
        try {
            return await apiFetch(`${endpoint}/${id}/audit`)
        } catch (error: any) {
            handleError(error)
            return []
        }
    }, [endpoint])


    // Acción destructiva: purga logs de un rango de fechas o criterio.
    // El backend debe exponer DELETE /{endpoint}/logs con body { filters }
    const purgeLogs = useCallback(async (filters: Record<string, any>, onSuccess?: () => void): Promise<void> => {
        const result = await Swal.fire({
            title:             "¿Purgar logs?",
            text:              "Esta acción es irreversible. Los registros eliminados no se podrán recuperar.",
            icon:              "warning",
            input:             "text",
            inputPlaceholder:  "Motivo de la purga (obligatorio)",
            showCancelButton:  true,
            confirmButtonColor:"#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, purgar",
            cancelButtonText:  "Cancelar",
            preConfirm: (reason) => {
                if (!reason?.trim()) {
                    Swal.showValidationMessage("El motivo es obligatorio.")
                    return false
                }
                return reason.trim()
            },
        })

        if (!result.isConfirmed) return

        try {
            const data = await apiFetch(`${endpoint}/logs`, {
                method: "DELETE",
                body:   JSON.stringify({ filters, reason: result.value }),
            })
            await Swal.fire("¡Purgado!", data.message || "Logs eliminados correctamente.", "success")
            onSuccess?.()
        } catch (error: any) {
            handleErrorSwal(error)
        }
    }, [endpoint])


    // Helper interno
    const getFileNameFromPath = (filePath: string): string =>
        filePath.split("/").pop() ?? "archivo"

    // Dentro del hook, junto a los otros métodos 
    const downloadPrivateFile = useCallback(async (filePath: string | null): Promise<void> => {
        if (!filePath?.trim()) {
            toast.error("Archivo no disponible")
            return
        }

        try {
            const res = await apiFetchRaw(`/private-files/view/${filePath}`, {
                method: "GET",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || data.message || `Error ${res.status}`)
            }

            const blob     = await res.blob()
            const url      = window.URL.createObjectURL(blob)
            const fileName = getFileNameFromPath(filePath)
            const link     = document.createElement("a")

            link.href     = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success("Archivo descargado correctamente")
        } catch (error: any) {
            toast.error(error.message || "Error al descargar el archivo")
        }
    }, [])   // sin dependencias — usa apiFetchRaw que ya maneja baseUrl y cookies

    const openPrivateFile = useCallback(async (filePath: string | null): Promise<void> => {
        if (!filePath?.trim()) {
            toast.error("Archivo no disponible")
            return
        }

        try {
            const res = await apiFetchRaw(`/private-files/view/${filePath}`, {
                method: "GET",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || data.message || `Error ${res.status}`)
            }

            const blob = await res.blob()
            const url  = window.URL.createObjectURL(blob)

            // Abre en nueva pestaña — el navegador decide cómo mostrarlo
            // PDFs se abren en el visor nativo; imágenes se muestran directamente
            window.open(url, "_blank")

            // Liberar memoria después de un tiempo prudencial
            setTimeout(() => window.URL.revokeObjectURL(url), 60_000)

        } catch (error: any) {
            toast.error(error.message || "Error al abrir el archivo")
        }
    }, [])

    return {
        items,
        loading,
        isSubmitting,
        total,
        totalPages,
        currentPage,
        from,
        to,
        permissions,
        can,
        setCurrentPage,
        fetchItems,
        fetchItem,
        saveItem,
        deleteItem,
        restoreItem,
        exportToExcel,
        executeAction,
        fetchRelated,
        changeState,
        importFromExcel,
        fetchAudit,
        purgeLogs,
        downloadPrivateFile,
        openPrivateFile,
    }
}