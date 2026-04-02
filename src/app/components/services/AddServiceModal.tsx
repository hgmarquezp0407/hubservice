"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";
import { IService, SelectOption } from "@/app/interfaces/general_interface";

interface Props {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
    service   : any | null;
    urlbase   : string;
}

const validationSchema = Yup.object().shape({
    service_category_id    : Yup.number().required("La categoría es obligatoria").nullable(),
    name                   : Yup.string().required("El nombre es obligatorio").max(255).trim(),
    description            : Yup.string().required("La descripción es obligatoria").trim(),
    internal_code          : Yup.string().required("El código interno es obligatorio").max(20).trim(),
    sunat_code             : Yup.string().required("El código SUNAT es obligatorio").max(20).trim(),
    unit_id                : Yup.string().required("La unidad es obligatoria"),
    currency_id            : Yup.string().required("La moneda es obligatoria"),
    has_igv                : Yup.number().required(),
    id_sale_affectation_igv: Yup.string().required("El tipo de afectación es obligatorio"),
})

const initialValues: IService = {
    id: null, 
    service_category_id: null, 
    name: "", 
    description: "",
    internal_code: "", 
    sunat_code: "", 
    unit_id: "", 
    currency_id: "",
    has_igv: 0, 
    id_sale_affectation_igv: "",
}

