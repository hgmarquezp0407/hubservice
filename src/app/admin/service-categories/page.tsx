"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTablescomponent from "@/app/components/@spk-reusable/reusable-tables/tables-component";
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { debounce } from "lodash";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import EditServiceCategoryModal from "@/app/components/service-categories/EditServiceCategoryModal";
import { IServiceCategories } from "@/app/interfaces/general_interface";
import { useCrud } from "@/app/hooks/useCrud";

export default function ServiceCategories() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]                     = useState("")
    const [showEdit, setShowEdit]                 = useState(false)
    const [categoryToEdit, setCategoryToEdit]     = useState<IServiceCategories | null>(null)

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage, from, to,
        setCurrentPage, fetchItems, fetchItem, deleteItem, restoreItem,
    } = useCrud<IServiceCategories>({ endpoint: `${urlbase}/admin/service-categories`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search)
    }, [user, currentPage])

    const debouncedSearch = useCallback(
        debounce((term: string) => { setCurrentPage(1); fetchItems(1, term) }, 200), []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        debouncedSearch(e.target.value)
    }

    const handleNew = () => { setCategoryToEdit(null); setShowEdit(true) }

    const handleEdit = async (id: number) => {
        const data = await fetchItem(id)
        if (!data) return
        setCategoryToEdit(data)
        setShowEdit(true)
    }

    const handleDelete = (id: number) => deleteItem(id, () => fetchItems(currentPage, search))

    const handleRestore = (id: number) => restoreItem(id, () => fetchItems(currentPage, search))

    const handleSuccess = () => fetchItems(currentPage, search)

    return (
        <Fragment>
            <Seo title="Categorías de Servicios" />
            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Categorías de Servicios</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input className="form-control form-control-sm" type="text" placeholder="Buscar categoría..." value={search} onChange={handleSearchChange} />
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>
                                <SpkButton Buttonvariant="primary" Size="sm" Customclass="waves-light" onClickfunc={handleNew}>
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
                                        { title: "Nombre" },
                                        { title: "Slug" },
                                        { title: "Ícono" },
                                        { title: "Orden" },
                                        { title: "Estado" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr><td colSpan={7} className="text-center py-4"><i className="ri-loader-2-fill fs-20 me-2" />Cargando...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-4">Ningún dato para mostrar.</td></tr>
                                    ) : (
                                        items.map((cat, index) => (
                                            <tr key={cat.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td><span className="fw-medium">{cat.name}</span></td>
                                                <td><span className="text-muted fs-12">{cat.slug}</span></td>
                                                <td><span className="badge bg-light text-dark"><i className={`ri-${cat.icon}-line me-1`} />{cat.icon ?? "—"}</span></td>
                                                <td>{cat.sort_order}</td>
                                                <td>
                                                    {cat.state === 1
                                                        ? <span className="badge bg-success-transparent">Activo</span>
                                                        : <span className="badge bg-danger-transparent">Inactivo</span>}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        {cat.state === 1 ? (
                                                            <>
                                                                <SpkButton Buttonvariant="primary-light" Size="sm" Buttontoggle="tooltip" Title="Editar" onClickfunc={() => handleEdit(cat.id)}>
                                                                    <i className="ri-edit-line"></i>
                                                                </SpkButton>
                                                                <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Eliminar" onClickfunc={() => handleDelete(cat.id)}>
                                                                    <i className="ri-delete-bin-5-line"></i>
                                                                </SpkButton>
                                                            </>
                                                        ) : (
                                                            <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Restaurar" onClickfunc={() => handleRestore(cat.id)}>
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

            <EditServiceCategoryModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                onSuccess={handleSuccess}
                category={categoryToEdit}
                urlbase={urlbase}
            />
        </Fragment>
    )
}