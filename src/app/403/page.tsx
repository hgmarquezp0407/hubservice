"use client"
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment } from "react";
import { Col } from "react-bootstrap";

export default function Error403() {
    return (
        <Fragment>
            <Seo title="404-Error" />
            <div className="page">
                <div className="error-page">
                    <div className="container">
                        <div className="my-auto">
                            <div className="row align-items-center justify-content-center h-100">
                                <Col xl={7} lg={5} md={6} className="col-12">
                                    <p className="error-text mb-4">403</p>
                                    <p className="fs-4 fw-normal mb-2">Acceso Denegado</p>
                                    <p className="fs-15 mb-5 text-muted">No tienes permiso para ver esta página.</p>
                                    <Link scroll={false} href="/admin/home" className="btn btn-primary"><i className="ri-arrow-left-line align-middle me-1 d-inline-block"></i> REGRESAR AL INICIO</Link>
                                </Col>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}