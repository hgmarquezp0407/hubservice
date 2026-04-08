"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { IPayments } from "@/app/interfaces/general_interface";
import { formatDate } from "@/utils/validators";
import React from "react";
import { Col, Modal, Row } from "react-bootstrap";

const STATUS_COLORS: Record<string, string> = {
    pending   : "warning",
    completed : "success",
    failed    : "danger",
    refunded  : "secondary",
}

interface Props {
    show    : boolean;
    onHide  : () => void;
    payment : IPayments | null;
}

export default function ViewPaymentModal({ show, onHide, payment }: Props) {
    if (!payment) return null

    const invoiceLabel = payment.invoice
        ? `${payment.invoice.serie}-${String(payment.invoice.voucher_number).padStart(8, "0")}`
        : payment.invoice_id

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header className="py-3 px-4" closeButton>
                <Modal.Title className="fw-medium fs-16">Detalle de pago</Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-3">
                <Row className="gy-3">
                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Factura</div>
                        <div className="fw-medium">{invoiceLabel}</div>
                    </Col>

                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Estado</div>
                        <span className={`badge bg-${STATUS_COLORS[payment.payment_status_id] ?? "secondary"}-transparent`}>
                            {payment.status?.name ?? payment.payment_status_id}
                        </span>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Monto</div>
                        <div className="fw-medium fs-15">
                            ${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {payment.currency_id}
                        </div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Gateway</div>
                        <div className="fw-medium text-capitalize">{payment.gateway}</div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">F. Creación</div>
                        <div className="fw-medium">{formatDate(payment.created_at)}</div>
                    </Col>

                    {payment.gateway_tx_id && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">TX ID</div>
                            <div className="fw-medium font-monospace fs-12">{payment.gateway_tx_id}</div>
                        </Col>
                    )}

                    {payment.error_message && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">Error</div>
                            <div className="p-3 bg-danger bg-opacity-10 rounded fs-13 text-danger">
                                {payment.error_message}
                            </div>
                        </Col>
                    )}

                    {payment.gateway_response && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">Respuesta gateway</div>
                            <pre className="p-3 bg-light rounded fs-12" style={{ maxHeight: 200, overflow: "auto" }}>
                                {JSON.stringify(payment.gateway_response, null, 2)}
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