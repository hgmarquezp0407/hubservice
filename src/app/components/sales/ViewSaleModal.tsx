"use client";

import React from "react";
import { Badge, Col, Modal, Row } from "react-bootstrap";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { formatDate } from "@/utils/validators";

interface ViewSaleModalProps {
    show    : boolean;
    onHide  : () => void;
    invoice : any | null;
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

const val = (v?: string | number | null) =>
    v !== null && v !== undefined && v !== ""
        ? <span className="fw-medium">{v}</span>
        : <span className="text-muted">—</span>

const Row2 = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="d-flex border-bottom py-1" style={{ fontSize: "0.82rem" }}>
        <div className="text-muted" style={{ minWidth: "45%", maxWidth: "45%" }}>{label}</div>
        <div className="flex-grow-1">{val(value)}</div>
    </div>
)

const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className="d-flex align-items-center gap-1 mb-1 mt-2 px-1 py-1 rounded"
        style={{ background: "var(--default-background)", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        <i className={`${icon} fs-12`}></i>{title}
    </div>
)

export default function ViewSaleModal({ show, onHide, invoice }: ViewSaleModalProps) {
    if (!invoice) return null

    const voucherLabel = invoice.serie && invoice.voucher_number
        ? `${invoice.serie}-${String(invoice.voucher_number).padStart(8, "0")}`
        : "—"

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Modal.Header className="py-2 px-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="ri-bill-line fs-5 text-primary"></i>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        {voucherLabel}
                        <span className="text-muted fw-normal ms-1">— {invoice.customer_name}</span>
                    </span>
                    <Badge bg="" className={`bg-${STATUS_COLORS[invoice.invoice_status_id] ?? "secondary"}-transparent`} style={{ fontSize: "0.7rem" }}>
                        {invoice.status?.name ?? "—"}
                    </Badge>
                </div>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body className="px-3 py-2">
                <Row className="g-3">
                    <Col md={6}>
                        <SectionTitle icon="ri-information-line" title="Comprobante" />
                        <Row2 label="Serie"          value={invoice.serie} />
                        <Row2 label="N° Comprobante" value={invoice.voucher_number ? String(invoice.voucher_number).padStart(8, "0") : null} />
                        <Row2 label="Moneda"         value={invoice.currency_id} />
                        <Row2 label="Cliente"        value={invoice.customer_name} />
                        <Row2 label="Dirección"      value={invoice.customer_address} />

                        <SectionTitle icon="ri-money-dollar-circle-line" title="Montos" />
                        <Row2 label="Subtotal"         value={`$${invoice.subtotal?.toLocaleString()}`} />
                        <Row2 label="IGV"              value={invoice.igv > 0 ? `$${invoice.igv?.toLocaleString()}` : null} />
                        <Row2 label="Total"            value={`$${invoice.total?.toLocaleString()}`} />
                        <Row2 label="Comisión"         value={`$${invoice.platform_fee_usd?.toLocaleString()}`} />
                        <Row2 label="Base imponible"   value={`$${invoice.taxable_base_usd?.toLocaleString()}`} />
                        <Row2 label="Costo especialista" value={`$${invoice.specialist_cost_usd?.toLocaleString()}`} />
                        <Row2 label="IR estimado"      value={`$${invoice.estimated_ir_usd?.toLocaleString()}`} />
                    </Col>

                    <Col md={6}>
                        <SectionTitle icon="ri-calendar-line" title="Fechas" />
                        <Row2 label="Emitido el"   value={formatDate(invoice.created_at)} />
                        <Row2 label="F. Voucher"   value={invoice.date_voucher ? formatDate(invoice.date_voucher) : null} />
                        <Row2 label="Vencimiento"  value={invoice.due_date     ? formatDate(invoice.due_date)     : null} />
                        <Row2 label="Pagado el"    value={invoice.paid_at      ? formatDate(invoice.paid_at)      : null} />

                        <SectionTitle icon="ri-government-line" title="SUNAT" />
                        <Row2 label="CDR Código"      value={invoice.cdr_code} />
                        <Row2 label="CDR Descripción" value={invoice.cdr_description} />
                        <Row2 label="Hash"            value={invoice.hash} />
                        <Row2 label="XML"             value={invoice.xml_path} />
                        <Row2 label="CDR Path"        value={invoice.cdr_path} />
                    </Col>

                    {invoice.items?.length > 0 && (
                        <Col sm={12}>
                            <SectionTitle icon="ri-list-check-2" title="Ítems de la factura" />
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.82rem" }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Servicio</th>
                                            <th>Cód. SUNAT</th>
                                            <th>Descripción</th>
                                            <th>Cantidad</th>
                                            <th>Precio unit.</th>
                                            <th>IGV</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.filter((i: any) => i.state === 1).map((item: any) => (
                                            <tr key={item.id}>
                                                <td>{item.service?.name ?? "—"}</td>
                                                <td>{item.sunat_code ?? "—"}</td>
                                                <td>{item.description ?? "—"}</td>
                                                <td>{item.quantity}</td>
                                                <td>${item.unitprice?.toLocaleString()}</td>
                                                <td>{item.igv > 0 ? `$${item.igv?.toLocaleString()}` : "—"}</td>
                                                <td className="fw-medium">${item.total?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    )}
                </Row>
            </Modal.Body>

            <Modal.Footer className="py-2 px-3">
                <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={onHide}>
                    <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cerrar
                </SpkButton>
            </Modal.Footer>
        </Modal>
    )
}