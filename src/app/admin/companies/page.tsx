"use client";

import SpkBadge from "@/app/components/@spk-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTooltips from "@/app/components/@spk-reusable/reusable-uielements/spk-tooltips";
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
import { ICompanies, SelectOptionAdvance } from "@/app/interfaces/general_interface";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";

interface SelectOption {
    id: string;
    name: string;
}

const STATES = [
    { id: "1", label: "Activo" },
    { id: "0", label: "Inactivo" },
]

export default function Companies() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]                   = useState("")
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [selectedFiscal, setSelectedFiscal]   = useState<number[]>([])
    const [selectedState, setSelectedState]     = useState<string[]>([])
    const [openCountries, setOpenCountries]     = useState(false)

    const [countries, setCountries]   = useState<SelectOption[]>([])
    const [fiscalTypes, setFiscalTypes] = useState<SelectOptionAdvance[]>([])

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10

    const {
        items,
        loading,
        total,
        totalPages,
        currentPage,
        setCurrentPage,
        fetchItems,
        deleteItem,
        restoreItem,
    } = useFetch<ICompanies>({ endpoint: `${urlbase}/admin/companies`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        const controller = new AbortController()
        Promise.all([
            apiFetch(`${urlbase}/admin/countries`, { signal: controller.signal }),
            apiFetch(`${urlbase}/admin/catalogs/fiscalidtypes`, { signal: controller.signal }),
        ]).then(([countriesData, fiscalData]) => {
            setCountries(countriesData)
            setFiscalTypes(fiscalData)
        }).catch(() => {})
        return () => controller.abort()
    }, [user])

    const buildExtraParams = useCallback((): Record<string, string> => {
        const params: Record<string, string> = {}
        if (selectedCountry)             params.country_id = selectedCountry
        if (selectedFiscal.length === 1) params.fiscal_id_type_id = String(selectedFiscal[0])
        if (selectedState.length === 1)  params.state = selectedState[0]
        return params
    }, [selectedCountry, selectedFiscal, selectedState])

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search, buildExtraParams())
    }, [user, currentPage, selectedCountry, selectedFiscal, selectedState])

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

    const handleDelete = (id: string) => {
        deleteItem(id, () => fetchItems(currentPage, search, buildExtraParams()))
    }

    const handleRestore = (id: string) => {
        restoreItem(id, () => fetchItems(currentPage, search, buildExtraParams()))
    }

    const toggleFiscal = (id: number) => {
        setSelectedFiscal(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        )
    }

    const toggleState = (id: string) => {
        setSelectedState(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const getInitials = (name: string) =>
        name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

    const visibleCountries = openCountries ? countries : countries.slice(0, 4)

    return (
        <Fragment>
            <Seo title="Empresas" />

            <Row>
                <Col xxl={3} lg={4}>
                    <Card className="custom-card products-navigation-card">
                        <Card.Body className="p-0">
                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">País</h6>
                                <div className="px-0 py-3 pb-0">
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
                                <h6 className="fw-medium mb-0">Tipo fiscal</h6>
                                <div className="px-0 py-3 pb-0">
                                    {fiscalTypes.map(f => (
                                        <div className="form-check mb-2" key={f.id}>
                                            <input className="form-check-input me-2" type="checkbox" id={`fiscal-${f.id}`} checked={selectedFiscal.includes(f.id)} onChange={() => toggleFiscal(f.id)} />
                                            <label className="form-check-label" htmlFor={`fiscal-${f.id}`}>
                                                {f.code} ({f.name})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">Estado</h6>
                                <div className="px-0 py-3 pb-0">
                                    {STATES.map(s => (
                                        <div className="form-check mb-2" key={s.id}>
                                            <input className="form-check-input me-2" type="checkbox" id={`state-${s.id}`} checked={selectedState.includes(s.id)} onChange={() => toggleState(s.id)} />
                                            <label className="form-check-label" htmlFor={`state-${s.id}`}>{s.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                <Col xxl={9} lg={8}>
                    <Row>
                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header className="card-header justify-content-between">
                                    <div className="card-title">
                                        {total}{" "}
                                        <span className="fw-normal fs-18">
                                            empresa{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                        <div className="custom-form-group flex-grow-1">
                                            <input
                                                className="form-control form-control-sm"
                                                type="text"
                                                placeholder="Buscar empresa..."
                                                value={search}
                                                onChange={handleSearchChange}
                                            />
                                            <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                                <i className="ti ti-search"></i>
                                            </Link>
                                        </div>

                                        {/* <SpkButton Buttonvariant="primary" Size="sm" Customclass="waves-light">
                                            <i className="ri-add-line fw-medium align-middle me-1"></i> Nueva empresa
                                        </SpkButton> */}
                                    </div>
                                </Card.Header>
                            </Card>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="ri-loader-2-fill fs-20 me-2" />
                            Cargando...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            Ningún dato para mostrar.
                        </div>
                    ) : (
                        <Row className="gy-0 mt-1">
                            {items.map((company) => (
                                <Col xl={6} key={company.id}>
                                    <Card className="custom-card">
                                        <Card.Body>
                                            <div className="float-end d-flex gap-1">
                                                {company.state === 1 ? (
                                                    <>
                                                        <SpkTooltips placement="top" title="Editar">
                                                            <SpkButton Buttonvariant="primary-light" Size="sm">
                                                                <i className="ri-edit-line"></i>
                                                            </SpkButton>
                                                        </SpkTooltips>
                                                        <SpkTooltips placement="top" title="Eliminar">
                                                            <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon" onClickfunc={() => handleDelete(company.id)}>
                                                                <i className="ri-delete-bin-5-line"></i>
                                                            </SpkButton>
                                                        </SpkTooltips>
                                                    </>
                                                ) : (
                                                    <SpkTooltips placement="top" title="Restaurar">
                                                        <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon" onClickfunc={() => handleRestore(company.id)}>
                                                            <i className="ri-refresh-line"></i>
                                                        </SpkButton>
                                                    </SpkTooltips>
                                                )}
                                            </div>

                                            <div className="d-flex align-items-center flex-wrap gap-2">
                                                <span className="avatar avatar-xl bg-light shadow-sm border border-primary border-opacity-10 p-3 avatar-rounded">
                                                    {company.logo_url ? (
                                                        <img src={company.logo_url} alt={company.name} />
                                                    ) : (
                                                        <span className="fw-bold text-primary fs-16">
                                                            {getInitials(company.name)}
                                                        </span>
                                                    )}
                                                </span>
                                                <div className="ms-2">
                                                    <h6 className="fw-medium mb-0 d-flex align-items-center gap-1">
                                                        {company.name}
                                                        {company.state === 1 ? (
                                                            <SpkTooltips placement="top" title="Empresa activa">
                                                                <i className="ri-verified-badge-fill text-secondary fs-13"></i>
                                                            </SpkTooltips>
                                                        ) : (
                                                            <SpkTooltips placement="top" title="Empresa inactiva">
                                                                <i className="ri-close-circle-fill text-danger fs-13"></i>
                                                            </SpkTooltips>
                                                        )}
                                                    </h6>
                                                    <div className="d-flex gap-2 mb-1">
                                                        <span className="text-muted fs-12">
                                                            <i className="ri-map-pin-2-line text-info"></i> {company.country?.name ?? "—"}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted fs-12">
                                                        Desde {formatDate(company.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card.Body>

                                        <Card.Footer>
                                            <div className="d-flex align-items-center flex-wrap gap-2">
                                                <div className="flex-grow-1 d-flex flex-wrap gap-1">
                                                    {company.industry && (
                                                        <SpkBadge Pill={true} variant="primary1-transparent" Customclass="badge-md fs-11">
                                                            <i className="bi bi-building me-1"></i>{company.industry}
                                                        </SpkBadge>
                                                    )}
                                                    {company.fiscal_id_type && (
                                                        <SpkBadge Pill={true} variant="info-transparent" Customclass="badge-md fs-11">
                                                            <i className="bi bi-card-text me-1"></i>
                                                            {company.fiscal_id_type.code}: {company.tax_id ?? "—"}
                                                        </SpkBadge>
                                                    )}
                                                    {company.primary_contact && (
                                                        <SpkBadge Pill={true} variant="success-transparent" Customclass="badge-md fs-11">
                                                            <i className="bi bi-person me-1"></i>
                                                            {`${company.primary_contact.first_name ?? ""} ${company.primary_contact.last_name ?? ""}`.trim()}
                                                        </SpkBadge>
                                                    )}
                                                </div>
                                                <Link scroll={false} href={`/companies/${company.id}`} className="btn-sm btn btn-wave btn-primary">
                                                    Ver perfil <i className="ri-arrow-right-line align-middle"></i>
                                                </Link>
                                            </div>
                                        </Card.Footer>
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
        </Fragment>
    )
}