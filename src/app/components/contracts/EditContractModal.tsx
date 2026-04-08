"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";

interface IContractEdit {
    id               : string | null;
    agreed_price_usd : number | null;
    terms            : string;
}

interface EditContractModalProps {
    show      : boolean;
    onHide    : () => void;
    onSuccess : () => void;
    contract  : any | null;
    urlbase   : string;
}

const validationSchema = Yup.object().shape({
    agreed_price_usd: Yup.number()
        .required("El precio es obligatorio")
        .typeError("Debe ser un número")
        .min(1, "Debe ser mayor a 0"),
    terms: Yup.string()
        .nullable()
        .max(5000, "Máximo 5000 caracteres"),
})

const initialValues: IContractEdit = {
    id               : null,
    agreed_price_usd : null,
    terms            : "",
}

export default function EditContractModal({ show, onHide, onSuccess, contract, urlbase }: EditContractModalProps) {
    const [values, setValues]             = useState<IContractEdit>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show && contract) {
            setValues({
                id               : contract.id ?? null,
                agreed_price_usd : contract.agreed_price_usd ?? null,
                terms            : contract.terms ?? "",
            })
        } else if (show && !contract) {
            setValues(initialValues)
        }
    }, [show, contract])

    const handleClose = () => {
        setValues(initialValues)
        onHide()
    }

    const handleSubmit = async (vals: IContractEdit, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            await apiFetch(`${urlbase}/admin/contracts/${vals.id}`, {
                method : "PUT",
                body   : JSON.stringify({
                    agreed_price_usd : vals.agreed_price_usd,
                    terms            : vals.terms || null,
                }),
            })
            toast.success("Contrato actualizado correctamente.")
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
                            <h6 className="modal-title">Editar Contrato</h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close" />
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">
                                <Col sm={12} lg={4}>
                                    <Form.Label>Precio acordado (USD):<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="number" className={`form-control-sm ${errors.agreed_price_usd && touched.agreed_price_usd ? "is-invalid" : ""}`} name="agreed_price_usd" placeholder="Ej. 750" value={v.agreed_price_usd ?? ""} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.agreed_price_usd && touched.agreed_price_usd && <div className="invalid-feedback">{errors.agreed_price_usd}</div>}
                                </Col>

                                <Col sm={12}>
                                    <Form.Label>Términos y condiciones:</Form.Label>
                                    <Form.Control as="textarea" rows={8} className={`form-control-sm ${errors.terms && touched.terms ? "is-invalid" : ""}`} name="terms" placeholder="Ingrese los términos del contrato..." value={v.terms} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.terms && touched.terms && <div className="invalid-feedback">{errors.terms}</div>}
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