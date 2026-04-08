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
import { formatDate, formatDateTime12Hour } from "@/utils/validators";
import { toast } from "react-toastify";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import ViewSaleModal from "@/app/components/sales/ViewSaleModal";
import SunatInfoModal from "@/app/components/sales/SunatInfoModal";
import { IInvoices } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    registered : "secondary",
    pending    : "warning",
    sended     : "info",
    accepted   : "success",
    observed   : "warning",
    rejected   : "danger",
    paid       : "primary",
    annuled    : "danger",
}

export default function Invoices() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]                   = useState("")
    const [showView, setShowView]               = useState(false)
    const [showSunat, setShowSunat]             = useState(false)
    const [invoiceToView, setInvoiceToView]     = useState<IInvoices | null>(null)
    const [invoiceForSunat, setInvoiceForSunat] = useState<IInvoices | null>(null)
    const [paying, setPaying]                   = useState<string | null>(null)

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage, from, to,
        setCurrentPage, fetchItems, fetchItem,
    } = useFetch<IInvoices>({ endpoint: `${urlbase}/admin/invoices`, itemsPerPage })

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
        setInvoiceToView(data)
        setShowView(true)
    }

    const handleSunatInfo = async (id: string) => {
        const data = await fetchItem(id)
        if (!data) return
        setInvoiceForSunat(data)
        setShowSunat(true)
    }

    const handlePay = async (id: string) => {
        setPaying(id)
        try {
            const data = await apiFetch(`${urlbase}/admin/stripe/create-checkout-session?invoice_id=${id}`, {
                method: "POST",
            })
            window.location.href = data.session_url
        } catch (err: any) {
            toast.error(err.message || "Error al iniciar el pago.")
            setPaying(null)
        }
    }

    const voucherLabel = (invoice: IInvoices) =>
        invoice.serie && invoice.voucher_number
            ? `${invoice.serie}-${String(invoice.voucher_number).padStart(8, "0")}`
            : "—"

    return (
        <Fragment>
            <Seo title="Mis Facturas" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Mis Facturas</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar factura..."
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
                                        { title: "Comprobante" },
                                        { title: "Subtotal" },
                                        { title: "IGV" },
                                        { title: "Total" },
                                        { title: "Estado" },
                                        { title: "F. Emisión" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr><td colSpan={8} className="text-center py-4"><i className="ri-loader-2-fill fs-20 me-2" /> Cargando...</td></tr>
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-4">Ningún dato para mostrar.</td></tr>
                                    ) : (
                                        items.map((invoice, index) => (
                                            <tr key={invoice.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td><span className="fw-medium text-primary">{voucherLabel(invoice)}</span></td>
                                                <td><span className="fw-medium">${invoice.subtotal.toLocaleString()}</span></td>
                                                <td>
                                                    {invoice.igv > 0
                                                        ? <span className="fw-medium">${invoice.igv.toLocaleString()}</span>
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td><span className="fw-medium">${invoice.total.toLocaleString()}</span></td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[invoice.invoice_status_id] ?? "secondary"}-transparent`}>
                                                        {invoice.status?.name ?? "—"}
                                                    </span>
                                                </td>
                                                <td>{formatDateTime12Hour(invoice.created_at)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Link href={`/company/invoices/detail?id=${invoice.id}`} className="btn btn-info-light btn-sm" title="Ver detalle">
                                                            <i className="ri-eye-line"></i>
                                                        </Link>
                                                        {invoice.xml_path && (
                                                            <a href={invoice.xml_path} target="_blank" rel="noopener noreferrer" className="btn btn-success-light btn-sm" title="Descargar XML">
                                                                <i className="ri-file-code-line"></i>
                                                            </a>
                                                        )}
                                                        {invoice.url_file && (
                                                            <a href={invoice.url_file} target="_blank" rel="noopener noreferrer" className="btn btn-danger-light btn-sm" title="Descargar PDF">
                                                                <i className="ri-file-pdf-2-line"></i>
                                                            </a>
                                                        )}
                                                        {invoice.cdr_path && (
                                                            <a href={invoice.cdr_path} target="_blank" rel="noopener noreferrer" className="btn btn-warning-light btn-sm" title="Descargar CDR">
                                                                <i className="ri-file-zip-line"></i>
                                                            </a>
                                                        )}
                                                        {!["registered", "pending"].includes(invoice.invoice_status_id) && (
                                                            <SpkButton Buttonvariant="secondary-light" Size="sm" Buttontoggle="tooltip" Title="Info SUNAT" onClickfunc={() => handleSunatInfo(invoice.id)}>
                                                                <i className="ri-government-line"></i>
                                                            </SpkButton>
                                                        )}
                                                        {invoice.invoice_status_id === "accepted" && (
                                                            <SpkButton Buttonvariant="primary" Size="sm" Buttontoggle="tooltip" Title="Pagar con Stripe"
                                                                Disabled={paying === invoice.id} onClickfunc={() => handlePay(invoice.id)}>
                                                                {paying === invoice.id
                                                                    ? <span className="spinner-border spinner-border-sm" />
                                                                    : <><i className="ri-bank-card-line me-1"></i>Pagar</>
                                                                }
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

            <ViewSaleModal
                show={showView}
                onHide={() => setShowView(false)}
                invoice={invoiceToView}
            />

            <SunatInfoModal
                show={showSunat}
                onHide={() => setShowSunat(false)}
                invoice={invoiceForSunat}
            />
        </Fragment>
    )
}