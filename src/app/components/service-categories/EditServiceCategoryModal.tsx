"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";
import { IServiceCategory } from "@/app/interfaces/general_interface";

interface Props {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
    category  : any | null;
    urlbase   : string;
}

const validationSchema = Yup.object().shape({
    name       : Yup.string().required("El nombre es obligatorio").max(100, "Máximo 100 caracteres").trim(),
    slug       : Yup.string().required("El slug es obligatorio").max(100, "Máximo 100 caracteres").matches(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones").trim(),
    description: Yup.string().nullable(),
    icon       : Yup.string().nullable(),
    sort_order : Yup.number().min(0, "Debe ser mayor o igual a 0").typeError("Debe ser un número"),
})

const initialValues: IServiceCategory = {
    id: null, 
    name: "", 
    slug: "", 
    description: "", 
    icon: "", 
    parent_id: null, 
    sort_order: 0,
}

export default function EditServiceCategoryModal({ show, onHide, onSuccess, category, urlbase }: Props) {
    const [values, setValues] = useState<IServiceCategory>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show && category) {
            setValues({
                id         : category.id ?? null,
                name       : category.name ?? "",
                slug       : category.slug ?? "",
                description: category.description ?? "",
                icon       : category.icon ?? "",
                parent_id  : category.parent_id ?? null,
                sort_order : category.sort_order ?? 0,
            })
        } else if (show && !category) {
            setValues(initialValues)
        }
    }, [show, category])

    const handleClose = () => { setValues(initialValues); onHide() }

    const handleSubmit = async (vals: IServiceCategory, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            const payload = {
                name       : vals.name,
                slug       : vals.slug,
                description: vals.description || null,
                icon       : vals.icon || null,
                parent_id  : vals.parent_id,
                sort_order : vals.sort_order,
            }
            if (vals.id) {
                await apiFetch(`${urlbase}/admin/service-categories/${vals.id}`, { 
                    method: "PUT", 
                    body: JSON.stringify(payload) 
                })
                toast.success("Categoría actualizada correctamente.")
            } else {
                await apiFetch(`${urlbase}/admin/service-categories`, { 
                    method: "POST", 
                    body: JSON.stringify(payload) 
                })
                toast.success("Categoría creada correctamente.")
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
        <Modal show={show} onHide={handleClose} centered className="fade" tabIndex={-1}>
            <Formik initialValues={values} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                {({ values: v, errors, touched, handleChange, handleBlur, handleSubmit: fmkSubmit }) => (
                    <Form onSubmit={fmkSubmit}>
                        <Modal.Header>
                            <h6 className="modal-title">{category ? "Editar Categoría" : "Nueva Categoría"}</h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
                                <Col sm={12}>
                                    <Form.Label>Nombre:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.name && touched.name ? "is-invalid" : ""}`} name="name" placeholder="Ej. Soporte Técnico" value={v.name} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.name && touched.name && <div className="invalid-feedback">{errors.name}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Slug:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.slug && touched.slug ? "is-invalid" : ""}`} name="slug" placeholder="Ej. soporte-tecnico" value={v.slug} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.slug && touched.slug && <div className="invalid-feedback">{errors.slug}</div>}
                                </Col>

                                <Col sm={8}>
                                    <Form.Label>Ícono:</Form.Label>
                                    <Form.Control type="text" className="form-control-sm" name="icon" placeholder="Ej. wrench" value={v.icon} onChange={handleChange} onBlur={handleBlur} />
                                </Col>

                                <Col sm={4}>
                                    <Form.Label>Orden:</Form.Label>
                                    <Form.Control type="number" className={`form-control-sm ${errors.sort_order && touched.sort_order ? "is-invalid" : ""}`} name="sort_order" value={v.sort_order} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.sort_order && touched.sort_order && <div className="invalid-feedback">{errors.sort_order}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Descripción:</Form.Label>
                                    <Form.Control as="textarea" rows={3} className="form-control-sm" name="description" placeholder="Descripción opcional" value={v.description} onChange={handleChange} onBlur={handleBlur} />
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