"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTablescomponent from "@/app/components/@spk-reusable/reusable-tables/tables-component";
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Card, Col, Form, Modal, Row } from "react-bootstrap";
import { debounce } from "lodash";
import { Formik } from "formik";
import * as Yup from "yup";
import Paginator from "@/app/components/paginator/paginator";
import BadgeState from "@/app/components/general/BadgeState";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { useCrud } from "@/app/hooks/useCrud";
import { apiFetch } from "@/utils/api";
import { ICurrencies, ICurrency, SelectOption } from "@/app/interfaces/general_interface";
import { toast } from "react-toastify";
import SpkBreadcrumb from "@/app/components/@spk-reusable/reusable-uielements/spk-breadcrumb";
import TableActionsCatalogs from "@/app/components/general/TableActionsCatalogs";
import { useFetch } from "@/app/hooks/useFetch";

const validationSchema = Yup.object().shape({
    id: Yup.string()
        .required('El código es obligatorio')
        .min(3, "Mínimo 3 caracteres")
        .max(3, "Máximo 3 caracteres")
        .matches(/^[A-Za-z][A-Za-z]*$/, "Debe comenzar con una letra y solo puede contener letras."),
    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(2, "Mínimo 2 caracteres")
        .max(100, "Máximo 100 caracteres")
        .matches(/^[a-zA-Z]/, "Debe comenzar con una letra")
        .trim(),
    symbol: Yup.string()
        .required('El Símbolo es obligatoria')
        .min(1, 'El Símbolo debe tener al menos 1 caracter')
        .max(10, "Máximo 10 caracteres")
})

const initialCurrency: ICurrency = {
    id: null,
    name: "",
    symbol: "",
    country_id: ""
}

