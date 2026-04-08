"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTablescomponent from "@/app/components/@spk-reusable/reusable-tables/tables-component";
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Card, Col, Modal, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { debounce } from "lodash";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { apiFetch } from "@/utils/api";
import { formatDate } from "@/utils/validators";
import { toast } from "react-toastify";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import { SelectOption } from "@/app/interfaces/general_interface";
import { useCrud } from "@/app/hooks/useCrud";

interface ICashRegister {
    id              : number;
    name            : string;
    currency_id     : string;
    opening_balance : number;
    created_at      : string;
    state           : number;
    currency        : { id: string; name: string; symbol: string | null } | null;
}

interface ICashRegisterForm {
    id              : number | null;
    name            : string;
    currency_id     : string;
    opening_balance : number | null;
}

const initialValues: ICashRegisterForm = {
    id              : null,
    name            : "",
    currency_id     : "",
    opening_balance : null,
}

const validationSchema = Yup.object().shape({
    name        : Yup.string().required("El nombre es obligatorio").trim(),
    currency_id : Yup.string().required("La moneda es obligatoria"),
    opening_balance: Yup.number().nullable().typeError("Debe ser un número").min(0, "Debe ser mayor o igual a 0"),
})

export default function CashRegisters() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]         = useState("")
    const [showModal, setShowModal]   = useState(false)
    const [formValues, setFormValues] = useState<ICashRegisterForm>(initialValues)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currencies, setCurrencies] = useState<SelectOption[]>([])

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage, from, to,
        setCurrentPage, fetchItems, deleteItem, restoreItem,
    } = useCrud<ICashRegister>({ endpoint: `${urlbase}/admin/cash-registers`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search)
    }, [user, currentPage])

    useEffect(() => {
        if (!showModal || currencies.length > 0) return
        const controller = new AbortController()
        apiFetch(`${urlbase}/admin/catalogs/currencies`, { signal: controller.signal })
            .then((data: any[]) => setCurrencies(data.map(c => ({ value: c.id, label: `${c.name} (${c.symbol ?? c.id})` }))))
            .catch(() => {})
        return () => controller.abort()
    }, [showModal])

    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setCurrentPage(1)
            fetchItems(1, term)
        }, 200), []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        debouncedSearch(e.target.value)
    }

    const handleNew = () => {
        setFormValues(initialValues)
        setShowModal(true)
    }

    const handleEdit = (item: ICashRegister) => {
        setFormValues({
            id              : item.id,
            name            : item.name,
            currency_id     : item.currency_id,
            opening_balance : item.opening_balance,
        })
        setShowModal(true)
    }

    const handleClose = (resetForm: () => void) => {
        resetForm()
        setFormValues(initialValues)
        setShowModal(false)
    }

    const handleSubmit = async (vals: ICashRegisterForm, { resetForm }: any) => {
        setIsSubmitting(true)
        try {
            if (vals.id) {
                await apiFetch(`${urlbase}/admin/cash-registers/${vals.id}`, {
                    method : "PUT",
                    body   : JSON.stringify({ name: vals.name, opening_balance: vals.opening_balance }),
                })
                toast.success("Caja actualizada correctamente.")
            } else {
                await apiFetch(`${urlbase}/admin/cash-registers`, {
                    method : "POST",
                    body   : JSON.stringify({ name: vals.name, currency_id: vals.currency_id, opening_balance: vals.opening_balance ?? 0 }),
                })
                toast.success("Caja creada correctamente.")
            }
            resetForm()
            setShowModal(false)
            fetchItems(currentPage, search)
        } catch (err: any) {
            toast.error(err.message || "Error al guardar.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = (id: number) => {
        deleteItem(id, () => fetchItems(currentPage, search))
    }

    const handleRestore = (id: number) => {
        restoreItem(id, () => fetchItems(currentPage, search))
    }

    return (
        <Fragment>
            <Seo title="Cajas Registradoras" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Cajas Registradoras</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input className="form-control form-control-sm" type="text" placeholder="Buscar caja..." value={search} onChange={handleSearchChange} />
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>
                                <SpkButton Buttonvariant="primary" Size="sm" Customclass="waves-light" onClickfunc={handleNew}>
                                    <i className="ri-add-line fw-medium align-middle me-1"></i> Nueva caja
                                </SpkButton>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div className="table-responsive">
                                <SpkTablescomponent
                                    tableClass="text-nowrap table-striped table-hover"
                                    header={[
                                        { title: "#" },
                                        { title: "Nombre" },
                                        { title: "Moneda" },
                                        { title: "Saldo inicial" },
                                        { title: "Estado" },
                                        { title: "F. Creación" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr><td colSpan={7} className="text-center py-4"><i className="ri-loader-2-fill fs-20 me-2" /> Cargando...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-4">Ningún dato para mostrar.</td></tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td><span className="fw-medium">{item.name}</span></td>
                                                <td>{item.currency?.name ?? item.currency_id} {item.currency?.symbol && `(${item.currency.symbol})`}</td>
                                                <td><span className="fw-medium">{item.opening_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></td>
                                                <td>
                                                    <span className={`badge bg-${item.state === 1 ? "success" : "danger"}-transparent`}>
                                                        {item.state === 1 ? "Activa" : "Inactiva"}
                                                    </span>
                                                </td>
                                                <td>{formatDate(item.created_at)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        {item.state === 1 ? (
                                                            <>
                                                                <SpkButton Buttonvariant="primary-light" Size="sm" Buttontoggle="tooltip" Title="Editar" onClickfunc={() => handleEdit(item)}>
                                                                    <i className="ri-edit-line"></i>
                                                                </SpkButton>
                                                                <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Desactivar" onClickfunc={() => handleDelete(item.id)}>
                                                                    <i className="ri-delete-bin-5-line"></i>
                                                                </SpkButton>
                                                            </>
                                                        ) : (
                                                            <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Restaurar" onClickfunc={() => handleRestore(item.id)}>
                                                                <i className="ri-refresh-line"></i>
                                                            </SpkButton>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </SpkTablescomponent>
                            </div>
                        </Card.Body>

                        {total > 0 && (
                            <Card.Footer className="card-footer">
                                <div className="d-flex align-items-center flex-wrap overflow-auto">
                                    <div className="mb-2 mb-sm-0">Mostrando {from} a {to} de {total} registros</div>
                                    {totalPages > 1 && (
                                        <div className="ms-auto">
                                            <PaginatorCentered currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                        </div>
                                    )}
                                </div>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>

            <Formik initialValues={formValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                {({ values: v, errors, touched, handleChange, handleBlur, handleSubmit: fmkSubmit, resetForm }) => (
                    <Modal size="lg" show={showModal} onHide={() => handleClose(resetForm)} centered className="fade" tabIndex={-1}>
                        <Form onSubmit={fmkSubmit}>
                            <Modal.Header>
                                <h6 className="modal-title">{v.id ? "Editar Caja" : "Nueva Caja"}</h6>
                                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={() => handleClose(resetForm)} Buttonlabel="Close" />
                            </Modal.Header>
                            <Modal.Body>
                                <div className="row gy-2">
                                    <Col sm={12}>
                                        <Form.Label>Nombre:<span className="fw-medium text-danger">*</span></Form.Label>
                                        <Form.Control type="text" className={`form-control-sm ${errors.name && touched.name ? "is-invalid" : ""}`} name="name" placeholder="Ej. Caja Principal USD" value={v.name} onChange={handleChange} onBlur={handleBlur} />
                                        {errors.name && touched.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </Col>
                                    <Col sm={12} lg={6}>
                                        <Form.Label>Moneda:<span className="fw-medium text-danger">*</span></Form.Label>
                                        <SpkSelectFormik name="currency_id" option={currencies} getValue={v.currency_id} placeholder="Seleccionar moneda..." disabled={!!v.id} />
                                        {errors.currency_id && touched.currency_id && (
                                            <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>{errors.currency_id}</div>
                                        )}
                                    </Col>
                                    <Col sm={12} lg={6}>
                                        <Form.Label>Saldo inicial:</Form.Label>
                                        <Form.Control type="number" className={`form-control-sm ${errors.opening_balance && touched.opening_balance ? "is-invalid" : ""}`} name="opening_balance" placeholder="0.00" value={v.opening_balance ?? ""} onChange={handleChange} onBlur={handleBlur} disabled={!!v.id} />
                                        {errors.opening_balance && touched.opening_balance && <div className="invalid-feedback">{errors.opening_balance}</div>}
                                    </Col>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={() => handleClose(resetForm)} Buttondismiss="modal">
                                    <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                                </SpkButton>
                                <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting} Customclass={isSubmitting ? "btn-loader" : "waves-light"}>
                                    {isSubmitting ? <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span> : <i className="ri-save-3-line align-middle me-1"></i>}
                                    <span className="me-1">{isSubmitting ? "Guardando..." : "Guardar"}</span>
                                </SpkButton>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                )}
            </Formik>
        </Fragment>
    )
}