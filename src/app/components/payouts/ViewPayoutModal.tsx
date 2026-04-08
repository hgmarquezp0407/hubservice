"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { IPayouts } from "@/app/interfaces/general_interface";
import { formatDate } from "@/utils/validators";
import React from "react";
import { Col, Modal, Row } from "react-bootstrap";

const STATUS_COLORS: Record<string, string> = {
    pending    : "warning",
    processing : "info",
    completed  : "success",
    failed     : "danger",
}

interface Props {
    show   : boolean;
    onHide : () => void;
    payout : IPayouts | null;
}

export default function ViewPayoutModal({ show, onHide, payout }: Props) {
    if (!payout) return null

    const specialistName = payout.specialist
        ? `${payout.specialist.person?.first_name ?? ""} ${payout.specialist.person?.last_name ?? ""}`.trim()
        : "—"

    const netFinal = payout.net_after_retention ?? payout.net_amount

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header className="py-3 px-4" closeButton>
                <Modal.Title className="fw-medium fs-16">Detalle de liquidación</Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-3">
                <Row className="gy-3">
                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Especialista</div>
                        <div className="fw-medium">{specialistName}</div>
                    </Col>

                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Estado</div>
                        <span className={`badge bg-${STATUS_COLORS[payout.payout_status_id] ?? "secondary"}-transparent`}>
                            {payout.status?.name ?? payout.payout_status_id}
                        </span>
                    </Col>

                    <Col sm={3}>
                        <div className="text-muted fs-12 mb-1">Monto bruto</div>
                        <div className="fw-medium">${payout.gross_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </Col>

                    <Col sm={3}>
                        <div className="text-muted fs-12 mb-1">Comisión plataforma</div>
                        <div className="fw-medium text-danger">-${payout.platform_fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </Col>

                    <Col sm={3}>
                        <div className="text-muted fs-12 mb-1">Retención IR</div>
                        <div className="fw-medium text-warning">
                            {payout.retention_usd > 0
                                ? `-$${payout.retention_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                : "—"
                            }
                        </div>
                    </Col>

                    <Col sm={3}>
                        <div className="text-muted fs-12 mb-1">Neto a pagar</div>
                        <div className="fw-medium text-success fs-15">
                            ${netFinal.toLocaleString("en-US", { minimumFractionDigits: 2 })} {payout.currency_id}
                        </div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Gateway</div>
                        <div className="fw-medium">{payout.gateway ?? "—"}</div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Fecha programada</div>
                        <div className="fw-medium">{payout.scheduled_at ? formatDate(payout.scheduled_at) : "—"}</div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Fecha de pago</div>
                        <div className="fw-medium">{payout.paid_at ? formatDate(payout.paid_at) : "—"}</div>
                    </Col>

                    {payout.gateway_tx_id && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">TX ID</div>
                            <div className="fw-medium font-monospace fs-12">{payout.gateway_tx_id}</div>
                        </Col>
                    )}

                    {payout.error_message && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">Error</div>
                            <div className="p-3 bg-danger bg-opacity-10 rounded fs-13 text-danger">
                                {payout.error_message}
                            </div>
                        </Col>
                    )}

                    {payout.gateway_response && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">Respuesta gateway</div>
                            <pre className="p-3 bg-light rounded fs-12" style={{ maxHeight: 200, overflow: "auto" }}>
                                {JSON.stringify(payout.gateway_response, null, 2)}
                            </pre>
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