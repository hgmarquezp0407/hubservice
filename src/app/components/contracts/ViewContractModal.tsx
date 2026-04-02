"use client";

import React from "react";
import { Badge, Col, Modal, Row } from "react-bootstrap";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { formatDate } from "@/utils/validators";

interface ViewContractModalProps {
    show     : boolean;
    onHide   : () => void;
    contract : any | null;
}

const STATUS_COLORS: Record<string, string> = {
    active    : "primary",
    completed : "success",
    disputed  : "warning",
    cancelled : "danger",
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

export default function ViewContractModal({ show, onHide, contract }: ViewContractModalProps) {
    if (!contract) return null

    const specialistName = contract.specialist?.person
        ? `${contract.specialist.person.first_name ?? ""} ${contract.specialist.person.last_name ?? ""}`.trim()
        : null

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Modal.Header className="py-2 px-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="ri-file-text-line fs-5 text-primary"></i>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        Contrato
                        <span className="text-muted fw-normal ms-1">— {contract.company?.name}</span>
                    </span>
                    <Badge bg="" className={`bg-${STATUS_COLORS[contract.contract_status_id] ?? "secondary"}-transparent`} style={{ fontSize: "0.7rem" }}>
                        {contract.status?.name ?? "—"}
                    </Badge>
                </div>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body className="px-3 py-2">
                <Row className="g-3">
                    <Col md={6}>
                        <SectionTitle icon="ri-information-line" title="Partes del contrato" />
                        <Row2 label="Empresa"      value={contract.company?.name} />
                        <Row2 label="Especialista" value={specialistName} />
                        <Row2 label="Email"        value={contract.specialist?.person?.email} />

                        <SectionTitle icon="ri-money-dollar-circle-line" title="Económico" />
                        <Row2 label="Precio acordado" value={`$${contract.agreed_price_usd?.toLocaleString()}`} />
                        <Row2 label="Comisión (%)"    value={`${contract.commission_rate}%`} />
                        <Row2 label="Comisión (USD)"  value={`$${contract.commission_usd?.toLocaleString()}`} />
                    </Col>

                    <Col md={6}>
                        <SectionTitle icon="ri-calendar-line" title="Fechas" />
                        <Row2 label="Creado el"    value={formatDate(contract.created_at)} />
                        <Row2 label="Iniciado el"  value={contract.started_at  ? formatDate(contract.started_at)  : null} />
                        <Row2 label="Completado el" value={contract.completed_at ? formatDate(contract.completed_at) : null} />

                        <SectionTitle icon="ri-bar-chart-line" title="Estado" />
                        <Row2 label="Estado" value={contract.status?.name} />
                    </Col>

                    {contract.terms && (
                        <Col sm={12}>
                            <SectionTitle icon="ri-file-list-line" title="Términos y condiciones" />
                            <div className="p-2 rounded border" style={{ fontSize: "0.82rem", whiteSpace: "pre-wrap", background: "var(--default-background)", maxHeight: 200, overflowY: "auto" }}>
                                {contract.terms}
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