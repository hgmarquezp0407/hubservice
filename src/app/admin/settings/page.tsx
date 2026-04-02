"use client";

import Seo from "@/app/components/layouts/seo/seo";
import SpkBreadcrumb from "@/app/components/@spk-reusable/reusable-uielements/spk-breadcrumb";
import Link from "next/link";
import React, { Fragment } from "react";
import { Col, Row } from "react-bootstrap";

interface SettingsItem {
    label: string;
    href: string;
}

interface SettingsGroup {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    items: SettingsItem[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
    {
        title: "Organizacional",
        iconBg: "rgba(var(--bs-primary-rgb), 0.1)",
        iconColor: "var(--bs-primary)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
        ),
        items: [
            { label: "Sedes",       href: "settings/sites"     },
            { label: "Sucursales",  href: "settings/branches"  },
            { label: "Áreas",       href: "settings/areas"     },
            { label: "Cargos",      href: "settings/charges"   },
            { label: "Avanzado",    href: "settings/advanced"  },
        ],
    },
    {
        title: "Generales",
        iconBg: "rgba(var(--bs-success-rgb), 0.1)",
        iconColor: "var(--bs-success)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
        ),
        items: [
            { label: "Monedas",            href: "settings/currencies" },
            { label: "Arquitecturas",      href: "settings/architectures" },
            { label: "Países",             href: "settings/countries"  },
            { label: "Unidades de medida", href: "settings/units"      },
            { label: "Tipos de impuesto",  href: "settings/taxes"      },
        ],
    },
    {
        title: "Plantillas PDF",
        iconBg: "rgba(var(--bs-warning-rgb), 0.1)",
        iconColor: "var(--bs-warning)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
        ),
        items: [
            { label: "Contratos", href: "settings/pdf/contracts" },
            { label: "Licencias", href: "settings/pdf/licenses"  },
            { label: "Reportes",  href: "settings/pdf/reports"   },
        ],
    },
    {
        title: "Avanzado",
        iconBg: "rgba(var(--bs-danger-rgb), 0.1)",
        iconColor: "var(--bs-danger)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
        ),
        items: [
            { label: "Tareas programadas", href: "tasks"          },
            { label: "Logs del sistema",   href: "settings/logs"  },
            { label: "Respaldos",          href: "settings/backups" },
        ],
    },
];

export default function Settings() {
    return (
        <Fragment>
            <Seo title="Configuración" />

            <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
                <div>
                    <SpkBreadcrumb Customclass="mb-1">
                        <li className="breadcrumb-item active" aria-current="page">Configuración</li>
                    </SpkBreadcrumb>
                    <h4 className="fw-medium mb-0">Configuración del sistema</h4>
                </div>
            </div>

            <Row className="g-3 mt-1">
                {SETTINGS_GROUPS.map((group) => (
                    <Col key={group.title} xxl={3} xl={4} md={6} xs={12}>
                        <div className="custom-card card h-100" style={{ overflow: "hidden" }}>
                            {/* Header */}
                            <div
                                className="card-header d-flex align-items-center gap-2 py-3"
                                style={{ borderBottom: "1px solid var(--default-border)" }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center rounded"
                                    style={{
                                        width: 28, height: 28,
                                        background: group.iconBg,
                                        color: group.iconColor,
                                        flexShrink: 0,
                                    }}
                                >
                                    {group.icon}
                                </div>
                                <span className="fw-medium fs-14">{group.title}</span>
                            </div>

                            {/* Items */}
                            <div className="card-body p-0">
                                {group.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        scroll={false}
                                        className="d-flex align-items-center justify-content-between px-3 text-decoration-none"
                                        style={{
                                            padding: "9px 16px",
                                            fontSize: 13,
                                            color: "var(--text-muted)",
                                            borderTop: idx > 0 ? "1px solid var(--default-border)" : "none",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "var(--light)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <span>{item.label}</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6"/>
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </Fragment>
    );
}