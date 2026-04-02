// components/general/TableActions.tsx

import React from "react"
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button"

interface ExtraAction {
    label:   string
    icon:    string
    variant?: string
    onClick: () => void
}

interface TableActionsProps {
    id: number
    stateId: string
    permissions: string[]
    protected?: boolean
    extraActions?: ExtraAction[]

    onView?:    (id: number) => void
    onEdit?:    (id: number) => void
    onDelete?:  (id: number) => void
    onRestore?: (id: number) => void
    onExport?:  (id: number) => void

    onApprove?: (id: number) => void
    onReject?:  (id: number) => void
    onSubmit?:  (id: number) => void
    onCancel?:  (id: number) => void

    onAssignIp?:  (id: number) => void
    onReleaseIp?: (id: number) => void
    onReserveIp?: (id: number) => void
    onBlockIp?:   (id: number) => void

    onPowerOn?:      (id: number) => void
    onPowerOff?:     (id: number) => void
    onReboot?:       (id: number) => void
    onDecommission?: (id: number) => void

    onResetPassword?: (id: number) => void
    onBlockUser?:     (id: number) => void
    onUnblockUser?:   (id: number) => void

    onGrantPermission?:  (id: number) => void
    onRevokePermission?: (id: number) => void
    onAssignRole?:       (id: number) => void
    onRemoveRole?:       (id: number) => void

    onInstallCert?: (id: number) => void
    onRenewCert?:   (id: number) => void
    onRevokeCert?:  (id: number) => void

    onGenerateSshCert?: (id: number) => void
    onExecuteRemote?:   (id: number) => void

    onViewAudit?: (id: number) => void
    onPurgeLogs?: (id: number) => void

    onTrack?:          (id: number) => void
    onViewHistory?:    (id: number) => void
    onEvaluate?:       (id: number) => void
    onRenewContract?:  (id: number) => void
    onTerminated?:     (id: number) => void

    onConfigSystem?:    (id: number) => void
    onMaintainCatalog?: (id: number) => void
}

interface ActionBtn {
    permission:     string
    title:          string
    icon:           string
    variant:        string
    handler?:       (id: number) => void
    activeOnly?:    boolean
    inactiveOnly?:  boolean
    skipProtected?: boolean
}

const can = (permissions: string[], action: string) => permissions.includes(action)

