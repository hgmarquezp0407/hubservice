// components/general/TableActionsDropdown.tsx

import React from "react"
import { Dropdown } from "react-bootstrap"

interface TableActionsDropdownProps {
    id: number
    stateId: string
    permissions: string[]
    protected?: boolean

    // CRUD base
    onView?:    (id: number) => void
    onEdit?:    (id: number) => void
    onDelete?:  (id: number) => void
    onRestore?: (id: number) => void
    onExport?:  (id: number) => void
    // onImport: definido en system_actions pero sin module_actions asignado — reservado para uso futuro

    // Flujos / aprobaciones
    onApprove?: (id: number) => void
    onReject?:  (id: number) => void
    onSubmit?:  (id: number) => void
    onCancel?:  (id: number) => void

    // IPs y Red (MOD_RED_ZONES, MOD_IP_*)
    onAssignIp?:  (id: number) => void
    onReleaseIp?: (id: number) => void
    onReserveIp?: (id: number) => void
    onBlockIp?:   (id: number) => void

    // Servidores e Infraestructura (MOD_SRV_SRV)
    onPowerOn?:      (id: number) => void
    onPowerOff?:     (id: number) => void
    onReboot?:       (id: number) => void
    onDecommission?: (id: number) => void

    // Seguridad — Usuarios (MOD_SEG_USERS)
    onResetPassword?: (id: number) => void
    onBlockUser?:     (id: number) => void
    onUnblockUser?:   (id: number) => void

    // Seguridad — Roles (MOD_SEG_ROLES)
    onGrantPermission?:  (id: number) => void
    onRevokePermission?: (id: number) => void
    onAssignRole?:       (id: number) => void
    onRemoveRole?:       (id: number) => void

    // Certificados SSL (MOD_CERT)
    onInstallCert?: (id: number) => void
    onRenewCert?:   (id: number) => void
    onRevokeCert?:  (id: number) => void

    // Vault y SSH (MOD_VAULT_*)
    onGenerateSshCert?: (id: number) => void
    onExecuteRemote?:   (id: number) => void

    // Auditoría — transversal
    onViewAudit?: (id: number) => void
    onPurgeLogs?: (id: number) => void  // Solo MOD_VAULT_METRICS

    // Contratos (MOD_CONT_CONT)
    onTrack?:          (id: number) => void
    onViewHistory?:    (id: number) => void
    onEvaluate?:       (id: number) => void
    onRenewContract?:  (id: number) => void
    onTerminated?:     (id: number) => void

    // Configuración (MOD_CONFIG)
    onConfigSystem?:    (id: number) => void
    onMaintainCatalog?: (id: number) => void
}

interface ActionItem {
    permission: string
    label: string
    icon: string
    color: string
    handler?: (id: number) => void
    activeOnly?:    boolean
    inactiveOnly?:  boolean
    skipProtected?: boolean
}

const can = (permissions: string[], action: string) => permissions.includes(action)

