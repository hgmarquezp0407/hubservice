"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkAlert from "@/app/components/@spk-reusable/reusable-uielements/spk-alert";
import { toast } from "react-toastify";

interface SunatInfoModalProps {
    show    : boolean;
    onHide  : () => void;
    invoice : any | null;
}

const getStatusConfig = (statusId: string) => {
    const map: Record<string, { color: string; icon: string; name: string }> = {
        registered : { color: "secondary", icon: "ri-file-line",          name: "Registrado" },
        pending    : { color: "warning",   icon: "ri-time-line",           name: "Pendiente" },
        sended     : { color: "info",      icon: "ri-send-plane-line",     name: "Enviado" },
        accepted   : { color: "success",   icon: "ri-checkbox-circle-line",name: "Aceptado" },
        observed   : { color: "warning",   icon: "ri-eye-line",            name: "Observado" },
        rejected   : { color: "danger",    icon: "ri-close-circle-line",   name: "Rechazado" },
        paid       : { color: "primary",   icon: "ri-money-dollar-circle-line", name: "Pagado" },
        annuled    : { color: "danger",    icon: "ri-forbid-line",         name: "Anulado" },
    }
    return map[statusId] ?? { color: "secondary", icon: "ri-file-line", name: statusId }
}

const copyToClipboard = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles.")
}

export default function SunatInfoModal({ show, onHide, invoice }: SunatInfoModalProps) {
    if (!invoice) return null

    const sunatResponse = typeof invoice.sunat_response === "string"
        ? null
        : invoice.sunat_response

    const statusConfig = getStatusConfig(invoice.invoice_status_id)

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Modal.Header>
                <h6 className="modal-title">Info SUNAT</h6>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body>
                {!sunatResponse ? (
                    <SpkAlert variant="info">
                        <i className="ri-time-line me-2"></i>
                        El documento aún no ha sido enviado a SUNAT.
                    </SpkAlert>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        <div className={`alert alert-${statusConfig.color} d-flex align-items-center mb-3`}>
                            <div className="flex-shrink-0 me-3">
                                <i className={`${statusConfig.icon} fs-2`}></i>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="alert-heading mb-1 fs-13">{statusConfig.name}</h6>
                                <p className="mb-0">{sunatResponse?.description ?? sunatResponse?.message ?? "—"}</p>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label text-muted small mb-1">Hash de Firma Digital</label>
                                    <div className="input-group">
                                        <input type="text" className="form-control font-monospace small bg-light" value={invoice.hash || "N/A"} readOnly />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => copyToClipboard(invoice.hash)}>
                                            <i className="ri-file-copy-line"></i>
                                        </button>
                                    </div>
                                </div>

                                {sunatResponse?.code && (
                                    <div className="col-6">
                                        <label className="form-label text-muted small mb-1">Código de Respuesta</label>
                                        <input type="text" className="form-control bg-light" value={sunatResponse.code} readOnly />
                                    </div>
                                )}

                                {sunatResponse?.ticket && (
                                    <div className="col-6">
                                        <label className="form-label text-muted small mb-1">Ticket SUNAT</label>
                                        <input type="text" className="form-control bg-light font-monospace" value={sunatResponse.ticket} readOnly />
                                    </div>
                                )}
                            </div>

                            {sunatResponse?.notes && sunatResponse.notes.length > 0 && (
                                <div className="mt-3">
                                    <label className="form-label text-muted small mb-2">Notas Adicionales</label>
                                    <div className="alert alert-info mb-0">
                                        <ul className="mb-0 ps-3">
                                            {sunatResponse.notes.map((note: string, i: number) => (
                                                <li key={i}>{note}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={onHide} Buttondismiss="modal">
                    <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cerrar
                </SpkButton>
            </Modal.Footer>
        </Modal>
    )
}