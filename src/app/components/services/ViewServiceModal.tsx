"use client";

import React from "react";
import { Badge, Col, Modal, Row } from "react-bootstrap";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { IServices } from "@/app/interfaces/general_interface";
import { formatDate } from "@/utils/validators";

interface ViewServiceModalProps {
    show:   boolean;
    onHide: () => void;
    item:   IServices | null;
}

const val = (v?: string | number | null) =>
    v !== null && v !== undefined && v !== ""
        ? <span className="fw-medium">{v}</span>
        : <span className="text-muted">—</span>;

const Row2 = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="d-flex border-bottom py-1" style={{ fontSize: "0.82rem" }}>
        <div className="text-muted" style={{ minWidth: "52%", maxWidth: "52%" }}>{label}</div>
        <div className="flex-grow-1">{val(value)}</div>
    </div>
);

const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className="d-flex align-items-center gap-1 mb-1 mt-2 px-1 py-1 rounded"
        style={{ background: "var(--default-background)", fontSize: "0.78rem", fontWeight: 600,
                 textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        <i className={`${icon} fs-12`}></i>{title}
    </div>
);

export default function ViewServiceModal({ show, onHide, item }: ViewServiceModalProps) {
    if (!item) return null;


    return (
        // <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
        //     <Modal.Header className="py-2 px-3">
        //         <div className="d-flex align-items-center gap-2">
        //             <i className="ri-customer-service-2-line fs-5 text-primary"></i>
        //             <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>{item.name}</span>
        //             <span className="badge bg-light text-muted" style={{ fontSize: "0.7rem" }}>{item.code}</span>
        //             <Badge bg="" className={`bg-${isInactive ? "danger" : "success"}-transparent`} style={{ fontSize: "0.7rem" }}>
        //                 {isInactive ? "Inactivo" : "Activo"}
        //             </Badge>
        //         </div>
        //         <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close"
        //             Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
        //     </Modal.Header>

        //     <Modal.Body className="px-3 py-2">
        //         <Row className="g-3">

        //             <Col md={6}>
        //                 <SectionTitle icon="ri-information-line" title="Identificación" />
        //                 <Row2 label="Código"           value={item.code} />
        //                 <Row2 label="Nombre"           value={item.name} />
        //                 <Row2 label="Categoría"        value={item.service_category?.name} />
        //                 <Row2 label="Tipo"             value={item.service_type?.name} />

        //                 <SectionTitle icon="ri-user-settings-line" title="Responsabilidad" />
        //                 <Row2 label="Área Responsable" value={item.responsible_area?.name} />
        //                 <Row2 label="Responsable"      value={item.service_owner} />
        //                 <Row2 label="Audiencia"        value={item.target_audience} />
        //                 <Row2 label="Criticidad"       value={item.criticality_level?.name} />

        //                 {item.description && <>
        //                     <SectionTitle icon="ri-file-text-line" title="Descripción" />
        //                     <div style={{ fontSize: "0.82rem" }}>{item.description}</div>
        //                 </>}
        //                 {item.notes && <>
        //                     <SectionTitle icon="ri-sticky-note-line" title="Notas" />
        //                     <div style={{ fontSize: "0.82rem" }}>{item.notes}</div>
        //                 </>}
        //             </Col>

        //             <Col md={6}>
        //                 <SectionTitle icon="ri-time-line" title="Vigencia y SLA" />
        //                 <Row2 label="Fecha inicio"    value={item.start_date} />
        //                 <Row2 label="Fecha fin"       value={item.end_date} />
        //                 <Row2 label="SLA objetivo (%)" value={item.sla_target} />

        //                 <SectionTitle icon="ri-shield-check-line" title="Auditoría" />
        //                 <Row2 label="Creado el"       value={item.created_at ? formatDate(item.created_at) : null} />
        //                 <Row2 label="Creado por"      value={item.creator?.username} />
        //                 <Row2 label="Actualizado el"  value={item.updated_at ? formatDate(item.updated_at) : null} />
        //                 <Row2 label="Actualizado por" value={item.updater?.username} />
        //                 {isInactive && <>
        //                     <Row2 label="Eliminado el"  value={item.deleted_at ? formatDate(item.deleted_at) : null} />
        //                     <Row2 label="Eliminado por" value={item.deleter?.username} />
        //                 </>}
        //             </Col>

        //         </Row>
        //     </Modal.Body>

        //     <Modal.Footer className="py-2 px-3">
        //         <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={onHide}>
        //             <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cerrar
        //         </SpkButton>
        //     </Modal.Footer>
        // </Modal>
        <>
        </>
    );
}