export default function TableActionsDropdown({
    id, stateId, permissions,
    protected: isProtected = false,
    ...handlers
}: TableActionsDropdownProps) {
    const isInactive = stateId === "INACTIVE"

    const actions: ActionItem[] = [
        // CRUD base
        { permission: "VIEW",    label: "Ver",       icon: "ri-eye-line",          color: "text-info",      handler: handlers.onView,    activeOnly: true  },
        { permission: "EDIT",    label: "Editar",    icon: "ri-edit-line",         color: "text-primary",   handler: handlers.onEdit,    activeOnly: true  },
        { permission: "EXPORT",  label: "Exportar",  icon: "ri-download-2-line",   color: "text-secondary", handler: handlers.onExport,  activeOnly: true  },
        { permission: "DELETE",  label: "Eliminar",  icon: "ri-delete-bin-5-line", color: "text-danger",    handler: handlers.onDelete,  activeOnly: true, skipProtected: true },
        { permission: "RESTORE", label: "Restaurar", icon: "ri-refresh-line",      color: "text-success",   handler: handlers.onRestore, inactiveOnly: true },

        // Flujos / aprobaciones
        { permission: "APPROVE", label: "Aprobar",  icon: "ri-checkbox-circle-line", color: "text-success", handler: handlers.onApprove, activeOnly: true },
        { permission: "REJECT",  label: "Rechazar", icon: "ri-close-circle-line",    color: "text-danger",  handler: handlers.onReject,  activeOnly: true },
        { permission: "SUBMIT",  label: "Enviar",   icon: "ri-send-plane-line",      color: "text-primary", handler: handlers.onSubmit,  activeOnly: true },
        { permission: "CANCEL",  label: "Cancelar", icon: "ri-forbid-line",          color: "text-warning", handler: handlers.onCancel,  activeOnly: true },

        // IPs y Red
        { permission: "ASSIGN_IP",  label: "Asignar IP",  icon: "ri-link",              color: "text-primary", handler: handlers.onAssignIp,  activeOnly: true },
        { permission: "RELEASE_IP", label: "Liberar IP",  icon: "ri-link-unlink",       color: "text-warning", handler: handlers.onReleaseIp, activeOnly: true },
        { permission: "RESERVE_IP", label: "Reservar IP", icon: "ri-bookmark-line",     color: "text-info",    handler: handlers.onReserveIp, activeOnly: true },
        { permission: "BLOCK_IP",   label: "Bloquear IP", icon: "ri-shield-cross-line", color: "text-danger",  handler: handlers.onBlockIp,   activeOnly: true },

        // Servidores e Infraestructura
        { permission: "POWER_ON",     label: "Encender Servidor",  icon: "ri-power-line",     color: "text-success", handler: handlers.onPowerOn,      activeOnly: true },
        { permission: "POWER_OFF",    label: "Apagar Servidor",    icon: "ri-shut-down-line", color: "text-danger",  handler: handlers.onPowerOff,     activeOnly: true },
        { permission: "REBOOT",       label: "Reiniciar Servidor", icon: "ri-restart-line",   color: "text-warning", handler: handlers.onReboot,       activeOnly: true },
        { permission: "DECOMMISSION", label: "Dar de Baja",        icon: "ri-archive-line",   color: "text-danger",  handler: handlers.onDecommission, activeOnly: true },

        // Seguridad — Usuarios
        { permission: "RESET_PASSWORD", label: "Resetear Contraseña",  icon: "ri-lock-password-line", color: "text-warning", handler: handlers.onResetPassword, activeOnly: true },
        { permission: "BLOCK_USER",     label: "Bloquear Usuario",     icon: "ri-user-forbid-line",   color: "text-danger",  handler: handlers.onBlockUser,     activeOnly: true },
        { permission: "UNBLOCK_USER",   label: "Desbloquear Usuario",  icon: "ri-user-follow-line",   color: "text-success", handler: handlers.onUnblockUser,   activeOnly: true },

        // Seguridad — Roles
        { permission: "GRANT_PERMISSION",  label: "Otorgar Permiso", icon: "ri-shield-check-line",  color: "text-success", handler: handlers.onGrantPermission,  activeOnly: true },
        { permission: "REVOKE_PERMISSION", label: "Revocar Permiso", icon: "ri-shield-cross-line",  color: "text-danger",  handler: handlers.onRevokePermission, activeOnly: true },
        { permission: "ASSIGN_ROLE",       label: "Asignar Rol",     icon: "ri-user-settings-line", color: "text-primary", handler: handlers.onAssignRole,       activeOnly: true },
        { permission: "REMOVE_ROLE",       label: "Remover Rol",     icon: "ri-user-unfollow-line", color: "text-warning", handler: handlers.onRemoveRole,       activeOnly: true },

        // Certificados SSL
        { permission: "INSTALL_CERT", label: "Instalar Certificado", icon: "ri-install-line",      color: "text-success", handler: handlers.onInstallCert, activeOnly: true },
        { permission: "RENEW_CERT",   label: "Renovar Certificado",  icon: "ri-loop-right-line",   color: "text-primary", handler: handlers.onRenewCert,   activeOnly: true },
        { permission: "REVOKE_CERT",  label: "Revocar Certificado",  icon: "ri-shield-cross-line", color: "text-danger",  handler: handlers.onRevokeCert,  activeOnly: true },

        // Vault y SSH
        { permission: "GENERATE_SSH_CERT", label: "Generar Certificado SSH", icon: "ri-key-2-line",    color: "text-info",    handler: handlers.onGenerateSshCert, activeOnly: true },
        { permission: "EXECUTE_REMOTE",    label: "Ejecutar Comando Remoto", icon: "ri-terminal-line", color: "text-warning", handler: handlers.onExecuteRemote,   activeOnly: true },

        // Auditoría
        { permission: "VIEW_AUDIT", label: "Ver Auditoría", icon: "ri-file-search-line",   color: "text-info",   handler: handlers.onViewAudit, activeOnly: true },
        { permission: "PURGE_LOGS", label: "Purgar Logs",   icon: "ri-delete-back-2-line", color: "text-danger", handler: handlers.onPurgeLogs, activeOnly: true },

        // Contratos
        { permission: "TRACK",          label: "Hacer Seguimiento", icon: "ri-map-pin-time-line", color: "text-info",      handler: handlers.onTrack,         activeOnly: true },
        { permission: "VIEW_HISTORY",   label: "Ver Historial",     icon: "ri-history-line",      color: "text-secondary", handler: handlers.onViewHistory,   activeOnly: true },
        { permission: "EVALUATE",       label: "Evaluar",           icon: "ri-star-line",         color: "text-warning",   handler: handlers.onEvaluate,      activeOnly: true },
        { permission: "RENEW_CONTRACT", label: "Renovar Contrato",  icon: "ri-loop-right-line",   color: "text-primary",   handler: handlers.onRenewContract, activeOnly: true },
        { permission: "TERMINATED",     label: "Terminar Contrato", icon: "ri-close-circle-line", color: "text-danger",    handler: handlers.onTerminated,    activeOnly: true },

        // Configuración
        { permission: "CONFIG_SYSTEM",    label: "Configurar Sistema", icon: "ri-settings-3-line",    color: "text-secondary", handler: handlers.onConfigSystem,    activeOnly: true },
        { permission: "MAINTAIN_CATALOG", label: "Mantener Catálogo",  icon: "ri-list-settings-line", color: "text-secondary", handler: handlers.onMaintainCatalog, activeOnly: true },
    ]

    const visible = actions.filter(a => {
        if (!can(permissions, a.permission)) return false
        if (!a.handler)                      return false
        if (a.activeOnly   && isInactive)    return false
        if (a.inactiveOnly && !isInactive)   return false
        if (a.skipProtected && isProtected)  return false
        return true
    })

    if (visible.length === 0) return null

    return (
        <Dropdown align="end">
            <Dropdown.Toggle variant="" className="btn btn-icon btn-secondary-light btn-sm btn-wave waves-light no-caret">
                <i className="ti ti-dots-vertical"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu
                renderOnMount
                popperConfig={{
                    strategy: "fixed",
                    modifiers: [{ name: "offset", options: { offset: [0, 4] } }],
                }}
            >
                {visible.map(a => (
                    <li key={a.permission}>
                        <Dropdown.Item onClick={() => a.handler!(id)}>
                            <i className={`${a.icon} me-2 ${a.color}`}></i>
                            {a.label}
                        </Dropdown.Item>
                    </li>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}