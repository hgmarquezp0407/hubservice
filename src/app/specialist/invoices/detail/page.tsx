"use client";

import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { apiFetch } from "@/utils/api";
import { formatDate } from "@/utils/validators";
import { IInvoices } from "@/app/interfaces/general_interface";

interface IConfig {
    company_name       : string | null;
    company_ruc        : string | null;
    company_address    : string | null;
    company_phone      : string | null;
    company_email      : string | null;
    company_district   : string | null;
    company_province   : string | null;
    company_department : string | null;
    url_logo           : string | null;
}

const STATUS_COLORS: Record<string, string> = {
    registered : "secondary",
    pending    : "warning",
    sended     : "info",
    accepted   : "success",
    observed   : "warning",
    rejected   : "danger",
    paid       : "primary",
    annuled    : "danger",
}

export default function InvoiceDetail() {
    const { user }     = useAuth()
    const { urlbase }  = useAdmin()
    const searchParams = useSearchParams()
    const id           = searchParams.get("id")

    const [invoice, setInvoice] = useState<IInvoices | null>(null)
    const [config, setConfig]   = useState<IConfig | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.id || !id) return
        Promise.all([
            apiFetch(`${urlbase}/admin/invoices/${id}`),
            apiFetch(`${urlbase}/admin/configurations`),
        ]).then(([inv, cfg]) => {
            setInvoice(inv)
            setConfig(cfg)
        }).catch(() => {})
        .finally(() => setLoading(false))
    }, [user, id])

    const voucherLabel = invoice?.serie && invoice?.voucher_number
        ? `${invoice.serie}-${String(invoice.voucher_number).padStart(8, "0")}`
        : "—"

    if (loading) return (
        <div className="text-center py-5">
            <i className="ri-loader-2-fill fs-20 me-2" /> Cargando...
        </div>
    )

    if (!invoice) return (
        <div className="text-center py-5 text-muted">
            Factura no encontrada.
        </div>
    )

    return (
        <Fragment>
            <Seo title="Detalle de Factura" />

            <Row>
                <Col xl={9}>
                    <Card className="custom-card">
                        <div className="card-header d-md-flex d-block justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <div>
                                    <div className="h6 fw-medium mb-0">
                                        FACTURA ELECTRÓNICA:{" "}
                                        <span className="text-primary">{voucherLabel}</span>
                                    </div>
                                    <span className={`badge bg-${STATUS_COLORS[invoice.invoice_status_id] ?? "secondary"}-transparent mt-1`}>
                                        {invoice.status?.name ?? invoice.invoice_status_id}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-md-0 mt-2 d-flex gap-2">
                                <Link href="/company/invoices" className="btn btn-light btn-sm">
                                    <i className="ri-arrow-left-line me-1"></i>Volver
                                </Link>
                            </div>
                        </div>

                        <Card.Body>
                            <div className="row gy-4">

                                {/* Emisor y receptor */}
                                <Col xl={12}>
                                    <Row>
                                        <Col xl={4} lg={4} md={6} sm={6}>
                                            <p className="text-muted mb-2 fw-medium">Emisor:</p>
                                            {config?.url_logo && (
                                                <img src={config.url_logo} alt="Logo" style={{ maxHeight: 48, maxWidth: 160, objectFit: "contain", marginBottom: 8, display: "block" }} />
                                            )}
                                            <p className="fw-bold mb-1">{config?.company_name ?? "APP HUB SERVICE"}</p>
                                            {config?.company_ruc && <p className="mb-1 text-muted fs-12">RUC: {config.company_ruc}</p>}
                                            {config?.company_address && <p className="mb-1 text-muted fs-12">{config.company_address}</p>}
                                            {(config?.company_district || config?.company_province || config?.company_department) && (
                                                <p className="mb-1 text-muted fs-12">
                                                    {[config.company_district, config.company_province, config.company_department].filter(Boolean).join(", ")}
                                                </p>
                                            )}
                                            {config?.company_phone && <p className="mb-1 text-muted fs-12"><i className="ri-phone-line me-1"></i>{config.company_phone}</p>}
                                            {config?.company_email && <p className="mb-1 text-muted fs-12"><i className="ri-mail-line me-1"></i>{config.company_email}</p>}
                                        </Col>
                                        <Col xl={4} lg={4} md={6} sm={6} className="ms-auto mt-sm-0 mt-3">
                                            <p className="text-muted mb-2 fw-medium">Facturado a:</p>
                                            <p className="fw-bold mb-1">{invoice.customer_name ?? "—"}</p>
                                            {invoice.customer_address && (
                                                <p className="text-muted mb-1 fs-12">{invoice.customer_address}</p>
                                            )}
                                        </Col>
                                    </Row>
                                </Col>

                                {/* Metadatos */}
                                <Col xl={3} sm={6}>
                                    <p className="fw-medium text-muted mb-1">N° Comprobante:</p>
                                    <p className="fs-15 mb-0 fw-medium text-primary">{voucherLabel}</p>
                                </Col>
                                <Col xl={3} sm={6}>
                                    <p className="fw-medium text-muted mb-1">Moneda:</p>
                                    <p className="fs-15 mb-0">{invoice.currency_id}</p>
                                </Col>
                                <Col xl={3} sm={6}>
                                    <p className="fw-medium text-muted mb-1">F. Emisión:</p>
                                    <p className="fs-15 mb-0">{invoice.date_voucher ? formatDate(invoice.date_voucher) : formatDate(invoice.created_at)}</p>
                                </Col>
                                <Col xl={3} sm={6}>
                                    <p className="fw-medium text-muted mb-1">F. Vencimiento:</p>
                                    <p className="fs-15 mb-0">{invoice.due_date ? formatDate(invoice.due_date) : "—"}</p>
                                </Col>

                                {/* Items */}
                                <Col xl={12}>
                                    <div className="table-responsive">
                                        <table className="table nowrap text-nowrap border mt-2">
                                            <thead>
                                                <tr>
                                                    <th>Servicio</th>
                                                    <th>Descripción</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio unit.</th>
                                                    <th>IGV</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.items?.map(item => (
                                                    <tr key={item.id}>
                                                        <td className="fw-medium">{item.service?.name ?? "—"}</td>
                                                        <td className="text-muted">{item.description ?? "—"}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${item.unitprice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                                        <td>
                                                            {item.igv > 0
                                                                ? `$${item.igv.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                                                : <span className="text-muted">—</span>
                                                            }
                                                        </td>
                                                        <td className="fw-medium">${item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={4}></td>
                                                    <td colSpan={2}>
                                                        <table className="table table-sm mb-0 table-borderless">
                                                            <tbody>
                                                                <tr>
                                                                    <th><p className="mb-0 text-muted">Subtotal:</p></th>
                                                                    <td><p className="mb-0 fw-medium">${invoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></td>
                                                                </tr>
                                                                <tr>
                                                                    <th><p className="mb-0 text-muted">IGV ({(invoice.igv_rate * 100).toFixed(0)}%):</p></th>
                                                                    <td>
                                                                        <p className="mb-0 fw-medium">
                                                                            {invoice.igv > 0
                                                                                ? `$${invoice.igv.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                                                                : <span className="text-muted">—</span>
                                                                            }
                                                                        </p>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th><p className="mb-0 fs-14 fw-semibold">Total:</p></th>
                                                                    <td><p className="mb-0 fw-bold fs-16 text-success">${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} {invoice.currency_id}</p></td>
                                                                </tr>
                                                                <tr>
                                                                    <th><p className="mb-0 text-muted">Comisión plataforma:</p></th>
                                                                    <td><p className="mb-0 fw-medium text-danger">-${invoice.platform_fee_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></td>
                                                                </tr>
                                                                <tr>
                                                                    <th><p className="mb-0 text-muted">Neto especialista:</p></th>
                                                                    <td><p className="mb-0 fw-medium text-primary">${invoice.specialist_cost_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Col>

                                {invoice.notes && (
                                    <Col xl={12}>
                                        <p className="text-muted mb-1 fw-medium">Notas:</p>
                                        <div className="p-3 bg-light rounded fs-13">{invoice.notes}</div>
                                    </Col>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Panel lateral */}
                <Col xl={3}>
                    <Card className="custom-card">
                        <div className="card-header">
                            <div className="card-title">Estado comprobante</div>
                        </div>
                        <Card.Body>
                            <div className="row gy-3">
                                <Col xl={12}>
                                    <p className="fw-medium text-muted fs-12 mb-1">Estado SUNAT:</p>
                                    <span className={`badge bg-${STATUS_COLORS[invoice.invoice_status_id] ?? "secondary"}-transparent fs-12`}>
                                        {invoice.status?.name ?? "—"}
                                    </span>
                                </Col>

                                <Col xl={12}>
                                    <p className="fw-medium text-muted fs-12 mb-1">Total:</p>
                                    <p className="mb-0 fw-bold fs-16 text-success">
                                        ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} {invoice.currency_id}
                                    </p>
                                </Col>

                                <Col xl={12}>
                                    <p className="fw-medium text-muted fs-12 mb-1">Método de pago:</p>
                                    <p className="mb-0 fw-medium">
                                        {invoice.paymenttype_id === "01" ? "Contado" : invoice.paymenttype_id === "02" ? "Crédito" : "—"}
                                    </p>
                                </Col>

                                {invoice.paid_at && (
                                    <Col xl={12}>
                                        <p className="fw-medium text-muted fs-12 mb-1">Pagado el:</p>
                                        <p className="mb-0 fw-medium text-primary">{formatDate(invoice.paid_at)}</p>
                                    </Col>
                                )}

                                {invoice.cdr_code && (
                                    <Col xl={12}>
                                        <p className="fw-medium text-muted fs-12 mb-1">Código CDR:</p>
                                        <p className="mb-0 fw-medium">{invoice.cdr_code}</p>
                                    </Col>
                                )}

                                {invoice.cdr_description && (
                                    <Col xl={12}>
                                        <p className="fw-medium text-muted fs-12 mb-1">Descripción CDR:</p>
                                        <p className="mb-0 fs-12 text-muted">{invoice.cdr_description}</p>
                                    </Col>
                                )}

                                <Col xl={12}>
                                    <p className="fw-medium text-muted fs-12 mb-2">Descargas:</p>
                                    <div className="d-flex flex-column gap-2">
                                        {invoice.url_file ? (
                                            <a href={invoice.url_file} target="_blank" rel="noopener noreferrer" className="btn btn-danger-light btn-sm w-100">
                                                <i className="ri-file-pdf-2-line me-1"></i>Descargar PDF
                                            </a>
                                        ) : (
                                            <button className="btn btn-light btn-sm w-100" disabled>
                                                <i className="ri-file-pdf-2-line me-1"></i>PDF no disponible
                                            </button>
                                        )}
                                        {invoice.xml_path && (
                                            <a href={invoice.xml_path} target="_blank" rel="noopener noreferrer" className="btn btn-success-light btn-sm w-100">
                                                <i className="ri-file-code-line me-1"></i>Descargar XML
                                            </a>
                                        )}
                                        {invoice.cdr_path && (
                                            <a href={invoice.cdr_path} target="_blank" rel="noopener noreferrer" className="btn btn-warning-light btn-sm w-100">
                                                <i className="ri-file-zip-line me-1"></i>Descargar CDR
                                            </a>
                                        )}
                                    </div>
                                </Col>

                                {invoice.invoice_status_id === "accepted" && (
                                    <Col xl={12}>
                                        <div className="alert alert-success py-2 fs-12 mb-0">
                                            <i className="ri-checkbox-circle-line me-1"></i>
                                            Factura aceptada por SUNAT correctamente.
                                        </div>
                                    </Col>
                                )}

                                {["observed", "rejected"].includes(invoice.invoice_status_id) && (
                                    <Col xl={12}>
                                        <div className="alert alert-danger py-2 fs-12 mb-0">
                                            <i className="ri-error-warning-line me-1"></i>
                                            {invoice.invoice_status_id === "observed" ? "Factura observada por SUNAT." : "Factura rechazada por SUNAT."}
                                        </div>
                                    </Col>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}