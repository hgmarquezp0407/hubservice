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
import EditTicketModal from "@/app/components/tickets/EditTicketModal";
import ViewTicketModal from "@/app/components/tickets/ViewTicketModal";
import { ITickets } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    open           : "primary",
    assigned       : "info",
    in_progress    : "warning",
    pending_review : "secondary",
    resolved       : "success",
    cancelled      : "danger",
}

const PRIORITY_COLORS: Record<number, string> = {
    1: "success",
    2: "warning",
    3: "danger",
    4: "danger",
    5: "danger",
}

export default function Tickets() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch] = useState("")

    const [showEdit, setShowEdit]         = useState(false)
    const [showView, setShowView]         = useState(false)
    const [ticketToEdit, setTicketToEdit] = useState<ITickets | null>(null)
    const [ticketToView, setTicketToView] = useState<ITickets | null>(null)

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
    } = useFetch<ITickets>({ endpoint: `${urlbase}/admin/tickets`, itemsPerPage })

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
        setTicketToView(data)
        setShowView(true)
    }

    return (
        <Fragment>
            <Seo title="Tickets" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Mis Tickets</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar ticket..."
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
                                        { title: "N° Ticket" },
                                        { title: "Título" },
                                        { title: "Empresa" },
                                        { title: "Servicio" },
                                        { title: "País" },
                                        { title: "Prioridad" },
                                        { title: "Estado" },
                                        { title: "Especialista" },
                                        { title: "Presupuesto" },
                                        { title: "F. Creación" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {loading ? (
                                        <tr>
                                            <td colSpan={12} className="text-center py-4">
                                                <i className="ri-loader-2-fill fs-20 me-2" /> Cargando...
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="text-center py-4">
                                                Ningún dato para mostrar.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((ticket, index) => (
                                            <tr key={ticket.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td><span className="fw-medium text-primary">{ticket.ticket_number}</span></td>
                                                <td>
                                                    <div style={{ maxWidth: 200 }} className="text-truncate" title={ticket.title}>
                                                        {ticket.title}
                                                    </div>
                                                </td>
                                                <td>{ticket.company?.name ?? "—"}</td>
                                                <td>
                                                    <div style={{ maxWidth: 160 }} className="text-truncate" title={ticket.service?.name}>
                                                        {ticket.service?.name ?? "—"}
                                                    </div>
                                                </td>
                                                <td>{ticket.country?.name ?? "—"}</td>
                                                <td>
                                                    <span className={`badge bg-${PRIORITY_COLORS[ticket.ticket_priority_id] ?? "secondary"}-transparent`}>
                                                        {ticket.priority?.name ?? "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[ticket.ticket_status_id] ?? "secondary"}-transparent`}>
                                                        {ticket.status?.name ?? "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {ticket.specialist
                                                        ? `${ticket.specialist.person?.first_name ?? ""} ${ticket.specialist.person?.last_name ?? ""}`.trim()
                                                        : <span className="text-muted">Sin asignar</span>
                                                    }
                                                </td>
                                                <td>
                                                    {ticket.budget_usd != null
                                                        ? <span className="fw-medium">${ticket.budget_usd.toLocaleString()}</span>
                                                        : <span className="text-muted">Abierto</span>
                                                    }
                                                </td>
                                                <td>{formatDate(ticket.created_at)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <SpkButton Buttonvariant="info-light" Size="sm" Buttontoggle="tooltip" Title="Ver detalle" onClickfunc={() => handleView(ticket.id)}>
                                                            <i className="ri-eye-line"></i>
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

            <ViewTicketModal
                show={showView}
                onHide={() => setShowView(false)}
                ticket={ticketToView}
            />
        </Fragment>
    )
}