export default function Currencies() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [show, setShow]   = useState(false)
    const [search, setSearch] = useState("")
    const [currency, setCurrency]  = useState<ICurrency>(initialCurrency)
    const [currencies, setCurrencies]     = useState<ICurrencies[]>([])
    const [countries, setCountries] = useState<SelectOption[]>([]);

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items,
        loading,
        isSubmitting,
        total,
        totalPages,
        currentPage,
        from,
        to,
        permissions,
        can,
        setCurrentPage,
        fetchItems,
        fetchItem,
        saveItem,
        deleteItem,
        restoreItem,
    } = useFetch<ICurrencies>({ endpoint: `${urlbase}/admin/currencies`, itemsPerPage })

    // Carga inicial
    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search)
    }, [user, currentPage])

    // Búsqueda con debounce
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setCurrentPage(1)
            fetchItems(1, term)
        }, 200),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        debouncedSearch(e.target.value)
    }

    // Handlers
    const handleShow = () => {
        setCurrency(initialCurrency)
        setShow(true)
    }

    const handleCloseModal = () => setShow(false)

    const fetchSelectOptions = async (endpoint: string, setter: (opts: SelectOption[]) => void, signal: AbortSignal) => {
        try {
            const data = await apiFetch(endpoint, { signal })
            setter(data.map((item: { id: number; name: string }) => ({
                value: item.id,
                label: item.name,
            })))
        } catch (error: any) {
            if (error.name !== "AbortError")
                toast.error(`Error cargando opciones: ${error.message}`)
        }
    }

    useEffect(() => {
        if (!show) return
        const controller = new AbortController()
        Promise.all([
            fetchSelectOptions(`${urlbase}/admin/ubigeo/countries`, setCountries, controller.signal),
        ])
        return () => controller.abort()
    }, [show, urlbase])

    const handleEdit = async (id: string) => {
        const data = await fetchItem(id)
        if (!data) return
        setCurrency({
            id: data.id ?? null,
            name: data.name  ?? "",
            symbol: data.symbol ?? "",
            country_id: data.country_id ?? ""
        })
        setShow(true)
    }

    const handleSubmit = async (values: ICurrency, { setSubmitting, resetForm }: any) => {
        const ok = await saveItem(values, () => {
            resetForm()
            setCurrency(initialCurrency)
            setShow(false)
            fetchItems(currentPage, search)
        })
        if (!ok) setSubmitting(false)
    }

    const handleDelete = (id: string) => {
        deleteItem(id, () => fetchItems(currentPage, search))
    }

    const handleRestore = (id: string) => {
        restoreItem(id, () => fetchItems(currentPage, search))
    }

    return (
        <Fragment>
            <Seo title="Sedes" />

            <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
                <div>
                    <SpkBreadcrumb Customclass="mb-1">
                        <li className="breadcrumb-item">
                            <Link scroll={false} href="/admin/settings">Configuraciones</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">Monedas</li>
                    </SpkBreadcrumb>
                </div>
            </div>

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Monedas</div>

                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input className="form-control form-control-sm" type="text" placeholder="Buscar Moneda" value={search} onChange={handleSearchChange}/>
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>

                                {
                                    can("CREATE") && (
                                        <SpkButton Buttonvariant="primary" onClickfunc={handleShow} Size="sm" Customclass="waves-light">
                                            <i className="ri-add-line fw-medium align-middle me-1"></i> Nuevo
                                        </SpkButton>
                                    )
                                }
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div className="table-responsive">
                                <SpkTablescomponent
                                    tableClass="text-nowrap table-striped table-hover"
                                    header={[
                                        { title: "#" },
                                        { title: "Nombre" },
                                        { title: "Símbolo" },
                                        { title: "País" },
                                        { title: "Estado" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                Ningún dato para mostrar.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((elem, index) => (
                                            <tr className="task-list" key={elem.id ?? index}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>{elem.name}</td>
                                                <td>{elem.symbol}</td>
                                                <td>{elem.country.name}</td>
                                                <td><BadgeState state={elem.state} /></td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        {elem.state === 1 ? (
                                                            <>
                                                                <SpkButton Buttonvariant="primary-light" Size="sm" Buttontoggle="tooltip" Title="Editar" onClickfunc={() => handleEdit(elem.id)}>
                                                                    <i className="ri-edit-line"></i>
                                                                </SpkButton>
                                                                <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Eliminar" onClickfunc={() => handleDelete(elem.id)}>
                                                                    <i className="ri-delete-bin-5-line"></i>
                                                                </SpkButton>
                                                            </>
                                                        ) : (
                                                            <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Restaurar" onClickfunc={() => handleRestore(elem.id)}>
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
                                    <div className="mb-2 mb-sm-0">
                                        Mostrando {from} a {to} de {total} registros{" "}
                                        <i className="bi bi-arrow-right ms-2 fw-semibold"></i>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="ms-auto">
                                            <Paginator
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal show={show} onHide={handleCloseModal} centered className="fade" tabIndex={-1}>
                <Formik initialValues={currency} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting: fmkSubmitting }) => (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Header>
                                <h6 className="modal-title">
                                    {currency?.id ? "Editar Moneda" : "Agregar Moneda"}
                                </h6>
                                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleCloseModal} Buttonlabel="Close"/>
                            </Modal.Header>

                            <Modal.Body>
                                <div className="row gy-2">                                    
                                    <Col xl={12}>
                                        <Form.Label htmlFor="name">
                                            Nombre:<span className="fw-medium text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control type="text" className={`form-control-sm ${errors.name && touched.name ? "is-invalid" : ""}`} name="name" placeholder="Ingrese nombre" value={values.name} onChange={handleChange} onBlur={handleBlur}/>

                                        {errors.name && touched.name && (
                                            <div className="invalid-feedback">{errors.name}</div>
                                        )}
                                    </Col>

                                    <Col xl={12}>
                                        <Form.Label htmlFor="symbol">Símbolo: </Form.Label>
                                        <Form.Control type="text" className={`form-control-sm ${errors.symbol && touched.symbol ? "is-invalid" : ""}`} name="symbol" placeholder="EJ: S/, $, etc." value={values.symbol} onChange={handleChange} onBlur={handleBlur}/>
                                        
                                        {errors.symbol && touched.symbol && (
                                            <div className="invalid-feedback">{ errors.symbol }</div>
                                        )}
                                    </Col>

                                    <Col sm={12}>
                                        <Form.Label htmlFor="country_id" className="">
                                            País:<span className="fw-medium text-danger">*</span> 
                                        </Form.Label>
                                        <SpkSelectFormik name="country_id" option={countries} placeholder="Seleccionar...!!" getValue={values.country_id!} />

                                        {errors.country_id && touched.country_id && (
                                            <div className="invalid-feedback">{ errors.country_id }</div>
                                        )}
                                    </Col>
                                </div>
                            </Modal.Body>

                            <Modal.Footer>
                                <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={handleCloseModal} Buttondismiss="modal">
                                    <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                                </SpkButton>
                                <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting || fmkSubmitting}
                                    Customclass={isSubmitting || fmkSubmitting ? "btn-loader" : "waves-light"}
                                >
                                    {isSubmitting || fmkSubmitting ? (
                                        <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
                                    ) : (
                                        <i className="ri-save-3-line align-middle me-1"></i>
                                    )}
                                    <span className="me-1">
                                        {isSubmitting || fmkSubmitting ? "Guardando..." : "Guardar"}
                                    </span>
                                </SpkButton>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}