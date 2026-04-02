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
import { ISpecialists } from "@/app/interfaces/general_interface";
import PaginatorCentered from "@/app/components/paginator/paginatorCentered";

const STATES = [
    { id: "1", label: "Activo" },
    { id: "0", label: "Inactivo" },
]

export default function Specialists() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch]                     = useState("")
    const [selectedCountry, setSelectedCountry]   = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string[]>([])
    const [selectedLevel, setSelectedLevel]       = useState<number[]>([])
    const [selectedState, setSelectedState]       = useState<string[]>([])
    const [openCountries, setOpenCountries]       = useState(false)
    const [openCategories, setOpenCategories]     = useState(false)

    const [countries, setCountries]               = useState<{ id: string; name: string }[]>([])
    const [serviceCategories, setServiceCategories] = useState<{ id: string; name: string }[]>([])
    const [skillLevels, setSkillLevels]           = useState<{ id: number; name: string }[]>([])

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
    } = useFetch<ISpecialists>({ endpoint: `${urlbase}/admin/specialists`, itemsPerPage })

    useEffect(() => {
        if (!user?.id) return
        const controller = new AbortController()
        Promise.all([
            apiFetch(`${urlbase}/admin/countries`, { signal: controller.signal }),
            apiFetch(`${urlbase}/admin/service-categories/list`, { signal: controller.signal }),
            apiFetch(`${urlbase}/admin/catalogs/skilllevels`, { signal: controller.signal }),
        ]).then(([countriesData, categoriesData, levelsData]) => {
            setCountries(countriesData)
            setServiceCategories(categoriesData)
            setSkillLevels(levelsData)
        }).catch(() => {})
        return () => controller.abort()
    }, [user])

    const buildExtraParams = useCallback((): Record<string, string> => {
        const params: Record<string, string> = {}
        if (selectedCountry)               params.country_id = selectedCountry
        if (selectedCategory.length === 1) params.service_category_id = selectedCategory[0]
        if (selectedLevel.length === 1)    params.skill_level_id = String(selectedLevel[0])
        if (selectedState.length === 1)    params.state = selectedState[0]
        return params
    }, [selectedCountry, selectedCategory, selectedLevel, selectedState])

    useEffect(() => {
        if (!user?.id) return
        fetchItems(currentPage, search, buildExtraParams())
    }, [user, currentPage, selectedCountry, selectedCategory, selectedLevel, selectedState])

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

    const toggleCategory = (id: string) => {
        setSelectedCategory(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
    }

    const toggleLevel = (id: number) => {
        setSelectedLevel(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
    }

    const toggleState = (id: string) => {
        setSelectedState(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    const getInitials = (first: string | null, last: string | null) =>
        `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <i key={i} className={`ri-star-${i < Math.round(rating) ? "fill text-warning" : "line text-muted"} fs-12`}></i>
        ))

    const visibleCountries  = openCountries  ? countries         : countries.slice(0, 4)
    const visibleCategories = openCategories ? serviceCategories : serviceCategories.slice(0, 3)

    return (
        <Fragment>
            <Seo title="Especialistas" />

            <Row>
                {/* Columna filtros */}
                <Col xxl={3} xl={4}>
                    <Card className="custom-card products-navigation-card">
                        <Card.Body className="p-0">

                            {/* País */}
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

                            {/* Categoría */}
                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">Categoría</h6>
                                <div className="py-3 pb-0">
                                    {visibleCategories.map(c => (
                                        <div className="form-check mb-2" key={c.id}>
                                            <input className="form-check-input me-2" type="checkbox" id={`cat-${c.id}`} checked={selectedCategory.includes(c.id)} onChange={() => toggleCategory(c.id)} />
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

                            {/* Nivel */}
                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">Nivel</h6>
                                <div className="py-3 pb-0">
                                    {skillLevels.map(l => (
                                        <div className="form-check mb-2" key={l.id}>
                                            <input className="form-check-input me-2" type="checkbox" id={`level-${l.id}`} checked={selectedLevel.includes(l.id)} onChange={() => toggleLevel(l.id)} />
                                            <label className="form-check-label" htmlFor={`level-${l.id}`}>{l.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="p-3 border-bottom">
                                <h6 className="fw-medium mb-0">Estado</h6>
                                <div className="py-3 pb-0">
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

                {/* Columna principal */}
                <Col xxl={9} xl={8}>
                    <Row>
                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header className="card-header justify-content-between">
                                    <div className="card-title">
                                        {total}{" "}
                                        <span className="fw-normal fs-18">
                                            especialista{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                        <div className="custom-form-group flex-grow-1">
                                            <input
                                                className="form-control form-control-sm"
                                                type="text"
                                                placeholder="Buscar especialista..."
                                                value={search}
                                                onChange={handleSearchChange}
                                            />
                                            <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                                <i className="ti ti-search"></i>
                                            </Link>
                                        </div>
                                        <SpkButton Buttonvariant="primary" Size="sm" Customclass="waves-light">
                                            <i className="ri-add-line fw-medium align-middle me-1"></i> Nuevo
                                        </SpkButton>
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
                            {items.map((specialist) => (
                                <Col xl={6} key={specialist.id}>
                                    <Card className="custom-card">
                                        <Card.Body>
                                            <div className="float-end d-flex gap-1">
                                                {specialist.cv_url && (
                                                    <SpkTooltips placement="top" title="Ver CV">
                                                        <a href={specialist.cv_url} target="_blank" rel="noopener noreferrer" className="avatar avatar-rounded avatar-sm bg-primary-transparent">
                                                            <span><i className="ri-download-cloud-line fs-14"></i></span>
                                                        </a>
                                                    </SpkTooltips>
                                                )}
                                                {specialist.state === 1 ? (
                                                    <>
                                                        <SpkTooltips placement="top" title="Editar">
                                                            <SpkButton Buttonvariant="primary-light" Size="sm">
                                                                <i className="ri-edit-line"></i>
                                                            </SpkButton>
                                                        </SpkTooltips>
                                                        <SpkTooltips placement="top" title="Eliminar">
                                                            <SpkButton Buttonvariant="danger-light" Size="sm" Customclass="btn-icon" onClickfunc={() => handleDelete(specialist.id)}>
                                                                <i className="ri-delete-bin-5-line"></i>
                                                            </SpkButton>
                                                        </SpkTooltips>
                                                    </>
                                                ) : (
                                                    <SpkTooltips placement="top" title="Restaurar">
                                                        <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon" onClickfunc={() => handleRestore(specialist.id)}>
                                                            <i className="ri-refresh-line"></i>
                                                        </SpkButton>
                                                    </SpkTooltips>
                                                )}
                                            </div>

                                            <div className="d-flex mb-3 align-items-center flex-wrap flex-sm-nowrap gap-2">
                                                <div>
                                                    <span className="avatar avatar-lg avatar-rounded bg-primary-transparent fw-bold text-primary fs-16">
                                                        {getInitials(specialist.person?.first_name, specialist.person?.last_name)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h6 className="fw-medium mb-1 d-flex align-items-center gap-1">
                                                        <Link scroll={false} href={`/specialists/${specialist.id}`}>
                                                            {specialist.person?.first_name} {specialist.person?.last_name}
                                                        </Link>
                                                        {specialist.verified_at && (
                                                            <SpkTooltips placement="top" title="Especialista verificado">
                                                                <i className="ri-verified-badge-fill text-primary fs-14"></i>
                                                            </SpkTooltips>
                                                        )}
                                                    </h6>
                                                    <div className="d-flex gap-2 flex-wrap mb-1">
                                                        <span className="fs-12 text-muted">
                                                            <i className="ri-money-dollar-circle-line fs-11"></i> ${specialist.hourly_rate_usd}/hr
                                                        </span>
                                                        <span className="fs-12 text-muted">
                                                            <i className="ri-mail-line fs-11"></i> {specialist.person?.email}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center fs-12 text-muted">
                                                        <span className="me-1">Rating:</span>
                                                        <div className="d-flex gap-1">{renderStars(specialist.rating_avg)}</div>
                                                        <span className="ms-1">({specialist.total_reviews})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="popular-tags mb-3 d-flex gap-2 flex-wrap">
                                                {specialist.skills?.map(skill => (
                                                    <SpkBadge key={skill.id} variant="" Customclass="rounded-pill fs-11 border border-primary border-opacity-10 text-primary">
                                                        <i className="ri-code-line me-1"></i>
                                                        {skill.service_category?.name} · {skill.skill_level?.name}
                                                    </SpkBadge>
                                                ))}
                                                {specialist.is_available && (
                                                    <SpkBadge variant="" Customclass="rounded-pill fs-11 border border-success border-opacity-10 text-success">
                                                        <i className="ri-checkbox-circle-line me-1"></i> Disponible
                                                    </SpkBadge>
                                                )}
                                            </div>

                                            <div className="d-flex align-items-center flex-wrap gap-3">
                                                <div>
                                                    <p className="mb-1">
                                                        <span className="text-muted">Tickets completados:</span>{" "}
                                                        <span className="fw-medium">{specialist.completed_tickets}</span>
                                                    </p>
                                                    <p className="mb-0">
                                                        <span className="text-muted">Opera en:</span>{" "}
                                                        <span className="fw-medium">
                                                            {specialist.countries?.map(c => c.country?.name).join(", ") || "—"}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="ms-auto">
                                                    <Link href={`/admin/specialists/profile?id=${specialist.id}`} className="btn btn-primary btn-sm btn-wave">
                                                        Ver perfil <i className="ri-arrow-right-line align-middle"></i>
                                                    </Link>
                                                </div>
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
        </Fragment>
    )
}