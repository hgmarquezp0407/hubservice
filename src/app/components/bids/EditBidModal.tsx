"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";
import { SelectOption } from "@/app/interfaces/general_interface";

interface IBidEdit {
    id                 : string | null;
    proposed_price_usd : number | null;
    estimated_hours    : number | null;
    proposal           : string;
    expires_at         : string;
    bid_status_id      : string;
}

interface EditBidModalProps {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
    bid       : any | null;
    urlbase   : string;
}

const STATUS_OPTIONS: SelectOption[] = [
    { value: "pending",   label: "Pendiente" },
    { value: "accepted",  label: "Aceptada" },
    { value: "rejected",  label: "Rechazada" },
    { value: "withdrawn", label: "Retirada" },
]

const validationSchema = Yup.object().shape({
    proposed_price_usd: Yup.number()
        .required("El precio es obligatorio")
        .typeError("Debe ser un número")
        .min(0, "Debe ser mayor a 0"),
    estimated_hours: Yup.number()
        .nullable()
        .typeError("Debe ser un número")
        .min(1, "Mínimo 1 hora"),
    proposal: Yup.string()
        .required("La propuesta es obligatoria")
        .trim(),
    expires_at: Yup.string().nullable(),
    bid_status_id: Yup.string().required("El estado es obligatorio"),
})

const initialValues: IBidEdit = {
    id                 : null,
    proposed_price_usd : null,
    estimated_hours    : null,
    proposal           : "",
    expires_at         : "",
    bid_status_id      : "",
}

export default function EditBidModal({ show, onHide, onSuccess, bid, urlbase }: EditBidModalProps) {
    const [values, setValues]             = useState<IBidEdit>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show && bid) {
            setValues({
                id                 : bid.id ?? null,
                proposed_price_usd : bid.proposed_price_usd ?? null,
                estimated_hours    : bid.estimated_hours ?? null,
                proposal           : bid.proposal ?? "",
                expires_at         : bid.expires_at ? bid.expires_at.slice(0, 16) : "",
                bid_status_id      : bid.bid_status_id ?? "",
            })
        } else if (show && !bid) {
            setValues(initialValues)
        }
    }, [show, bid])

    const handleClose = () => {
        setValues(initialValues)
        onHide()
    }

    const handleSubmit = async (vals: IBidEdit, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            await apiFetch(`${urlbase}/admin/bids/${vals.id}`, {
                method : "PUT",
                body   : JSON.stringify({
                    proposed_price_usd : vals.proposed_price_usd,
                    estimated_hours    : vals.estimated_hours ?? null,
                    proposal           : vals.proposal,
                    expires_at         : vals.expires_at || null,
                    bid_status_id      : vals.bid_status_id,
                }),
            })
            toast.success("Propuesta actualizada correctamente.")
            resetForm()
            onSuccess()
            handleClose()
        } catch (err: any) {
            toast.error(err.message || "Error al guardar.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal size="lg" show={show} onHide={handleClose} centered className="fade" tabIndex={-1}>
            <Formik initialValues={values} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                {({ values: v, errors, touched, handleChange, handleBlur, handleSubmit: fmkSubmit }) => (
                    <Form onSubmit={fmkSubmit}>
                        <Modal.Header>
                            <h6 className="modal-title">Editar Propuesta</h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
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

                                <Col sm={12} lg={4}>
                                    <Form.Label>Estado:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="bid_status_id" option={STATUS_OPTIONS} getValue={v.bid_status_id} placeholder="Seleccionar..." />
                                    {errors.bid_status_id && touched.bid_status_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.bid_status_id}</div>
                                    )}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Propuesta:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={5} className={`form-control-sm ${errors.proposal && touched.proposal ? "is-invalid" : ""}`} name="proposal" placeholder="Descripción de la propuesta..." value={v.proposal} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.proposal && touched.proposal && <div className="invalid-feedback">{errors.proposal}</div>}
                                </Col>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={handleClose} Buttondismiss="modal">
                                <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                            </SpkButton>
                            <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting} Customclass={isSubmitting ? "btn-loader" : "waves-light"}>
                                {isSubmitting ? (
                                    <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
                                ) : (
                                    <i className="ri-save-3-line align-middle me-1"></i>
                                )}
                                <span className="me-1">{isSubmitting ? "Guardando..." : "Guardar"}</span>
                            </SpkButton>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}