export default function TableActions({
    id, stateId, permissions,
    protected: isProtected = false,
    extraActions = [],
    ...handlers
}: TableActionsProps) {
    const isInactive = stateId === "INACTIVE"

    const buttons: ActionBtn[] = [
        { permission: "VIEW",    title: "Ver detalle", icon: "ri-eye-line",          variant: "info-light",      handler: handlers.onView,    activeOnly: true  },
        { permission: "EDIT",    title: "Editar",      icon: "ri-edit-line",         variant: "primary-light",   handler: handlers.onEdit,    activeOnly: true  },
        { permission: "EXPORT",  title: "Exportar",    icon: "ri-download-2-line",   variant: "secondary-light", handler: handlers.onExport,  activeOnly: true  },
        { permission: "DELETE",  title: "Eliminar",    icon: "ri-delete-bin-5-line", variant: "danger-light",    handler: handlers.onDelete,  activeOnly: true, skipProtected: true },
        { permission: "RESTORE", title: "Restaurar",   icon: "ri-refresh-line",      variant: "success-light",   handler: handlers.onRestore, inactiveOnly: true },

        { permission: "APPROVE", title: "Aprobar",  icon: "ri-checkbox-circle-line", variant: "success-light", handler: handlers.onApprove, activeOnly: true },
        { permission: "REJECT",  title: "Rechazar", icon: "ri-close-circle-line",    variant: "danger-light",  handler: handlers.onReject,  activeOnly: true },
        { permission: "SUBMIT",  title: "Enviar",   icon: "ri-send-plane-line",      variant: "primary-light", handler: handlers.onSubmit,  activeOnly: true },
        { permission: "CANCEL",  title: "Cancelar", icon: "ri-forbid-line",          variant: "warning-light", handler: handlers.onCancel,  activeOnly: true },

        { permission: "ASSIGN_IP",  title: "Asignar IP",  icon: "ri-link",              variant: "primary-light", handler: handlers.onAssignIp,  activeOnly: true },
        { permission: "RELEASE_IP", title: "Liberar IP",  icon: "ri-link-unlink",       variant: "warning-light", handler: handlers.onReleaseIp, activeOnly: true },
        { permission: "RESERVE_IP", title: "Reservar IP", icon: "ri-bookmark-line",     variant: "info-light",    handler: handlers.onReserveIp, activeOnly: true },
        { permission: "BLOCK_IP",   title: "Bloquear IP", icon: "ri-shield-cross-line", variant: "danger-light",  handler: handlers.onBlockIp,   activeOnly: true },

        { permission: "POWER_ON",     title: "Encender Servidor",  icon: "ri-power-line",     variant: "success-light", handler: handlers.onPowerOn,      activeOnly: true },
        { permission: "POWER_OFF",    title: "Apagar Servidor",    icon: "ri-shut-down-line", variant: "danger-light",  handler: handlers.onPowerOff,     activeOnly: true },
        { permission: "REBOOT",       title: "Reiniciar Servidor", icon: "ri-restart-line",   variant: "warning-light", handler: handlers.onReboot,       activeOnly: true },
        { permission: "DECOMMISSION", title: "Dar de Baja",        icon: "ri-archive-line",   variant: "danger-light",  handler: handlers.onDecommission, activeOnly: true },

        { permission: "RESET_PASSWORD", title: "Resetear Contraseña", icon: "ri-lock-password-line", variant: "warning-light", handler: handlers.onResetPassword, activeOnly: true },
        { permission: "BLOCK_USER",     title: "Bloquear Usuario",    icon: "ri-user-forbid-line",   variant: "danger-light",  handler: handlers.onBlockUser,     activeOnly: true },
        { permission: "UNBLOCK_USER",   title: "Desbloquear Usuario", icon: "ri-user-follow-line",   variant: "success-light", handler: handlers.onUnblockUser,   activeOnly: true },

        { permission: "GRANT_PERMISSION",  title: "Otorgar Permiso", icon: "ri-shield-check-line",  variant: "success-light", handler: handlers.onGrantPermission,  activeOnly: true },
        { permission: "REVOKE_PERMISSION", title: "Revocar Permiso", icon: "ri-shield-cross-line",  variant: "danger-light",  handler: handlers.onRevokePermission, activeOnly: true },
        { permission: "ASSIGN_ROLE",       title: "Asignar Rol",     icon: "ri-user-settings-line", variant: "primary-light", handler: handlers.onAssignRole,       activeOnly: true },
        { permission: "REMOVE_ROLE",       title: "Remover Rol",     icon: "ri-user-unfollow-line", variant: "warning-light", handler: handlers.onRemoveRole,       activeOnly: true },

        { permission: "INSTALL_CERT", title: "Instalar Certificado", icon: "ri-install-line",      variant: "success-light", handler: handlers.onInstallCert, activeOnly: true },
        { permission: "RENEW_CERT",   title: "Renovar Certificado",  icon: "ri-loop-right-line",   variant: "primary-light", handler: handlers.onRenewCert,   activeOnly: true },
        { permission: "REVOKE_CERT",  title: "Revocar Certificado",  icon: "ri-shield-cross-line", variant: "danger-light",  handler: handlers.onRevokeCert,  activeOnly: true },

        { permission: "GENERATE_SSH_CERT", title: "Generar Certificado SSH", icon: "ri-key-2-line",    variant: "info-light",    handler: handlers.onGenerateSshCert, activeOnly: true },
        { permission: "EXECUTE_REMOTE",    title: "Ejecutar Comando Remoto", icon: "ri-terminal-line", variant: "warning-light", handler: handlers.onExecuteRemote,   activeOnly: true },

        { permission: "VIEW_AUDIT", title: "Ver Auditoría", icon: "ri-file-search-line",   variant: "info-light",   handler: handlers.onViewAudit, activeOnly: true },
        { permission: "PURGE_LOGS", title: "Purgar Logs",   icon: "ri-delete-back-2-line", variant: "danger-light", handler: handlers.onPurgeLogs, activeOnly: true },

        { permission: "TRACK",          title: "Hacer Seguimiento", icon: "ri-map-pin-time-line", variant: "info-light",      handler: handlers.onTrack,         activeOnly: true },
        { permission: "VIEW_HISTORY",   title: "Ver Historial",     icon: "ri-history-line",      variant: "secondary-light", handler: handlers.onViewHistory,   activeOnly: true },
        { permission: "EVALUATE",       title: "Evaluar",           icon: "ri-star-line",         variant: "warning-light",   handler: handlers.onEvaluate,      activeOnly: true },
        { permission: "RENEW_CONTRACT", title: "Renovar Contrato",  icon: "ri-loop-right-line",   variant: "primary-light",   handler: handlers.onRenewContract, activeOnly: true },
        { permission: "TERMINATED",     title: "Terminar Contrato", icon: "ri-close-circle-line", variant: "danger-light",    handler: handlers.onTerminated,    activeOnly: true },

        { permission: "CONFIG_SYSTEM",    title: "Configurar Sistema", icon: "ri-settings-3-line",    variant: "secondary-light", handler: handlers.onConfigSystem,    activeOnly: true },
        { permission: "MAINTAIN_CATALOG", title: "Mantener Catálogo",  icon: "ri-list-settings-line", variant: "secondary-light", handler: handlers.onMaintainCatalog, activeOnly: true },
    ]

    const visible = buttons.filter(b => {
        if (!can(permissions, b.permission)) return false
        if (!b.handler)                      return false
        if (b.activeOnly   && isInactive)    return false
        if (b.inactiveOnly && !isInactive)   return false
        if (b.skipProtected && isProtected)  return false
        return true
    })

    if (visible.length === 0 && extraActions.length === 0) return null

    return (
        <div className="d-flex align-items-center gap-1">
            {visible.map(b => (
                <SpkButton
                    key={b.permission}
                    Buttonvariant={b.variant}
                    Size="sm"
                    Customclass="btn-icon"
                    Buttontoggle="tooltip"
                    data-bs-placement="top"
                    Title={b.title}
                    onClickfunc={() => b.handler!(id)}
                >
                    <i className={b.icon}></i>
                </SpkButton>
            ))}
            {extraActions.map((a, i) => (
                <SpkButton
                    key={`extra-${i}`}
                    Buttonvariant={a.variant ?? "secondary-light"}
                    Size="sm"
                    Customclass="btn-icon"
                    Buttontoggle="tooltip"
                    data-bs-placement="top"
                    Title={a.label}
                    onClickfunc={a.onClick}
                >
                    <i className={a.icon}></i>
                </SpkButton>
            ))}
        </div>
    )
}
































