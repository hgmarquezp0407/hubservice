// components/general/TableHeaderActions.tsx

import React from "react"
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button"

interface TableHeaderActionsProps {
    permissions: string[]
    onNew?: () => void
    onExport?: () => void
}

const can = (permissions: string[], action: string) => permissions.includes(action)

export default function TableHeaderActions({
    permissions,
    onNew,
    onExport,
}: TableHeaderActionsProps) {
    return (
        <>
            {can(permissions, "CREATE") && onNew && (
                <SpkButton Buttonvariant="primary" onClickfunc={onNew} Size="sm" Customclass="waves-light">
                    <i className="ri-add-line fw-medium align-middle me-1"></i> Nuevo
                </SpkButton>
            )}

            {can(permissions, "EXPORT") && onExport && (
                <SpkButton Buttonvariant="success-light" Size="sm" Buttontoggle="tooltip" data-bs-placement="top" Title="Exportar a Excel" onClickfunc={onExport}>
                    <i className="ri-file-excel-2-line"></i> Exportar
                </SpkButton>
            )}
        </>
    )
}
