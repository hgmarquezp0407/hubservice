import { useState, useCallback } from "react"
import { apiFetch, apiFetchRaw, NetworkError } from "@/utils/api"
import Swal from "sweetalert2"
import { toast } from "react-toastify"

interface UseFetchOptions {
    endpoint    : string
    itemsPerPage?: number
}

const handleError = (error: any) => {
    if (error instanceof NetworkError) {
        toast.warn("⚠️ " + error.message, { autoClose: false, toastId: "network" })
    } else {
        toast.error(error.message || "Ocurrió un error inesperado.")
    }
}

const handleErrorSwal = (error: any) => {
    if (error instanceof NetworkError) {
        toast.warn("⚠️ " + error.message, { autoClose: false, toastId: "network" })
        return
    }
    const detail = error.detail
    if (detail && typeof detail === "object" && detail.title) {
        Swal.fire(detail.title, detail.message || "Ocurrió un error inesperado.", "error")
    } else {
        Swal.fire("¡Error!", error.message || "Ocurrió un error inesperado.", "error")
    }
}

export function useFetch<T extends { id?: string | null }>({ endpoint, itemsPerPage = 10 }: UseFetchOptions) {
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

    const fetchItems = useCallback(async (page: number, search = "", extraParams: Record<string, string> = {}) => {
        setLoading(true)
        try {
            const qs = new URLSearchParams({
                page: String(page),
                size: String(itemsPerPage),
                ...(search && { search }),
                ...extraParams,
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

    const fetchItem = useCallback(async (id: string): Promise<T | null> => {
        try {
            return await apiFetch(`${endpoint}/${id}`)
        } catch (error: any) {
            handleError(error)
            return null
        }
    }, [endpoint])

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

    const deleteItem = useCallback(async (id: string, onSuccess?: () => void): Promise<void> => {
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

    const restoreItem = useCallback(async (id: string, onSuccess?: () => void): Promise<void> => {
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

    const executeAction = useCallback(async (id: string, action: string, reason?: string, onSuccess?: () => void): Promise<void> => {
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

    const changeState = useCallback(async (id: string, stateId: string, reason?: string, onSuccess?: () => void): Promise<void> => {
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
        executeAction,
        changeState,
    }
}