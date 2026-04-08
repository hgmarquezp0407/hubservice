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
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import ViewBidModal from "@/app/components/bids/ViewBidModal";
import EditBidModal from "@/app/components/bids/EditBidModal";
import { IBids } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    pending  : "warning",
    accepted : "success",
    rejected : "danger",
    withdrawn: "secondary",
}

export default function Bids() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]         = useState("")
    const [showView, setShowView]     = useState(false)
    const [bidToView, setBidToView]   = useState<IBids | null>(null)
    const [showEdit, setShowEdit]     = useState(false)
    const [bidToEdit, setBidToEdit]   = useState<IBids | null>(null)
    const [withdrawing, setWithdrawing] = useState<string | null>(null)

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage, from, to,
        setCurrentPage, fetchItems, fetchItem, deleteItem,
    } = useFetch<IBids>({ endpoint: `${urlbase}/admin/bids`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search)
    }, [user, currentPage])

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

    const handleView = async (id: string) => {
        const data = await fetchItem(id)
        if (!data) return
        setBidToView(data)
        setShowView(true)
    }

    const handleEdit = async (id: string) => {
        const data = await fetchItem(id)
        if (!data) return
        setBidToEdit(data)
        setShowEdit(true)
    }

    const handleWithdraw = async (id: string) => {
        const result = await Swal.fire({
            title             : "¿Retirar propuesta?",
            text              : "Esta acción no se puede deshacer.",
            icon              : "warning",
            showCancelButton  : true,
            confirmButtonColor: "#d33",
            cancelButtonColor : "#6c757d",
            confirmButtonText : "Sí, retirar",
            cancelButtonText  : "Cancelar",
        })
        if (!result.isConfirmed) return
        setWithdrawing(id)
        try {
            await apiFetch(`${urlbase}/admin/bids/${id}`, { method: "DELETE" })
            toast.success("Propuesta retirada correctamente.")
            fetchItems(currentPage, search)
        } catch (err: any) {
            toast.error(err.message || "Error al retirar la propuesta.")
        } finally {
            setWithdrawing(null)
        }
    }

    const handleSuccess = () => fetchItems(currentPage, search)

    return (
        <Fragment>
            <Seo title="Mis Propuestas" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Mis Propuestas</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar propuesta..."
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
                                        { title: "Ticket" },
                                        { title: "Precio propuesto" },
                                        { title: "Horas estimadas" },
                                        { title: "Vence" },
                                        { title: "Estado" },
                                        { title: "F. Creación" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr><td colSpan={8} className="text-center py-4"><i className="ri-loader-2-fill fs-20 me-2" /> Cargando...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-4">Ningún dato para mostrar.</td></tr>
                                    ) : (
                                        items.map((bid, index) => (
                                            <tr key={bid.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>
                                                    <div style={{ maxWidth: 200 }}>
                                                        <div className="fw-medium text-primary">{bid.ticket?.ticket_number ?? "—"}</div>
                                                        <div className="text-muted fs-12 text-truncate" title={bid.ticket?.title}>{bid.ticket?.title ?? ""}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-medium">
                                                        ${bid.proposed_price_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>
                                                    {bid.estimated_hours != null
                                                        ? `${bid.estimated_hours} h`
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td>
                                                    {bid.expires_at
                                                        ? formatDate(bid.expires_at)
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[bid.bid_status_id] ?? "secondary"}-transparent`}>
                                                        {bid.status?.name ?? bid.bid_status_id}
                                                    </span>
                                                </td>
                                                <td>{formatDate(bid.created_at)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <SpkButton Buttonvariant="info-light" Size="sm" Buttontoggle="tooltip" Title="Ver detalle" onClickfunc={() => handleView(bid.id)}>
                                                            <i className="ri-eye-line"></i>
                                                        </SpkButton>
                                                        {bid.bid_status_id === "pending" && (
                                                            <>
                                                                <SpkButton Buttonvariant="primary-light" Size="sm" Buttontoggle="tooltip" Title="Editar" onClickfunc={() => handleEdit(bid.id)}>
                                                                    <i className="ri-edit-line"></i>
                                                                </SpkButton>
                                                                <SpkButton
                                                                    Buttonvariant="danger-light"
                                                                    Size="sm"
                                                                    Customclass="btn-icon"
                                                                    Buttontoggle="tooltip"
                                                                    Title="Retirar propuesta"
                                                                    Disabled={withdrawing === bid.id}
                                                                    onClickfunc={() => handleWithdraw(bid.id)}
                                                                >
                                                                    {withdrawing === bid.id
                                                                        ? <span className="spinner-border spinner-border-sm" />
                                                                        : <i className="ri-arrow-go-back-line"></i>
                                                                    }
                                                                </SpkButton>
                                                            </>
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

            <ViewBidModal
                show={showView}
                onHide={() => setShowView(false)}
                bid={bidToView}
            />

            <EditBidModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                onSuccess={handleSuccess}
                bid={bidToEdit}
                urlbase={urlbase}
            />
        </Fragment>
    )
}