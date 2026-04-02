"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";
import { SelectOptionNumber } from "@/app/interfaces/general_interface";

interface ITicketEdit {
    id                 : string | null;
    title              : string;
    description        : string;
    ticket_priority_id : number | null;
    budget_usd         : number | null;
    sla_deadline       : string;
}

interface EditTicketModalProps {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
    ticket    : any | null;
    urlbase   : string;
}

const validationSchema = Yup.object().shape({
    title: Yup.string()
        .required("El título es obligatorio")
        .max(300, "Máximo 300 caracteres")
        .trim(),
    description: Yup.string()
        .required("La descripción es obligatoria")
        .trim(),
    ticket_priority_id: Yup.number()
        .required("La prioridad es obligatoria")
        .nullable(),
    budget_usd: Yup.number()
        .nullable()
        .typeError("Debe ser un número")
        .min(0, "Debe ser mayor a 0"),
    sla_deadline: Yup.string().nullable(),
})

const initialValues: ITicketEdit = {
    id                 : null,
    title              : "",
    description        : "",
    ticket_priority_id : null,
    budget_usd         : null,
    sla_deadline       : "",
}

const PRIORITY_OPTIONS: SelectOptionNumber[] = [
    { value: 1, label: "Baja" },
    { value: 2, label: "Media" },
    { value: 3, label: "Alta" },
    { value: 4, label: "Urgente" },
    { value: 5, label: "Crítica" },
]

export default function EditTicketModal({ show, onHide, onSuccess, ticket, urlbase }: EditTicketModalProps) {
    const [values, setValues]         = useState<ITicketEdit>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show && ticket) {
            setValues({
                id                 : ticket.id ?? null,
                title              : ticket.title ?? "",
                description        : ticket.description ?? "",
                ticket_priority_id : ticket.ticket_priority_id ?? null,
                budget_usd         : ticket.budget_usd ?? null,
                sla_deadline       : ticket.sla_deadline ? ticket.sla_deadline.slice(0, 16) : "",
            })
        } else if (show && !ticket) {
            setValues(initialValues)
        }
    }, [show, ticket])

    const handleClose = () => {
        setValues(initialValues)
        onHide()
    }

    const handleSubmit = async (vals: ITicketEdit, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            await apiFetch(`${urlbase}/admin/tickets/${vals.id}`, {
                method : "PUT",
                body   : JSON.stringify({
                    title              : vals.title,
                    description        : vals.description,
                    ticket_priority_id : vals.ticket_priority_id,
                    budget_usd         : vals.budget_usd,
                    sla_deadline       : vals.sla_deadline || null,
                }),
            })
            toast.success("Ticket actualizado correctamente.")
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
                            <h6 className="modal-title">Editar Ticket</h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
                                <Col sm={12}>
                                    <Form.Label>Título:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.title && touched.title ? "is-invalid" : ""}`} name="title" placeholder="Ingrese el título" value={v.title} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.title && touched.title && <div className="invalid-feedback">{errors.title}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Descripción:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={4} className={`form-control-sm ${errors.description && touched.description ? "is-invalid" : ""}`} name="description" placeholder="Ingrese la descripción" value={v.description} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.description && touched.description && <div className="invalid-feedback">{errors.description}</div>}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Prioridad:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="ticket_priority_id" option={PRIORITY_OPTIONS} getValue={v.ticket_priority_id!} placeholder="Seleccionar..." />
                                    {errors.ticket_priority_id && touched.ticket_priority_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.ticket_priority_id}</div>
                                    )}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Presupuesto (USD):</Form.Label>
                                    <Form.Control type="number" className={`form-control-sm ${errors.budget_usd && touched.budget_usd ? "is-invalid" : ""}`} name="budget_usd" placeholder="Ej. 500" value={v.budget_usd ?? ""} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.budget_usd && touched.budget_usd && <div className="invalid-feedback">{errors.budget_usd}</div>}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>SLA Deadline:</Form.Label>
                                    <Form.Control type="datetime-local" className={`form-control-sm ${errors.sla_deadline && touched.sla_deadline ? "is-invalid" : ""}`} name="sla_deadline" value={v.sla_deadline} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.sla_deadline && touched.sla_deadline && <div className="invalid-feedback">{errors.sla_deadline}</div>}
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