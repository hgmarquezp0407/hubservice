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
import { formatDate } from "@/utils/validators";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import ViewPayoutModal from "@/app/components/payouts/ViewPayoutModal";
import { IPayouts } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    pending    : "warning",
    processing : "info",
    completed  : "success",
    failed     : "danger",
}

export default function Payouts() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]           = useState("")
    const [showView, setShowView]       = useState(false)
    const [payoutToView, setPayoutToView] = useState<IPayouts | null>(null)

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage, from, to,
        setCurrentPage, fetchItems, fetchItem, deleteItem,
    } = useFetch<IPayouts>({ endpoint: `${urlbase}/admin/payouts`, itemsPerPage })

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
        setPayoutToView(data)
        setShowView(true)
    }

    const handleDelete = (id: string) => {
        deleteItem(id, () => fetchItems(currentPage, search))
    }

    return (
        <Fragment>
            <Seo title="Liquidaciones" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Liquidaciones</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input className="form-control form-control-sm" type="text" placeholder="Buscar liquidación..." value={search} onChange={handleSearchChange} />
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
                                        { title: "Especialista" },
                                        { title: "Monto bruto" },
                                        { title: "Comisión" },
                                        { title: "Retención" },
                                        { title: "Neto a pagar" },
                                        { title: "Gateway" },
                                        { title: "Estado" },
                                        { title: "Fecha pago" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr><td colSpan={10} className="text-center py-4"><i className="ri-loader-2-fill fs-20 me-2" /> Cargando...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={10} className="text-center py-4">Ningún dato para mostrar.</td></tr>
                                    ) : (
                                        items.map((payout, index) => (
                                            <tr key={payout.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>
                                                    {payout.specialist
                                                        ? `${payout.specialist.person?.first_name ?? ""} ${payout.specialist.person?.last_name ?? ""}`.trim()
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td><span className="fw-medium">${payout.gross_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></td>
                                                <td><span className="text-danger">-${payout.platform_fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></td>
                                                <td>
                                                    {payout.retention_usd > 0
                                                        ? <span className="text-warning">-${payout.retention_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td>
                                                    <span className="fw-medium text-success">
                                                        ${(payout.net_after_retention ?? payout.net_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>{payout.gateway ?? <span className="text-muted">—</span>}</td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[payout.payout_status_id] ?? "secondary"}-transparent`}>
                                                        {payout.status?.name ?? payout.payout_status_id}
                                                    </span>
                                                </td>
                                                <td>{payout.paid_at ? formatDate(payout.paid_at) : <span className="text-muted">—</span>}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <SpkButton Buttonvariant="info-light" Size="sm" Buttontoggle="tooltip" Title="Ver detalle" onClickfunc={() => handleView(payout.id)}>
                                                            <i className="ri-eye-line"></i>
                                                        </SpkButton>
                                                        <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon" Buttontoggle="tooltip" Title="Eliminar" onClickfunc={() => handleDelete(payout.id)}>
                                                            <i className="ri-delete-bin-5-line"></i>
                                                        </SpkButton>
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

            <ViewPayoutModal show={showView} onHide={() => setShowView(false)} payout={payoutToView} />
        </Fragment>
    )
}