export default function AddServiceModal({ show, onHide, onSuccess, service, urlbase }: Props) {
    const [values, setValues]             = useState<IService>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categoryOpts, setCategoryOpts] = useState<SelectOption[]>([])
    const [units, setUnits]               = useState<SelectOption[]>([])
    const [currencies, setCurrencies]     = useState<SelectOption[]>([])
    const [affectationigvtypes, setAffectationIgvTypes]     = useState<SelectOption[]>([])

    const fetchSelectOptions = async (endpoint: string, setter: (opts: SelectOption[]) => void, signal: AbortSignal) => {
        try {
            const data = await apiFetch(endpoint, { signal })
            setter(data.map((item: { id: string | number; name: string }) => ({
                value: item.id,
                label: item.name,
            })))
        } catch (error: any) {
            if (error.name !== "AbortError")
                toast.error(`Error cargando opciones: ${error.message}`)
        }
    }

    useEffect(() => {
        if (!show || !urlbase) return
        const ctrl = new AbortController()
        Promise.all([
            fetchSelectOptions(`${urlbase}/admin/service-categories/list`, setCategoryOpts, ctrl.signal),
            fetchSelectOptions(`${urlbase}/admin/units/list`, setUnits, ctrl.signal),
            fetchSelectOptions(`${urlbase}/admin/currencies/list`, setCurrencies, ctrl.signal),
            fetchSelectOptions(`${urlbase}/admin/catalogs/affectationigvtypes`, setAffectationIgvTypes, ctrl.signal),
        ])
        return () => ctrl.abort()
    }, [show, urlbase])

    useEffect(() => {
        if (show && service) {
            setValues({
                id                      : service.id ?? null,
                service_category_id     : service.service_category_id ?? null,
                name                    : service.name ?? "",
                description             : service.description ?? "",
                internal_code           : service.internal_code ?? "",
                sunat_code              : service.sunat_code ?? "",
                unit_id                 : service.unit_id ?? "",
                currency_id             : service.currency_id ?? "",
                has_igv                 : service.has_igv ?? 0,
                id_sale_affectation_igv : service.id_sale_affectation_igv ?? "",
            })
        } else if (show && !service) {
            setValues(initialValues)
        }
    }, [show, service])

    const handleClose = () => { setValues(initialValues); onHide() }

    const handleSubmit = async (vals: IService, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            const payload = {
                service_category_id     : vals.service_category_id,
                name                    : vals.name,
                description             : vals.description,
                internal_code           : vals.internal_code,
                sunat_code              : vals.sunat_code,
                unit_id                 : vals.unit_id,
                currency_id             : vals.currency_id,
                has_igv                 : vals.has_igv,
                id_sale_affectation_igv : vals.id_sale_affectation_igv,
            }
            if (vals.id) {
                await apiFetch(`${urlbase}/admin/services/${vals.id}`, { 
                    method: "PUT", 
                    body: JSON.stringify(payload) 
                })
                toast.success("Servicio actualizado correctamente.")
            } else {
                await apiFetch(`${urlbase}/admin/services`, { 
                    method: "POST", 
                    body: JSON.stringify(payload) 
                })
                toast.success("Servicio creado correctamente.")
            }
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
                            <h6 className="modal-title">{service ? "Editar Servicio" : "Nuevo Servicio"}</h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
                                <Col sm={12}>
                                    <Form.Label>Categoría:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="service_category_id" option={categoryOpts} getValue={v.service_category_id!} placeholder="Seleccionar categoría..." />
                                    {errors.service_category_id && touched.service_category_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.service_category_id}</div>
                                    )}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Nombre:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.name && touched.name ? "is-invalid" : ""}`} name="name" placeholder="Nombre del servicio" value={v.name} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.name && touched.name && <div className="invalid-feedback">{errors.name}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Descripción:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={2} className={`form-control-sm ${errors.description && touched.description ? "is-invalid" : ""}`} name="description" placeholder="Descripción del servicio" value={v.description} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.description && touched.description && <div className="invalid-feedback">{errors.description}</div>}
                                </Col>

                                <Col sm={6}>
                                    <Form.Label>Código Interno:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.internal_code && touched.internal_code ? "is-invalid" : ""}`} name="internal_code" placeholder="Ej. IT-SOP-001" value={v.internal_code} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.internal_code && touched.internal_code && <div className="invalid-feedback">{errors.internal_code}</div>}
                                </Col>

                                <Col sm={6}>
                                    <Form.Label>Código SUNAT:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.sunat_code && touched.sunat_code ? "is-invalid" : ""}`} name="sunat_code" placeholder="Ej. 81112100" value={v.sunat_code} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.sunat_code && touched.sunat_code && <div className="invalid-feedback">{errors.sunat_code}</div>}
                                </Col>

                                <Col sm={6}>
                                    <Form.Label>Unidad:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="unit_id" option={units} getValue={v.unit_id} placeholder="Seleccionar unidad..." />
                                    {errors.unit_id && touched.unit_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.unit_id}</div>
                                    )}
                                </Col>

                                <Col sm={6}>
                                    <Form.Label>Moneda:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="currency_id" option={currencies} getValue={v.currency_id} placeholder="Seleccionar moneda..." />
                                    {errors.currency_id && touched.currency_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.currency_id}</div>
                                    )}
                                </Col>

                                <Col sm={6}>
                                    <div className="d-flex align-items-center gap-2 rounded-3 p-3">
                                        <Form.Check type="checkbox" id="has_igv" name="has_igv" checked={v.has_igv === 1} onChange={e => setValues(p => ({ ...p, has_igv: e.target.checked ? 1 : 0 }))} />
                                        <Form.Label htmlFor="has_igv" className="mb-0 fs-13 cursor-pointer">
                                            Aplica IGV
                                        </Form.Label>
                                    </div>
                                </Col>

                                <Col sm={6}>
                                    <Form.Label>Tipo Afectación IGV:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="id_sale_affectation_igv" option={affectationigvtypes} getValue={v.id_sale_affectation_igv} placeholder="Seleccionar..." />
                                    {errors.id_sale_affectation_igv && touched.id_sale_affectation_igv && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.id_sale_affectation_igv}</div>
                                    )}
                                </Col>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={handleClose} Buttondismiss="modal">
                                <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                            </SpkButton>
                            <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting} Customclass={isSubmitting ? "btn-loader" : "waves-light"}>
                                {isSubmitting ? <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span> : <i className="ri-save-3-line align-middle me-1"></i>}
                                <span className="me-1">{isSubmitting ? "Guardando..." : "Guardar"}</span>
                            </SpkButton>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}