"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { IBids } from "@/app/interfaces/general_interface";
import { formatDate } from "@/utils/validators";
import React, { Fragment } from "react";
import { Col, Modal, Row } from "react-bootstrap";

const STATUS_COLORS: Record<string, string> = {
    pending  : "warning",
    accepted : "success",
    rejected : "danger",
    withdrawn: "secondary",
}

interface Props {
    show  : boolean;
    onHide: () => void;
    bid   : IBids | null;
}

export default function ViewBidModal({ show, onHide, bid }: Props) {
    if (!bid) return null

    const specialistName = bid.specialist
        ? `${bid.specialist.person?.first_name ?? ""} ${bid.specialist.person?.last_name ?? ""}`.trim()
        : "—"

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header className="py-3 px-4" closeButton>
                <Modal.Title className="fw-medium fs-16">
                    Detalle de propuesta
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-3">
                <Row className="gy-3">
                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Especialista</div>
                        <div className="fw-medium">{specialistName}</div>
                        {bid.specialist?.person?.email && (
                            <div className="text-muted fs-12">{bid.specialist.person.email}</div>
                        )}
                    </Col>

                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Estado</div>
                        <span className={`badge bg-${STATUS_COLORS[bid.bid_status_id] ?? "secondary"}-transparent`}>
                            {bid.status?.name ?? bid.bid_status_id}
                        </span>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Precio propuesto</div>
                        <div className="fw-medium fs-15">
                            ${bid.proposed_price_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                        </div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Horas estimadas</div>
                        <div className="fw-medium">
                            {bid.estimated_hours != null ? `${bid.estimated_hours} h` : "—"}
                        </div>
                    </Col>

                    <Col sm={4}>
                        <div className="text-muted fs-12 mb-1">Vence</div>
                        <div className="fw-medium">
                            {bid.expires_at ? formatDate(bid.expires_at) : "—"}
                        </div>
                    </Col>

                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">Ticket ID</div>
                        <div className="fw-medium font-monospace fs-12">{bid.ticket_id}</div>
                    </Col>

                    <Col sm={6}>
                        <div className="text-muted fs-12 mb-1">F. Creación</div>
                        <div className="fw-medium">{formatDate(bid.created_at)}</div>
                    </Col>

                    {bid.proposal && (
                        <Col sm={12}>
                            <div className="text-muted fs-12 mb-1">Propuesta</div>
                            <div className="p-3 bg-light rounded fs-13" style={{ whiteSpace: "pre-wrap" }}>
                                {bid.proposal}
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