// import React from "react"
// import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button"

// interface TableActionsProps {
//     id: number
//     stateId: string
//     permissions: string[]
//     protected?: boolean

//     // CRUD base
//     onView?:    (id: number) => void
//     onEdit?:    (id: number) => void
//     onDelete?:  (id: number) => void
//     onRestore?: (id: number) => void
//     onExport?:  (id: number) => void
//     // onImport: definido en system_actions pero sin module_actions asignado — reservado para uso futuro

//     // Flujos / aprobaciones
//     onApprove?: (id: number) => void
//     onReject?:  (id: number) => void
//     onSubmit?:  (id: number) => void
//     onCancel?:  (id: number) => void

//     // IPs y Red (MOD_RED_ZONES, MOD_IP_*)
//     onAssignIp?:  (id: number) => void
//     onReleaseIp?: (id: number) => void
//     onReserveIp?: (id: number) => void
//     onBlockIp?:   (id: number) => void

//     // Servidores e Infraestructura (MOD_SRV_SRV)
//     onPowerOn?:      (id: number) => void
//     onPowerOff?:     (id: number) => void
//     onReboot?:       (id: number) => void
//     onDecommission?: (id: number) => void

//     // Seguridad — Usuarios (MOD_SEG_USERS)
//     onResetPassword?: (id: number) => void
//     onBlockUser?:     (id: number) => void
//     onUnblockUser?:   (id: number) => void

//     // Seguridad — Roles (MOD_SEG_ROLES)
//     onGrantPermission?:  (id: number) => void
//     onRevokePermission?: (id: number) => void
//     onAssignRole?:       (id: number) => void
//     onRemoveRole?:       (id: number) => void

//     // Certificados SSL (MOD_CERT)
//     onInstallCert?: (id: number) => void
//     onRenewCert?:   (id: number) => void
//     onRevokeCert?:  (id: number) => void

//     // Vault y SSH (MOD_VAULT_*)
//     onGenerateSshCert?: (id: number) => void
//     onExecuteRemote?:   (id: number) => void

//     // Auditoría — transversal
//     onViewAudit?: (id: number) => void
//     onPurgeLogs?: (id: number) => void  // Solo MOD_VAULT_METRICS

//     // Contratos (MOD_CONT_CONT)
//     onTrack?:          (id: number) => void
//     onViewHistory?:    (id: number) => void
//     onEvaluate?:       (id: number) => void
//     onRenewContract?:  (id: number) => void
//     onTerminated?:     (id: number) => void

//     // Configuración (MOD_CONFIG)
//     onConfigSystem?:    (id: number) => void
//     onMaintainCatalog?: (id: number) => void
// }

