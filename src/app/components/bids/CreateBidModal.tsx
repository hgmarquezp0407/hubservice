"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";
import { ITickets } from "@/app/interfaces/general_interface";

interface IBidCreate {
    proposed_price_usd : number | null;
    estimated_hours    : number | null;
    proposal           : string;
    expires_at         : string;
}

interface CreateBidModalProps {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
    ticket    : ITickets | null;
    urlbase   : string;
}

const validationSchema = Yup.object().shape({
    proposed_price_usd: Yup.number()
        .required("El precio es obligatorio")
        .typeError("Debe ser un número")
        .min(1, "Debe ser mayor a 0"),
    estimated_hours: Yup.number()
        .nullable()
        .typeError("Debe ser un número")
        .min(1, "Mínimo 1 hora"),
    proposal: Yup.string()
        .required("La propuesta es obligatoria")
        .min(20, "Mínimo 20 caracteres")
        .trim(),
    expires_at: Yup.string().nullable(),
})

const initialValues: IBidCreate = {
    proposed_price_usd : null,
    estimated_hours    : null,
    proposal           : "",
    expires_at         : "",
}

export default function CreateBidModal({ show, onHide, onSuccess, ticket, urlbase }: CreateBidModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleClose = (resetForm: () => void) => {
        resetForm()
        onHide()
    }

    const handleSubmit = async (vals: IBidCreate, { resetForm }: any) => {
        if (!ticket) return
        setIsSubmitting(true)
        try {
            await apiFetch(`${urlbase}/admin/bids/tickets/${ticket.id}`, {
                method : "POST",
                body   : JSON.stringify({
                    proposed_price_usd : vals.proposed_price_usd,
                    estimated_hours    : vals.estimated_hours ?? null,
                    proposal           : vals.proposal,
                    expires_at         : vals.expires_at || null,
                }),
            })
            toast.success("Propuesta enviada correctamente.")
            resetForm()
            onSuccess()
            onHide()
        } catch (err: any) {
            toast.error(err.message || "Error al enviar la propuesta.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!ticket) return null

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                {({ values: v, errors, touched, handleChange, handleBlur, handleSubmit: fmkSubmit, resetForm }) => (
                    <Form onSubmit={fmkSubmit}>
                        <Modal.Header>
                            <div>
                                <h6 className="modal-title mb-0">Enviar propuesta</h6>
                                <p className="text-muted fs-12 mb-0 mt-1">
                                    <span className="fw-medium text-primary">{ticket.ticket_number}</span>
                                    {" — "}{ticket.title}
                                </p>
                            </div>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={() => handleClose(resetForm)} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
                                {ticket.budget_usd != null && (
                                    <Col sm={12}>
                                        <div className="alert alert-info py-2 mb-0 fs-13">
                                            <i className="ri-information-line me-1"></i>
                                            Presupuesto referencial de la empresa: <strong>${ticket.budget_usd.toLocaleString()} USD</strong>
                                        </div>
                                    </Col>
                                )}

                                <Col sm={12} lg={4}>
                                    <Form.Label>Precio propuesto (USD):<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="number" className={`form-control-sm ${errors.proposed_price_usd && touched.proposed_price_usd ? "is-invalid" : ""}`} name="proposed_price_usd" placeholder="Ej. 1500" value={v.proposed_price_usd ?? ""} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.proposed_price_usd && touched.proposed_price_usd && <div className="invalid-feedback">{errors.proposed_price_usd}</div>}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Horas estimadas:</Form.Label>
                                    <Form.Control type="number" className={`form-control-sm ${errors.estimated_hours && touched.estimated_hours ? "is-invalid" : ""}`} name="estimated_hours" placeholder="Ej. 40" value={v.estimated_hours ?? ""} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.estimated_hours && touched.estimated_hours && <div className="invalid-feedback">{errors.estimated_hours}</div>}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Vencimiento:</Form.Label>
                                    <Form.Control type="datetime-local" className={`form-control-sm ${errors.expires_at && touched.expires_at ? "is-invalid" : ""}`} name="expires_at" value={v.expires_at} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.expires_at && touched.expires_at && <div className="invalid-feedback">{errors.expires_at}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Propuesta:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={6} className={`form-control-sm ${errors.proposal && touched.proposal ? "is-invalid" : ""}`} name="proposal" placeholder="Describe tu propuesta, experiencia relevante y cómo abordarías este trabajo..." value={v.proposal} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.proposal && touched.proposal && <div className="invalid-feedback">{errors.proposal}</div>}
                                </Col>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={() => handleClose(resetForm)} Buttondismiss="modal">
                                <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                            </SpkButton>
                            <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting} Customclass={isSubmitting ? "btn-loader" : "waves-light"}>
                                {isSubmitting ? (
                                    <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
                                ) : (
                                    <i className="ri-send-plane-line align-middle me-1"></i>
                                )}
                                <span className="me-1">{isSubmitting ? "Enviando..." : "Enviar propuesta"}</span>
                            </SpkButton>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}