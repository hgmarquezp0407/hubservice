"use client";

import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment } from "react";
import { Card, Col, Row } from "react-bootstrap";

export default function PaymentSuccess() {
    return (
        <Fragment>
            <Seo title="Pago exitoso" />
            <Row className="justify-content-center mt-5">
                <Col xxl={5} xl={6} lg={7}>
                    <Card className="custom-card text-center">
                        <Card.Body className="py-5">
                            <div style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 72, height: 72, borderRadius: "50%",
                                background: "rgba(40,180,100,0.12)", marginBottom: 20,
            }}>
                                <i className="ri-check-line" style={{ fontSize: 36, color: "rgb(40,180,100)" }}></i>
                            </div>
                            <h4 className="fw-semibold mb-2">¡Pago realizado con éxito!</h4>
                            <p className="text-muted mb-4">
                                Tu pago fue procesado correctamente. La factura será marcada como pagada
                                y el especialista recibirá su liquidación en breve.
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                                <Link href="/company/invoices" className="btn btn-primary waves-light">
                                    <i className="ri-file-list-3-line me-1"></i> Ver mis facturas
                                </Link>
                                <Link href="/company/payments" className="btn btn-light">
                                    <i className="ri-bank-card-line me-1"></i> Ver mis pagos
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}