// interface ActionBtn {
//     permission: string
//     title: string
//     icon: string
//     variant: string
//     handler?: (id: number) => void
//     activeOnly?:    boolean
//     inactiveOnly?:  boolean
//     skipProtected?: boolean
// }

// const can = (permissions: string[], action: string) => permissions.includes(action)

// export default function TableActions({
//     id, stateId, permissions,
//     protected: isProtected = false,
//     ...handlers
// }: TableActionsProps) {
//     const isInactive = stateId === "INACTIVE"

//     const buttons: ActionBtn[] = [
//         // CRUD base
//         { permission: "VIEW",    title: "Ver detalle", icon: "ri-eye-line",          variant: "info-light",      handler: handlers.onView,    activeOnly: true  },
//         { permission: "EDIT",    title: "Editar",      icon: "ri-edit-line",         variant: "primary-light",   handler: handlers.onEdit,    activeOnly: true  },
//         { permission: "EXPORT",  title: "Exportar",    icon: "ri-download-2-line",   variant: "secondary-light", handler: handlers.onExport,  activeOnly: true  },
//         { permission: "DELETE",  title: "Eliminar",    icon: "ri-delete-bin-5-line", variant: "danger-light",    handler: handlers.onDelete,  activeOnly: true, skipProtected: true },
//         { permission: "RESTORE", title: "Restaurar",   icon: "ri-refresh-line",      variant: "success-light",   handler: handlers.onRestore, inactiveOnly: true },

//         // Flujos / aprobaciones
//         { permission: "APPROVE", title: "Aprobar",  icon: "ri-checkbox-circle-line", variant: "success-light", handler: handlers.onApprove, activeOnly: true },
//         { permission: "REJECT",  title: "Rechazar", icon: "ri-close-circle-line",    variant: "danger-light",  handler: handlers.onReject,  activeOnly: true },
//         { permission: "SUBMIT",  title: "Enviar",   icon: "ri-send-plane-line",      variant: "primary-light", handler: handlers.onSubmit,  activeOnly: true },
//         { permission: "CANCEL",  title: "Cancelar", icon: "ri-forbid-line",          variant: "warning-light", handler: handlers.onCancel,  activeOnly: true },

//         // IPs y Red
//         { permission: "ASSIGN_IP",  title: "Asignar IP",  icon: "ri-link",              variant: "primary-light", handler: handlers.onAssignIp,  activeOnly: true },
//         { permission: "RELEASE_IP", title: "Liberar IP",  icon: "ri-link-unlink",       variant: "warning-light", handler: handlers.onReleaseIp, activeOnly: true },
//         { permission: "RESERVE_IP", title: "Reservar IP", icon: "ri-bookmark-line",     variant: "info-light",    handler: handlers.onReserveIp, activeOnly: true },
//         { permission: "BLOCK_IP",   title: "Bloquear IP", icon: "ri-shield-cross-line", variant: "danger-light",  handler: handlers.onBlockIp,   activeOnly: true },

//         // Servidores e Infraestructura
//         { permission: "POWER_ON",     title: "Encender Servidor",  icon: "ri-power-line",     variant: "success-light", handler: handlers.onPowerOn,      activeOnly: true },
//         { permission: "POWER_OFF",    title: "Apagar Servidor",    icon: "ri-shut-down-line", variant: "danger-light",  handler: handlers.onPowerOff,     activeOnly: true },
//         { permission: "REBOOT",       title: "Reiniciar Servidor", icon: "ri-restart-line",   variant: "warning-light", handler: handlers.onReboot,       activeOnly: true },
//         { permission: "DECOMMISSION", title: "Dar de Baja",        icon: "ri-archive-line",   variant: "danger-light",  handler: handlers.onDecommission, activeOnly: true },

//         // Seguridad — Usuarios
//         { permission: "RESET_PASSWORD", title: "Resetear Contraseña",  icon: "ri-lock-password-line", variant: "warning-light", handler: handlers.onResetPassword, activeOnly: true },
//         { permission: "BLOCK_USER",     title: "Bloquear Usuario",     icon: "ri-user-forbid-line",   variant: "danger-light",  handler: handlers.onBlockUser,     activeOnly: true },
//         { permission: "UNBLOCK_USER",   title: "Desbloquear Usuario",  icon: "ri-user-follow-line",   variant: "success-light", handler: handlers.onUnblockUser,   activeOnly: true },

