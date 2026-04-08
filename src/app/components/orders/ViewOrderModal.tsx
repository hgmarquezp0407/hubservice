"use client";

import React from "react";
import { Badge, Col, Modal, Row } from "react-bootstrap";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { formatDate } from "@/utils/validators";

interface ViewOrderModalProps {
    show   : boolean;
    onHide : () => void;
    order  : any | null;
}

const STATUS_COLORS: Record<string, string> = {
    draft          : "secondary",
    pending_review : "warning",
    approved       : "success",
    disputed       : "danger",
    cancelled      : "danger",
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

export default function ViewOrderModal({ show, onHide, order }: ViewOrderModalProps) {
    if (!order) return null

    const specialistName = order.specialist?.person
        ? `${order.specialist.person.first_name ?? ""} ${order.specialist.person.last_name ?? ""}`.trim()
        : null

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Modal.Header className="py-2 px-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="ri-file-list-3-line fs-5 text-primary"></i>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        {order.order_number}
                        <span className="text-muted fw-normal ms-1">— {order.company?.name}</span>
                    </span>
                    <Badge bg="" className={`bg-${STATUS_COLORS[order.order_status_id] ?? "secondary"}-transparent`} style={{ fontSize: "0.7rem" }}>
                        {order.status?.name ?? "—"}
                    </Badge>
                </div>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body className="px-3 py-2">
                <Row className="g-3">
                    <Col md={6}>
                        <SectionTitle icon="ri-information-line" title="General" />
                        <Row2 label="N° Orden"     value={order.order_number} />
                        <Row2 label="Empresa"      value={order.company?.name} />
                        <Row2 label="Especialista" value={specialistName} />
                        <Row2 label="Moneda"       value={order.currency_id} />

                        <SectionTitle icon="ri-money-dollar-circle-line" title="Montos" />
                        <Row2 label="Subtotal"    value={`$${order.subtotal?.toLocaleString()}`} />
                        <Row2 label="IGV"         value={order.igv > 0 ? `$${order.igv?.toLocaleString()}` : null} />
                        <Row2 label="Total"       value={`$${order.total?.toLocaleString()}`} />
                        <Row2 label="Comisión"    value={`$${order.platform_fee?.toLocaleString()}`} />
                    </Col>

                    <Col md={6}>
                        <SectionTitle icon="ri-calendar-line" title="Fechas" />
                        <Row2 label="Creado el"          value={formatDate(order.created_at)} />
                        <Row2 label="Actualizado"        value={order.updated_at ? formatDate(order.updated_at) : null} />
                        <Row2 label="Inicio programado"  value={order.scheduled_start ? formatDate(order.scheduled_start) : null} />
                        <Row2 label="Fin programado"     value={order.scheduled_end   ? formatDate(order.scheduled_end)   : null} />
                        <Row2 label="Inicio real"        value={order.actual_start    ? formatDate(order.actual_start)    : null} />
                        <Row2 label="Fin real"           value={order.actual_end      ? formatDate(order.actual_end)      : null} />
                    </Col>

                    {order.specialist_notes && (
                        <Col sm={12}>
                            <SectionTitle icon="ri-user-line" title="Notas del especialista" />
                            <div className="p-2 rounded border" style={{ fontSize: "0.82rem", whiteSpace: "pre-wrap", background: "var(--default-background)" }}>
                                {order.specialist_notes}
                            </div>
                        </Col>
                    )}

                    {order.company_notes && (
                        <Col sm={12}>
                            <SectionTitle icon="ri-building-line" title="Notas de la empresa" />
                            <div className="p-2 rounded border" style={{ fontSize: "0.82rem", whiteSpace: "pre-wrap", background: "var(--default-background)" }}>
                                {order.company_notes}
                            </div>
                        </Col>
                    )}

                    {order.items?.length > 0 && (
                        <Col sm={12}>
                            <SectionTitle icon="ri-list-check-2" title="Ítems de la orden" />
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.82rem" }}>
                                    <thead className="table-light">
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
                                        {order.items.filter((i: any) => i.state === 1).map((item: any) => (
                                            <tr key={item.id}>
                                                <td>{item.service?.name ?? "—"}</td>
                                                <td>{item.description ?? "—"}</td>
                                                <td>{item.quantity}</td>
                                                <td>${item.unit_price?.toLocaleString()}</td>
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