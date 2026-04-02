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
import { IRoles, IRole } from "@/app/interfaces/general_interface";
import { toast } from "react-toastify";
import LinkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-linkbutton";
import AssignPermissionsModal from "@/app/components/permissions/AssignPermissionsModal";
import TableHeaderActions from "@/app/components/general/TableHeaderActions";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(4, "Mínimo 4 caracteres")
        .max(100, "Máximo 100 caracteres")
        .matches(/^[a-zA-Z]/, "Debe comenzar con una letra")
        .trim(),
    description: Yup.string()
        .nullable()
        .max(500, "Máximo 500 caracteres")
})

const initialRole: IRole = {
    id:        null,
    name:      "",
    description:  ""
}

export default function Roles() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [show, setShow]   = useState(false)
    const [search, setSearch] = useState("")
    const [role, setRole]  = useState<IRole>(initialRole)
    const [roles, setRoles]     = useState<IRoles[]>([])

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const [showPermissions, setShowPermissions]     = useState(false);
    const [permRoleId, setPermRoleId]               = useState<number | null>(null);
    const [permRoleName, setPermRoleName]           = useState("");
    const handleAssignPermissions = (id: number, name: string) => {
        setPermRoleId(id);
        setPermRoleName(name);
        setShowPermissions(true);
    }

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
        exportToExcel,
    } = useCrud<IRoles>({ endpoint: `${urlbase}/admin/roles`, itemsPerPage })

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
    const handleShowCreate = () => {
        setRole(initialRole)
        setShow(true)
    }

    const handleCloseModal = () => setShow(false)

    const handleEdit = async (id: number) => {
        const data = await fetchItem(id)
        if (!data) return
        setRole({
            id: data.id ?? null,
            name: data.name  ?? "",
            description: data.description ?? ""
        })
        setShow(true)
    }

    const handleSubmit = async (values: IRole, { setSubmitting, resetForm }: any) => {
        const ok = await saveItem(values, () => {
            resetForm()
            setRole(initialRole)
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
            <Seo title="Roles" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Roles</div>

                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input className="form-control form-control-sm" type="text" placeholder="Buscar Rol" value={search} onChange={handleSearchChange}/>
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>

                                {/* {
                                    can("CREATE") && (
                                        <SpkButton Buttonvariant="primary" onClickfunc={handleShowCreate} Size="sm" Customclass="waves-light">
                                            <i className="ri-add-line fw-medium align-middle me-1"></i> Nuevo
                                        </SpkButton>
                                    )
                                }
                                {
                                    can("EXPORT") && (
                                        <SpkButton Buttonvariant="success-light" Size="sm" Buttontoggle="tooltip" data-bs-placement="top" Title="Exportar a Excel" onClickfunc={() => exportToExcel(search)}>
                                            <i className="ri-file-excel-2-line"></i> Exportar
                                        </SpkButton>
                                    )
                                } */}
                                <TableHeaderActions
                                    permissions={permissions}
                                    onNew={handleShowCreate}
                                    onExport={() => exportToExcel(search)}
                                />
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div className="table-responsive">
                                <SpkTablescomponent
                                    tableClass="text-nowrap table-striped table-hover"
                                    header={[
                                        { title: "#" },
                                        { title: "Nombre" },
                                        { title: "Descripción" },
                                        { title: "F. Creación" },
                                        { title: "Estado" },
                                        { title: "Permisos" },
                                        { title: "Acciones" },
                                        // { title: "Acciones", headerClassname: 'text-center' },
                                    ]}
                                >
                                    {/* loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                <i className="ri-loader-2-fill fs-20 me-2" />
                                                Cargando...
                                            </td>
                                        </tr>
                                    ) :  */}
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
                                                <td>{elem.description}</td>
                                                <td>{formatDate(elem.created_at)}</td>
                                                <td><BadgeState state={elem.state} /></td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {can("GRANT_PERMISSION") && (
                                                            <SpkButton
                                                                Buttonvariant="primary3-light"
                                                                Size="sm"
                                                                Buttontoggle="tooltip"
                                                                data-bs-placement="top"
                                                                Title="Asignar permisos"
                                                                onClickfunc={() => handleAssignPermissions(elem.id!, elem.name)}
                                                            >
                                                                <i className="ri-shield-keyhole-line"></i> Asignar
                                                            </SpkButton>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <TableActions
                                                        id={elem.id!}
                                                        stateId={elem.state_id}
                                                        permissions={permissions}
                                                        protected={elem.id === 1}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        onRestore={handleRestore}
                                                    />
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
                <Formik initialValues={role} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting: fmkSubmitting }) => (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Header>
                                <h6 className="modal-title">
                                    {role?.id ? "Editar Rol" : "Agregar Rol"}
                                </h6>
                                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleCloseModal} Buttonlabel="Close"/>
                            </Modal.Header>

                            <Modal.Body>
                                <div className="row gy-2">
                                    <Col xl={12}>
                                        <Form.Label htmlFor="name">
                                            Nombre:<span className="fw-medium text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control type="text" className={`form-control-sm ${errors.name && touched.name ? "is-invalid" : ""}`} name="name" placeholder="Ingrese usuario" value={values.name} onChange={handleChange} onBlur={handleBlur}/>

                                        {errors.name && touched.name && (
                                            <div className="invalid-feedback">{errors.name}</div>
                                        )}
                                    </Col>

                                    <Col xl={12}>
                                        <Form.Label htmlFor="description">Descripción: </Form.Label>
                                        <Form.Control type="text" className={`form-control-sm ${errors.description && touched.description ? "is-invalid" : ""}`} name="description" placeholder="Ingrese descripción" value={values.description} onChange={handleChange} onBlur={handleBlur}/>
                                        
                                        {errors.description && touched.description && (
                                            <div className="invalid-feedback">{errors.description}</div>
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

            <AssignPermissionsModal
                show={showPermissions}
                onHide={() => setShowPermissions(false)}
                roleId={permRoleId}
                roleName={permRoleName}
                urlbase={urlbase}
            />
        </Fragment>
    )
}