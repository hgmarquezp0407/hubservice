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
import { useFetch } from "@/app/hooks/useFetch";
import { apiFetch } from "@/utils/api";
import { formatDate } from "@/utils/validators";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import ViewOrderModal from "@/app/components/orders/ViewOrderModal";
import { IOrders } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    draft          : "secondary",
    pending_review : "warning",
    approved       : "success",
    disputed       : "danger",
    cancelled      : "danger",
}

export default function Orders() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch] = useState("")

    const [showView, setShowView]         = useState(false)
    const [orderToView, setOrderToView]   = useState<IOrders | null>(null)

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items,
        loading,
        total,
        totalPages,
        currentPage,
        from,
        to,
        setCurrentPage,
        fetchItems,
        fetchItem,
    } = useFetch<IOrders>({ endpoint: `${urlbase}/admin/orders`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search)
    }, [user, currentPage])

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

    const handleView = async (id: string) => {
        const data = await fetchItem(id)
        if (!data) return
        setOrderToView(data)
        setShowView(true)
    }

    const handleConfirm = async (id: string) => {
        const result = await Swal.fire({
            title             : "¿Confirmar orden?",
            text              : "Se aprobará la orden y se generará la factura automáticamente.",
            icon              : "question",
            showCancelButton  : true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor : "#d33",
            confirmButtonText : "Sí, confirmar",
            cancelButtonText  : "Cancelar",
        })
        if (!result.isConfirmed) return
        try {
            const data = await apiFetch(`${urlbase}/admin/orders/${id}/confirm`, { method: "POST" })
            await Swal.fire("¡Confirmada!", data.message || "Orden confirmada correctamente.", "success")
            fetchItems(currentPage, search)
        } catch (err: any) {
            toast.error(err.message || "Error al confirmar la orden.")
        }
    }

    return (
        <Fragment>
            <Seo title="Órdenes" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Órdenes</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar orden..."
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div className="table-responsive">
                                <SpkTablescomponent
                                    tableClass="text-nowrap table-striped table-hover"
                                    header={[
                                        { title: "#" },
                                        { title: "N° Orden" },
                                        { title: "Empresa" },
                                        { title: "Especialista" },
                                        { title: "Subtotal" },
                                        { title: "IGV" },
                                        { title: "Total" },
                                        { title: "Comisión" },
                                        { title: "Estado" },
                                        { title: "F. Creación" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-4">
                                                <i className="ri-loader-2-fill fs-20 me-2" /> Cargando...
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-4">
                                                Ningún dato para mostrar.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((order, index) => (
                                            <tr key={order.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td><span className="fw-medium text-primary">{order.order_number}</span></td>
                                                <td>{order.company?.name ?? "—"}</td>
                                                <td>
                                                    {order.specialist?.person
                                                        ? `${order.specialist.person.first_name ?? ""} ${order.specialist.person.last_name ?? ""}`.trim()
                                                        : "—"
                                                    }
                                                </td>
                                                <td><span className="fw-medium">${order.subtotal.toLocaleString()}</span></td>
                                                <td>
                                                    {order.igv > 0
                                                        ? <span className="fw-medium">${order.igv.toLocaleString()}</span>
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td><span className="fw-medium">${order.total.toLocaleString()}</span></td>
                                                <td><span className="fw-medium">${order.platform_fee.toLocaleString()}</span></td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[order.order_status_id] ?? "secondary"}-transparent`}>
                                                        {order.status?.name ?? "—"}
                                                    </span>
                                                </td>
                                                <td>{formatDate(order.created_at)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <SpkButton Buttonvariant="info-light" Size="sm" Buttontoggle="tooltip" Title="Ver detalle" onClickfunc={() => handleView(order.id)}>
                                                            <i className="ri-eye-line"></i>
                                                        </SpkButton>
                                                        {order.order_status_id === "pending_review" && (
                                                            <SpkButton Buttonvariant="success-light" Size="sm" Buttontoggle="tooltip" Title="Confirmar orden" onClickfunc={() => handleConfirm(order.id)}>
                                                                <i className="ri-check-double-line"></i>
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
                                        Mostrando {from} a {to} de {total} registros
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="ms-auto">
                                            <PaginatorCentered
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

            <ViewOrderModal
                show={showView}
                onHide={() => setShowView(false)}
                order={orderToView}
            />
        </Fragment>
    )
}