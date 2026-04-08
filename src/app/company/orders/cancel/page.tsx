"use client";

import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment } from "react";
import { Card, Col, Row } from "react-bootstrap";

export default function PaymentCancel() {
    return (
        <Fragment>
            <Seo title="Pago cancelado" />
            <Row className="justify-content-center mt-5">
                <Col xxl={5} xl={6} lg={7}>
                    <Card className="custom-card text-center">
                        <Card.Body className="py-5">
                            <div style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 72, height: 72, borderRadius: "50%",
                                background: "rgba(220,53,69,0.1)", marginBottom: 20,
                            }}>
                                <i className="ri-close-line" style={{ fontSize: 36, color: "rgb(220,53,69)" }}></i>
                            </div>
                            <h4 className="fw-semibold mb-2">Pago cancelado</h4>
                            <p className="text-muted mb-4">
                                Cancelaste el proceso de pago. Tu factura sigue pendiente.
                                Puedes intentarlo nuevamente cuando quieras.
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                                <Link href="/company/invoices" className="btn btn-primary waves-light">
                                    <i className="ri-arrow-go-back-line me-1"></i> Volver a facturas
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}