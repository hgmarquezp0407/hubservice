"use client";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import Seo from "@/app/components/layouts/seo/seo";
import React, { Fragment, useState, useEffect } from "react";
import { Col, Row, Modal, Form, Alert, Card } from "react-bootstrap";
import { useAdmin } from "@/app/hooks/useAdmin";
import { toast } from "react-toastify";

export default function Admin() {
    const { urlbase } = useAdmin();

    return (
        <Fragment>
            <Seo title="Home" />

            <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap mb-2 gap-2">
                <div>
                    <h1 className="page-title fw-medium pb-2 fs-18 mb-0">DASHBOARDS</h1>
                </div>
            </div>
        </Fragment>
    );
}