//         // Seguridad — Roles
//         { permission: "GRANT_PERMISSION",  title: "Otorgar Permiso", icon: "ri-shield-check-line",  variant: "success-light", handler: handlers.onGrantPermission,  activeOnly: true },
//         { permission: "REVOKE_PERMISSION", title: "Revocar Permiso", icon: "ri-shield-cross-line",  variant: "danger-light",  handler: handlers.onRevokePermission, activeOnly: true },
//         { permission: "ASSIGN_ROLE",       title: "Asignar Rol",     icon: "ri-user-settings-line", variant: "primary-light", handler: handlers.onAssignRole,       activeOnly: true },
//         { permission: "REMOVE_ROLE",       title: "Remover Rol",     icon: "ri-user-unfollow-line", variant: "warning-light", handler: handlers.onRemoveRole,       activeOnly: true },

//         // Certificados SSL
//         { permission: "INSTALL_CERT", title: "Instalar Certificado", icon: "ri-install-line",      variant: "success-light", handler: handlers.onInstallCert, activeOnly: true },
//         { permission: "RENEW_CERT",   title: "Renovar Certificado",  icon: "ri-loop-right-line",   variant: "primary-light", handler: handlers.onRenewCert,   activeOnly: true },
//         { permission: "REVOKE_CERT",  title: "Revocar Certificado",  icon: "ri-shield-cross-line", variant: "danger-light",  handler: handlers.onRevokeCert,  activeOnly: true },

//         // Vault y SSH
//         { permission: "GENERATE_SSH_CERT", title: "Generar Certificado SSH", icon: "ri-key-2-line",    variant: "info-light",    handler: handlers.onGenerateSshCert, activeOnly: true },
//         { permission: "EXECUTE_REMOTE",    title: "Ejecutar Comando Remoto", icon: "ri-terminal-line", variant: "warning-light", handler: handlers.onExecuteRemote,   activeOnly: true },

//         // Auditoría
//         { permission: "VIEW_AUDIT", title: "Ver Auditoría", icon: "ri-file-search-line",   variant: "info-light",  handler: handlers.onViewAudit, activeOnly: true },
//         { permission: "PURGE_LOGS", title: "Purgar Logs",   icon: "ri-delete-back-2-line", variant: "danger-light",handler: handlers.onPurgeLogs, activeOnly: true },

//         // Contratos
//         { permission: "TRACK",          title: "Hacer Seguimiento", icon: "ri-map-pin-time-line", variant: "info-light",      handler: handlers.onTrack,         activeOnly: true },
//         { permission: "VIEW_HISTORY",   title: "Ver Historial",     icon: "ri-history-line",      variant: "secondary-light", handler: handlers.onViewHistory,   activeOnly: true },
//         { permission: "EVALUATE",       title: "Evaluar",           icon: "ri-star-line",         variant: "warning-light",   handler: handlers.onEvaluate,      activeOnly: true },
//         { permission: "RENEW_CONTRACT", title: "Renovar Contrato",  icon: "ri-loop-right-line",   variant: "primary-light",   handler: handlers.onRenewContract, activeOnly: true },
//         { permission: "TERMINATED",     title: "Terminar Contrato", icon: "ri-close-circle-line", variant: "danger-light",    handler: handlers.onTerminated,    activeOnly: true },

//         // Configuración
//         { permission: "CONFIG_SYSTEM",    title: "Configurar Sistema", icon: "ri-settings-3-line",    variant: "secondary-light", handler: handlers.onConfigSystem,    activeOnly: true },
//         { permission: "MAINTAIN_CATALOG", title: "Mantener Catálogo",  icon: "ri-list-settings-line", variant: "secondary-light", handler: handlers.onMaintainCatalog, activeOnly: true },
//     ]

//     const visible = buttons.filter(b => {
//         if (!can(permissions, b.permission)) return false
//         if (!b.handler)                      return false
//         if (b.activeOnly   && isInactive)    return false
//         if (b.inactiveOnly && !isInactive)   return false
//         if (b.skipProtected && isProtected)  return false
//         return true
//     })

//     if (visible.length === 0) return null

//     return (
//         <div className="d-flex align-items-center gap-1">
//             {visible.map(b => (
//                 <SpkButton
//                     key={b.permission}
//                     Buttonvariant={b.variant}
//                     Size="sm"
//                     Customclass="btn-icon"
//                     Buttontoggle="tooltip"
//                     data-bs-placement="top"
//                     Title={b.title}
//                     onClickfunc={() => b.handler!(id)}
//                 >
//                     <i className={b.icon}></i>
//                 </SpkButton>
//             ))}
//         </div>
//     )
// }