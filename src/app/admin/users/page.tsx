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
import TableActions from "@/app/components/general/TableActions";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { useCrud } from "@/app/hooks/useCrud";
import { apiFetch } from "@/utils/api";
import { formatDate } from "@/utils/validators";
import { IUsers, IUser, SelectOption } from "@/app/interfaces/general_interface";
import { toast } from "react-toastify";

const validationSchema = Yup.object().shape({
    person_id: Yup.string()
        .required("La persona es obligatoria"),
    role_id:   Yup.string()
        .required("El rol es obligatorio"),
    username: Yup.string()
        .required("El usuario es obligatorio")
        .min(4, "Mínimo 4 caracteres")
        .max(50, "Máximo 50 caracteres")
        .matches(/^[a-zA-Z0-9._-]+$/, "Solo letras, números, puntos, guiones y guiones bajos")
        .matches(/^[a-zA-Z]/, "Debe comenzar con una letra")
        .trim(),
    password: Yup.string()
        .nullable()
        .min(8, "Mínimo 8 caracteres")
        .max(30, "Máximo 30 caracteres")
        .matches(/[a-z]/, "Debe contener al menos una minúscula")
        .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
        .matches(/[0-9]/, "Debe contener al menos un número")
        .matches(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial")
        .matches(/^\S*$/, "No debe contener espacios"),
})

const initialUser: IUser = {
    id:        null,
    person_id: null,
    role_id:   null,
    username:  "",
    password:  "",
}

export default function Users() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [show, setShow]   = useState(false)
    const [search, setSearch] = useState("")
    const [userr, setUser]  = useState<IUser>(initialUser)
    const [persons, setPersons] = useState<SelectOption[]>([])
    const [roles, setRoles]     = useState<SelectOption[]>([])

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
    } = useCrud<IUsers>({ endpoint: `${urlbase}/admin/users`, itemsPerPage })

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

    // Opciones de selects (se cargan al abrir el modal)
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
            fetchSelectOptions(`${urlbase}/admin/persons/list`, setPersons, controller.signal),
            fetchSelectOptions(`${urlbase}/admin/roles/list`, setRoles, controller.signal),
        ])
        return () => controller.abort()
    }, [show, urlbase])

    // Handlers
    const handleShow = () => {
        setUser(initialUser)
        setShow(true)
    }

    const handleCloseModal = () => setShow(false)

    const handleEdit = async (id: number) => {
        const data = await fetchItem(id)
        if (!data) return
        setUser({
            id:        data.id        ?? null,
            person_id: data.id ?? null,
            role_id:   (data as any).role_id   ?? null,
            username:  (data as any).username  ?? "",
            password:  "",
        })
        setShow(true)
    }

    const handleSubmit = async (values: IUser, { setSubmitting, resetForm }: any) => {
        const ok = await saveItem(values, () => {
            resetForm()
            setUser(initialUser)
            setShow(false)
            fetchItems(currentPage, search)
        })
        if (!ok) setSubmitting(false)
    }

    const handleDelete = (id: number) => {
        deleteItem(id, () => fetchItems(currentPage, search))
    }

    const handleRestore = (id: number) => {
        restoreItem(id, () => fetchItems(currentPage, search))
    }

    return (
        <Fragment>
            <Seo title="Usuarios" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Usuarios</div>

                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar Usuario"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>

                                <SpkButton Buttonvariant="primary" onClickfunc={handleShow} Size="sm" Customclass="waves-light">
                                    <i className="ri-add-line fw-medium align-middle me-1"></i> Nuevo
                                </SpkButton>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div className="table-responsive">
                                <SpkTablescomponent
                                    tableClass="text-nowrap table-striped table-hover"
                                    header={[
                                        { title: "#" },
                                        { title: "Nombres" },
                                        { title: "Apellidos" },
                                        { title: "Email" },
                                        { title: "Usuario" },
                                        { title: "Rol" },
                                        { title: "F. Creación" },
                                        { title: "Estado" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-4">
                                                <i className="ri-loader-2-fill fs-20 me-2" />
                                                Cargando...
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-4">
                                                Ningún dato para mostrar.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((elem, index) => (
                                            <tr className="task-list" key={elem.id ?? index}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>{elem.person.first_name}</td>
                                                <td>{elem.person.last_name}</td>
                                                <td>{elem.person.email}</td>
                                                <td>{elem.username}</td>
                                                <td>{elem.role.name}</td>
                                                <td>{formatDate(elem.created_at)}</td>
                                                <td>
                                                    {elem.state == 1 ? (
                                                        <span className="badge bg-success-transparent">Activo</span>
                                                    ) : (
                                                        <span className="badge bg-danger-transparent">Eliminado</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {
                                                            elem.state === 1 ? (
                                                                <>
                                                                    <SpkButton Buttonvariant="primary-light" Size="sm" Buttontoggle="tooltip" data-bs-placement="top" Title="Editar" onClickfunc={() => handleEdit(elem.id)}>
                                                                        <i className="ri-edit-line"></i>
                                                                    </SpkButton>
                                                                    <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon ms-1 task-delete-btn" Buttontoggle="tooltip" data-bs-placement="top" Title="Eliminar" onClickfunc={() => handleDelete(elem.id)}>
                                                                        <i className="ri-delete-bin-5-line"></i>
                                                                    </SpkButton>
                                                                </>
                                                            ) : (
                                                                <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon ms-1 task-delete-btn" Buttontoggle="tooltip" data-bs-placement="top" Title="Restaurar" onClickfunc={() => handleRestore(elem.id)}>
                                                                    <i className="ri-refresh-line"></i>
                                                                </SpkButton>
                                                            )
                                                        }
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
                <Formik
                    initialValues={userr}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting: fmkSubmitting }) => (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Header>
                                <h6 className="modal-title">
                                    {userr?.id ? "Editar Usuario" : "Agregar Usuario"}
                                </h6>
                                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleCloseModal} Buttonlabel="Close"/>
                            </Modal.Header>

                            <Modal.Body>
                                <div className="row gy-2">
                                    <Col sm={12}>
                                        <Form.Label htmlFor="person_id">
                                            Persona:<span className="fw-medium text-danger">*</span>
                                        </Form.Label>
                                        <SpkSelectFormik name="person_id" option={persons} getValue={values.person_id} placeholder="Seleccionar persona..." />

                                        {errors.person_id && touched.person_id && (
                                            <div className="invalid-feedback d-block">{errors.person_id}</div>
                                        )}
                                    </Col>

                                    <Col sm={12}>
                                        <Form.Label htmlFor="role_id">
                                            Rol:<span className="fw-medium text-danger">*</span>
                                        </Form.Label>
                                        <SpkSelectFormik name="role_id" option={roles} getValue={values.role_id} placeholder="Seleccionar rol..." />

                                        {errors.role_id && touched.role_id && (
                                            <div className="invalid-feedback d-block">{errors.role_id}</div>
                                        )}
                                    </Col>

                                    <Col xl={12}>
                                        <Form.Label htmlFor="username">
                                            Usuario:<span className="fw-medium text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control type="text" className={`form-control-sm ${errors.username && touched.username ? "is-invalid" : ""}`} name="username" placeholder="Ingrese usuario" value={values.username} onChange={handleChange} onBlur={handleBlur} />

                                        {errors.username && touched.username && (
                                            <div className="invalid-feedback">{errors.username}</div>
                                        )}
                                    </Col>

                                    <Col xl={12}>
                                        <Form.Label htmlFor="password">
                                            Password:
                                            {!userr?.id && <span className="fw-medium text-danger">*</span>}
                                            {userr?.id && (
                                                <span className="text-muted fs-11 ms-1">(dejar vacío para no cambiar)</span>
                                            )}
                                        </Form.Label>
                                        <Form.Control type="password" className={`form-control-sm ${errors.password && touched.password ? "is-invalid" : ""}`} name="password"  placeholder={userr?.id ? "Nueva contraseña (opcional)" : "Ingrese contraseña"} value={values.password ?? ""} onChange={handleChange} onBlur={handleBlur} />

                                        {errors.password && touched.password && (
                                            <div className="invalid-feedback">{errors.password}</div>
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