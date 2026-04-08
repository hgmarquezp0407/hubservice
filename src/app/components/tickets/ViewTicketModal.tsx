"use client";

import React from "react";
import { Badge, Col, Modal, Row } from "react-bootstrap";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { formatDate } from "@/utils/validators";

interface ViewTicketModalProps {
    show    : boolean;
    onHide  : () => void;
    ticket  : any | null;
}

const STATUS_COLORS: Record<string, string> = {
    open           : "primary",
    assigned       : "info",
    in_progress    : "warning",
    pending_review : "secondary",
    resolved       : "success",
    cancelled      : "danger",
}

const PRIORITY_COLORS: Record<number, string> = {
    1: "success",
    2: "warning",
    3: "danger",
    4: "danger",
    5: "danger",
}

const val = (v?: string | number | null) =>
    v !== null && v !== undefined && v !== ""
        ? <span className="fw-medium">{v}</span>
        : <span className="text-muted">—</span>

const Row2 = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="d-flex border-bottom py-1" style={{ fontSize: "0.82rem" }}>
        <div className="text-muted" style={{ minWidth: "40%", maxWidth: "40%" }}>{label}</div>
        <div className="flex-grow-1">{val(value)}</div>
    </div>
)

const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className="d-flex align-items-center gap-1 mb-1 mt-2 px-1 py-1 rounded"
        style={{ background: "var(--default-background)", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        <i className={`${icon} fs-12`}></i>{title}
    </div>
)

export default function ViewTicketModal({ show, onHide, ticket }: ViewTicketModalProps) {
    if (!ticket) return null

    const specialistName = ticket.specialist
        ? `${ticket.specialist.person?.first_name ?? ""} ${ticket.specialist.person?.last_name ?? ""}`.trim()
        : null

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Modal.Header className="py-2 px-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="ri-ticket-line fs-5 text-primary"></i>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        {ticket.ticket_number}
                        <span className="text-muted fw-normal ms-1">— {ticket.title}</span>
                    </span>
                    <Badge bg="" className={`bg-${STATUS_COLORS[ticket.ticket_status_id] ?? "secondary"}-transparent`} style={{ fontSize: "0.7rem" }}>
                        {ticket.status?.name ?? "—"}
                    </Badge>
                    <Badge bg="" className={`bg-${PRIORITY_COLORS[ticket.ticket_priority_id] ?? "secondary"}-transparent`} style={{ fontSize: "0.7rem" }}>
                        {ticket.priority?.name ?? "—"}
                    </Badge>
                </div>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body className="px-3 py-2">
                <Row className="g-3">
                    <Col md={6}>
                        <SectionTitle icon="ri-information-line" title="Información general" />
                        <Row2 label="N° Ticket"  value={ticket.ticket_number} />
                        <Row2 label="Empresa"    value={ticket.company?.name} />
                        <Row2 label="Servicio"   value={ticket.service?.name} />
                        <Row2 label="País"       value={ticket.country?.name} />
                        <Row2 label="Prioridad"  value={ticket.priority?.name} />
                        <Row2 label="Estado"     value={ticket.status?.name} />

                        <SectionTitle icon="ri-money-dollar-circle-line" title="Económico" />
                        <Row2 label="Presupuesto" value={ticket.budget_usd != null ? `$${ticket.budget_usd.toLocaleString()}` : "Abierto"} />

                        <SectionTitle icon="ri-user-line" title="Asignación" />
                        <Row2 label="Especialista" value={specialistName} />
                    </Col>

                    <Col md={6}>
                        <SectionTitle icon="ri-calendar-line" title="Fechas" />
                        <Row2 label="Creado el"    value={formatDate(ticket.created_at)} />
                        <Row2 label="Actualizado"  value={ticket.updated_at ? formatDate(ticket.updated_at) : null} />
                        <Row2 label="SLA Deadline" value={ticket.sla_deadline ? formatDate(ticket.sla_deadline) : null} />
                        <Row2 label="Resuelto el"  value={ticket.resolved_at ? formatDate(ticket.resolved_at) : null} />
                    </Col>

                    <Col sm={12}>
                        <SectionTitle icon="ri-file-text-line" title="Descripción" />
                        <div className="p-2 rounded border" style={{ fontSize: "0.82rem", whiteSpace: "pre-wrap", background: "var(--default-background)" }}>
                            {ticket.description}
                        </div>
                    </Col>
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