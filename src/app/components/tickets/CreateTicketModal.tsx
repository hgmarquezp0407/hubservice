"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";
import { SelectOption, SelectOptionNumber } from "@/app/interfaces/general_interface";

interface ITicketCreate {
    title              : string;
    description        : string;
    ticket_priority_id : number | null;
    service_id         : string;
    country_id         : string;
    budget_usd         : number | null;
    sla_deadline       : string;
}

interface CreateTicketModalProps {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
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
    service_id: Yup.string()
        .required("El servicio es obligatorio"),
    country_id: Yup.string()
        .required("El país es obligatorio"),
    budget_usd: Yup.number()
        .nullable()
        .typeError("Debe ser un número")
        .min(0, "Debe ser mayor a 0"),
    sla_deadline: Yup.string().nullable(),
})

const initialValues: ITicketCreate = {
    title              : "",
    description        : "",
    ticket_priority_id : null,
    service_id         : "",
    country_id         : "",
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

export default function CreateTicketModal({ show, onHide, onSuccess, urlbase }: CreateTicketModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [services, setServices]         = useState<SelectOption[]>([])
    const [countries, setCountries]       = useState<SelectOption[]>([])

    useEffect(() => {
        if (!show) return
        const controller = new AbortController()
        Promise.all([
            apiFetch(`${urlbase}/admin/services/list`, { signal: controller.signal }),
            apiFetch(`${urlbase}/admin/countries`, { signal: controller.signal }),
        ]).then(([servicesData, countriesData]) => {
            setServices(servicesData.map((s: any) => ({ value: s.id, label: s.name })))
            setCountries(countriesData.map((c: any) => ({ value: c.id, label: c.name })))
        }).catch(() => {})
        return () => controller.abort()
    }, [show])

    const handleClose = (resetForm: () => void) => {
        resetForm()
        onHide()
    }

    const handleSubmit = async (vals: ITicketCreate, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            await apiFetch(`${urlbase}/admin/tickets`, {
                method : "POST",
                body   : JSON.stringify({
                    title              : vals.title,
                    description        : vals.description,
                    ticket_priority_id : vals.ticket_priority_id,
                    service_id         : vals.service_id,
                    country_id         : vals.country_id,
                    budget_usd         : vals.budget_usd ?? null,
                    sla_deadline       : vals.sla_deadline || null,
                }),
            })
            toast.success("Ticket creado correctamente.")
            resetForm()
            onSuccess()
            onHide()
        } catch (err: any) {
            toast.error(err.message || "Error al crear el ticket.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                {({ values: v, errors, touched, handleChange, handleBlur, handleSubmit: fmkSubmit, resetForm }) => (
                    <Form onSubmit={fmkSubmit}>
                        <Modal.Header>
                            <h6 className="modal-title">Nuevo Ticket</h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={() => handleClose(resetForm)} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
                                <Col sm={12}>
                                    <Form.Label>Título:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.title && touched.title ? "is-invalid" : ""}`} name="title" placeholder="Ej. Soporte a usuarios por incidencias" value={v.title} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.title && touched.title && <div className="invalid-feedback">{errors.title}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Descripción:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={4} className={`form-control-sm ${errors.description && touched.description ? "is-invalid" : ""}`} name="description" placeholder="Describe el problema o requerimiento en detalle..." value={v.description} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.description && touched.description && <div className="invalid-feedback">{errors.description}</div>}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>Servicio:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="service_id" option={services} getValue={v.service_id} placeholder="Seleccionar servicio..." />
                                    {errors.service_id && touched.service_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.service_id}</div>
                                    )}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>País:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="country_id" option={countries} getValue={v.country_id} placeholder="Seleccionar país..." />
                                    {errors.country_id && touched.country_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.country_id}</div>
                                    )}
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
                            <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={() => handleClose(resetForm)} Buttondismiss="modal">
                                <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                            </SpkButton>
                            <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting} Customclass={isSubmitting ? "btn-loader" : "waves-light"}>
                                {isSubmitting ? (
                                    <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
                                ) : (
                                    <i className="ri-ticket-line align-middle me-1"></i>
                                )}
                                <span className="me-1">{isSubmitting ? "Creando..." : "Crear ticket"}</span>
                            </SpkButton>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}