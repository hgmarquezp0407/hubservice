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
import ViewPaymentModal from "@/app/components/payments/ViewPaymentModal";
import { IPayments } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    pending   : "warning",
    completed : "success",
    failed    : "danger",
    refunded  : "secondary",
}

export default function Payments() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]               = useState("")
    const [showView, setShowView]           = useState(false)
    const [paymentToView, setPaymentToView] = useState<IPayments | null>(null)

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage, from, to,
        setCurrentPage, fetchItems, fetchItem,
    } = useFetch<IPayments>({ endpoint: `${urlbase}/admin/payments`, itemsPerPage })

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
        setPaymentToView(data)
        setShowView(true)
    }

    return (
        <Fragment>
            <Seo title="Mis Pagos" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Mis Pagos</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar pago..."
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
                                        { title: "Factura" },
                                        { title: "Gateway" },
                                        { title: "TX ID" },
                                        { title: "Monto" },
                                        { title: "Moneda" },
                                        { title: "Estado" },
                                        { title: "F. Pago" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr><td colSpan={9} className="text-center py-4"><i className="ri-loader-2-fill fs-20 me-2" /> Cargando...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-4">Ningún pago registrado.</td></tr>
                                    ) : (
                                        items.map((payment, index) => (
                                            <tr key={payment.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>
                                                    {payment.invoice
                                                        ? <span className="fw-medium text-primary">{payment.invoice.serie}-{String(payment.invoice.voucher_number).padStart(8, "0")}</span>
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td><span className="text-capitalize">{payment.gateway}</span></td>
                                                <td>
                                                    {payment.gateway_tx_id
                                                        ? <span className="font-monospace fs-12">{payment.gateway_tx_id.slice(0, 16)}...</span>
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td><span className="fw-medium">${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></td>
                                                <td>{payment.currency_id}</td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[payment.payment_status_id] ?? "secondary"}-transparent`}>
                                                        {payment.status?.name ?? payment.payment_status_id}
                                                    </span>
                                                </td>
                                                <td>{formatDate(payment.updated_at)}</td>
                                                <td>
                                                    <SpkButton Buttonvariant="info-light" Size="sm" Buttontoggle="tooltip" Title="Ver detalle" onClickfunc={() => handleView(payment.id)}>
                                                        <i className="ri-eye-line"></i>
                                                    </SpkButton>
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

            <ViewPaymentModal
                show={showView}
                onHide={() => setShowView(false)}
                payment={paymentToView}
            />
        </Fragment>
    )
}