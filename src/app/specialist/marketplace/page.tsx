"use client";

import SpkBadge from "@/app/components/@spk-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
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
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";
import CreateBidModal from "@/app/components/bids/CreateBidModal";
import { ITickets } from "@/app/interfaces/general_interface";

const PRIORITY_COLORS: Record<number, string> = {
    1: "success",
    2: "warning",
    3: "danger",
    4: "danger",
    5: "danger",
}

export default function Marketplace() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]                     = useState("")
    const [selectedCountry, setSelectedCountry]   = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string[]>([])
    const [selectedPriority, setSelectedPriority] = useState<number[]>([])
    const [openCountries, setOpenCountries]       = useState(false)
    const [openCategories, setOpenCategories]     = useState(false)

    const [countries, setCountries]               = useState<{ id: string; name: string }[]>([])
    const [serviceCategories, setServiceCategories] = useState<{ id: string; name: string }[]>([])

    const [showBid, setShowBid]         = useState(false)
    const [ticketToBid, setTicketToBid] = useState<ITickets | null>(null)

    const PRIORITIES = [
        { id: 1, label: "Baja" },
        { id: 2, label: "Media" },
        { id: 3, label: "Alta" },
        { id: 4, label: "Urgente" },
        { id: 5, label: "Crítica" },
    ]

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items, loading, total, totalPages, currentPage,
        setCurrentPage, fetchItems,
    } = useFetch<ITickets>({ endpoint: `${urlbase}/admin/tickets/marketplace`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        const controller = new AbortController()
        Promise.all([
            apiFetch(`${urlbase}/admin/countries`, { signal: controller.signal }),
            apiFetch(`${urlbase}/admin/service-categories/list`, { signal: controller.signal }),
        ]).then(([countriesData, categoriesData]) => {
            setCountries(countriesData)
            setServiceCategories(categoriesData)
        }).catch(() => {})
        return () => controller.abort()
    }, [user])

    const buildExtraParams = useCallback((): Record<string, string> => {
        const params: Record<string, string> = {}
        if (selectedCountry)                params.country_id = selectedCountry
        if (selectedCategory.length === 1)  params.service_category_id = selectedCategory[0]
        if (selectedPriority.length === 1)  params.ticket_priority_id = String(selectedPriority[0])
        return params
    }, [selectedCountry, selectedCategory, selectedPriority])

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search, buildExtraParams())
    }, [user, currentPage, selectedCountry, selectedCategory, selectedPriority])

    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setCurrentPage(1)
            fetchItems(1, term, buildExtraParams())
        }, 200),
        [buildExtraParams]
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        debouncedSearch(e.target.value)
    }

    const handlePostular = (ticket: ITickets) => {
        setTicketToBid(ticket)
        setShowBid(true)
    }

    const handleSuccess = () => {
        toast.success("Propuesta enviada correctamente.")
        fetchItems(currentPage, search, buildExtraParams())
    }

    const toggleCategory = (id: string) => {
        setSelectedCategory(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
    }

    const togglePriority = (id: number) => {
        setSelectedPriority(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
    }

    const visibleCountries  = openCountries  ? countries         : countries.slice(0, 4)
    const visibleCategories = openCategories ? serviceCategories : serviceCategories.slice(0, 3)

    return (
        <Fragment>
            <Seo title="Marketplace" />

            <Row>
                {/* Filtros */}
                <Col xxl={3} xl={4}>
                    <Card className="custom-card products-navigation-card">
                        <Card.Body className="p-0">

                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">País</h6>
                                <div className="py-3 pb-0">
                                    <div className="form-check mb-2">
                                        <input className="form-check-input me-2" type="radio" name="country" id="country-all" checked={selectedCountry === null} onChange={() => setSelectedCountry(null)} />
                                        <label className="form-check-label" htmlFor="country-all">Todos</label>
                                    </div>
                                    {visibleCountries.map(c => (
                                        <div className="form-check mb-2" key={c.id}>
                                            <input className="form-check-input me-2" type="radio" name="country" id={`country-${c.id}`} checked={selectedCountry === c.id} onChange={() => setSelectedCountry(c.id)} />
                                            <label className="form-check-label" htmlFor={`country-${c.id}`}>{c.name}</label>
                                        </div>
                                    ))}
                                    {countries.length > 4 && (
                                        <Link className="ecommerce-more-link" onClick={() => setOpenCountries(!openCountries)} href="#!" scroll={false} role="button">
                                            {openCountries ? "MENOS" : "MÁS"}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">Categoría</h6>
                                <div className="py-3 pb-0">
                                    {visibleCategories.map(c => (
                                        <div className="form-check mb-2" key={c.id}>
                                            <input className="form-check-input me-2" type="checkbox" id={`cat-${c.id}`} checked={selectedCategory.includes(String(c.id))} onChange={() => toggleCategory(String(c.id))} />
                                            <label className="form-check-label" htmlFor={`cat-${c.id}`}>{c.name}</label>
                                        </div>
                                    ))}
                                    {serviceCategories.length > 3 && (
                                        <Link className="ecommerce-more-link" onClick={() => setOpenCategories(!openCategories)} href="#!" scroll={false} role="button">
                                            {openCategories ? "MENOS" : "MÁS"}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">Prioridad</h6>
                                <div className="py-3 pb-0">
                                    {PRIORITIES.map(p => (
                                        <div className="form-check mb-2" key={p.id}>
                                            <input className="form-check-input me-2" type="checkbox" id={`priority-${p.id}`} checked={selectedPriority.includes(p.id)} onChange={() => togglePriority(p.id)} />
                                            <label className="form-check-label" htmlFor={`priority-${p.id}`}>{p.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                {/* Cards */}
                <Col xxl={9} xl={8}>
                    <Card className="custom-card mb-3">
                        <Card.Body className="py-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="fs-15">
                                    <span className="fw-semibold">{total}</span>{" "}
                                    <span className="text-muted">ticket{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}</span>
                                </div>
                                <div style={{ maxWidth: 380, width: "100%" }}>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="ti ti-search text-muted"></i>
                                        </span>
                                        <input
                                            className="form-control border-start-0 bg-light"
                                            type="text"
                                            placeholder="Buscar por título, empresa, número..."
                                            value={search}
                                            onChange={handleSearchChange}
                                            style={{ boxShadow: "none" }}
                                        />
                                        {search && (
                                            <button className="btn btn-light border" onClick={() => { setSearch(""); fetchItems(1, "", buildExtraParams()) }}>
                                                <i className="ti ti-x text-muted"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="ri-loader-2-fill fs-20 me-2" /> Cargando...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            No hay tickets disponibles en este momento.
                        </div>
                    ) : (
                        <Row className="gy-0 mt-1">
                            {items.map(ticket => (
                                <Col xl={6} key={ticket.id}>
                                    <Card className="custom-card">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="fw-medium text-primary fs-13">{ticket.ticket_number}</span>
                                                <span className={`badge bg-${PRIORITY_COLORS[ticket.ticket_priority_id] ?? "secondary"}-transparent`}>
                                                    {ticket.priority?.name ?? "—"}
                                                </span>
                                            </div>

                                            <h6 className="fw-medium mb-1" style={{ maxHeight: 44, overflow: "hidden" }}>
                                                {ticket.title}
                                            </h6>

                                            <div className="d-flex gap-3 mb-2 flex-wrap">
                                                <span className="text-muted fs-12">
                                                    <i className="ri-building-2-line me-1"></i>{ticket.company?.name ?? "—"}
                                                </span>
                                                <span className="text-muted fs-12">
                                                    <i className="ri-map-pin-2-line me-1 text-info"></i>{ticket.country?.name ?? "—"}
                                                </span>
                                            </div>

                                            <div className="d-flex gap-2 flex-wrap mb-3">
                                                {ticket.service && (
                                                    <SpkBadge Pill={true} variant="primary1-transparent" Customclass="badge-md fs-11">
                                                        <i className="bi bi-code-slash me-1"></i>{ticket.service.name}
                                                    </SpkBadge>
                                                )}
                                                {ticket.budget_usd != null ? (
                                                    <SpkBadge Pill={true} variant="success-transparent" Customclass="badge-md fs-11">
                                                        <i className="ri-money-dollar-circle-line me-1"></i>${ticket.budget_usd.toLocaleString()} USD
                                                    </SpkBadge>
                                                ) : (
                                                    <SpkBadge Pill={true} variant="secondary-transparent" Customclass="badge-md fs-11">
                                                        Presupuesto abierto
                                                    </SpkBadge>
                                                )}
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between">
                                                <span className="text-muted fs-12">
                                                    <i className="ri-calendar-line me-1"></i>{formatDate(ticket.created_at)}
                                                </span>
                                                <SpkButton Buttonvariant="primary" Size="sm" Customclass="waves-light" onClickfunc={() => handlePostular(ticket)}>
                                                    Postular <i className="ri-send-plane-line align-middle ms-1"></i>
                                                </SpkButton>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {total > 0 && totalPages > 1 && (
                        <div className="mt-4">
                            <PaginatorCentered
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </Col>
            </Row>

            <CreateBidModal
                show={showBid}
                onHide={() => setShowBid(false)}
                onSuccess={handleSuccess}
                ticket={ticketToBid}
                urlbase={urlbase}
            />
        </Fragment>
    )
}