"use client";

import SpkBadge from "@/app/components/@spk-reusable/reusable-uielements/spk-badge";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTablescomponent from "@/app/components/@spk-reusable/reusable-tables/tables-component";
import SpkTooltips from "@/app/components/@spk-reusable/reusable-uielements/spk-tooltips";
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { apiFetch } from "@/utils/api";
import { formatDate } from "@/utils/validators";
import { ISpecialists } from "@/app/interfaces/general_interface";
import SpkBreadcrumb from "@/app/components/@spk-reusable/reusable-uielements/spk-breadcrumb";

export default function SpecialistProfile() {
    const { user }       = useAuth()
    const { urlbase }    = useAdmin()
    const searchParams   = useSearchParams()
    const router         = useRouter()
    const id             = searchParams.get("id")

    const [specialist, setSpecialist] = useState<ISpecialists | null>(null)
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        if (!user?.id || !id) return
        apiFetch(`${urlbase}/admin/specialists/${id}`)
            .then(setSpecialist)
            .catch(() => router.push("/specialists"))
            .finally(() => setLoading(false))
    }, [user, id])

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-${i < Math.round(rating) ? "warning" : "muted"} me-1`}>
                <i className={`ri-star-${i < Math.round(rating) ? "fill" : "line"}`}></i>
            </span>
        ))

    const getInitials = (first: string | null, last: string | null) =>
        `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()

    if (loading) {
        return (
            <div className="text-center py-5">
                <i className="ri-loader-2-fill fs-20 me-2" /> Cargando...
            </div>
        )
    }

    if (!specialist) return null

    const fullName = `${specialist.person?.first_name ?? ""} ${specialist.person?.last_name ?? ""}`.trim()

    return (
        <Fragment>
            <Seo title={`Perfil — ${fullName}`} />

            <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
                <div>
                    <SpkBreadcrumb Customclass="mb-1">
                        <li className="breadcrumb-item">
                            <Link scroll={false} href="/admin/specialists">Especialistas</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">Perfil</li>
                    </SpkBreadcrumb>
                </div>
            </div>

            <Row>
                <Col xxl={8}>
                    <Card className="custom-card job-candidate-details">
                        <div className="candidate-bg-shape primary"></div>
                        <Card.Body className="pt-5">
                            <div className="mb-3 lh-1 mt-4">
                                <span className="avatar avatar-xxl avatar-rounded bg-primary-transparent fw-bold text-primary fs-24">
                                    {getInitials(specialist.person?.first_name, specialist.person?.last_name)}
                                </span>
                            </div>
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                <div className="flex-fill">
                                    <h6 className="mb-1 fw-semibold d-flex align-items-center gap-1">
                                        {fullName}
                                        {specialist.verified_at && (
                                            <SpkTooltips placement="top" title="Especialista verificado">
                                                <i className="ri-check-line text-success fs-16"></i>
                                            </SpkTooltips>
                                        )}
                                    </h6>
                                    <p className="mb-0 text-muted">
                                        {specialist.skills?.map(s => s.service_category?.name).join(", ") || "Sin categoría"}
                                    </p>
                                    <div className="d-flex flex-wrap gap-2 align-items-center fs-12 text-muted mt-1">
                                        <span>Rating:</span>
                                        <div className="d-flex">{renderStars(specialist.rating_avg)}</div>
                                        <span>({specialist.total_reviews} reseñas)</span>
                                    </div>
                                    <div className="d-flex fs-14 mt-3 gap-2 flex-wrap">
                                        <div>
                                            <p className="mb-1">
                                                <i className="ri-map-pin-line me-2 text-muted"></i>
                                                {specialist.countries?.map(c => c.country?.name).join(", ") || "—"}
                                            </p>
                                            <p className="mb-0">
                                                <i className="ri-briefcase-line me-2 text-muted"></i>
                                                {specialist.completed_tickets} tickets completados
                                            </p>
                                        </div>
                                        <div className="ms-3">
                                            <p className="mb-1">
                                                <i className="ri-currency-line me-2 text-muted"></i>
                                                Tarifa: <span className="fw-medium">${specialist.hourly_rate_usd}/hr</span>
                                            </p>
                                            <p className="mb-0">
                                                <i className="ri-file-text-line me-2 text-muted"></i>
                                                {specialist.tax_document_type?.name ?? "—"}
                                            </p>
                                        </div>
                                        <div className="ms-3">
                                            <p className="mb-1">
                                                <i className="ri-mail-line me-2 text-muted"></i>
                                                <span className="fw-medium">{specialist.person?.email}</span>
                                            </p>
                                            {specialist.person?.phone && (
                                                <p className="mb-0">
                                                    <i className="ri-phone-line me-2 text-muted"></i>
                                                    <span className="fw-medium">{specialist.person.phone}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-list ms-auto">
                                    {specialist.cv_url && (
                                        <a href={specialist.cv_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill btn-wave waves-effect">
                                            <i className="ri-download-cloud-line me-1"></i> Descargar CV
                                        </a>
                                    )}
                                    {specialist.linkedin_url && (
                                        <a href={specialist.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary1-light rounded-pill btn-wave waves-effect waves-light align-middle">
                                            <i className="ri-linkedin-line lh-1 my-auto align-middle"></i> LinkedIn
                                        </a>
                                    )}
                                    {specialist.portfolio_url && (
                                        <a href={specialist.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary-light rounded-pill btn-wave waves-effect waves-light align-middle me-0">
                                            <i className="ri-global-line fs-18 mb-1 lh-1 my-auto align-middle"></i>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex gap-3 align-items-center flex-wrap">
                                <h6 className="mb-0">Disponibilidad:</h6>
                                <div className="popular-tags d-flex gap-2 flex-wrap">
                                    {specialist.is_available ? (
                                        <SpkBadge Pill={true} variant="success-transparent" Customclass="fs-11">
                                            <i className="ri-checkbox-circle-line me-1"></i> Disponible
                                        </SpkBadge>
                                    ) : (
                                        <SpkBadge Pill={true} variant="danger-transparent" Customclass="fs-11">
                                            <i className="ri-close-circle-line me-1"></i> No disponible
                                        </SpkBadge>
                                    )}
                                    {specialist.is_non_resident && (
                                        <SpkBadge Pill={true} variant="warning-transparent" Customclass="fs-11">
                                            <i className="ri-global-line me-1"></i> No domiciliado
                                        </SpkBadge>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Habilidades</div>
                        </Card.Header>
                        <Card.Body>
                            <div className="popular-tags d-flex gap-2 flex-wrap">
                                {specialist.skills?.map(skill => (
                                    <SpkBadge key={skill.id} Pill={true} variant="primary-transparent">
                                        {skill.service_category?.name}
                                        <span className="ms-1 text-muted">· {skill.skill_level?.name}</span>
                                    </SpkBadge>
                                ))}
                                {specialist.skills?.length === 0 && (
                                    <span className="text-muted fs-13">Sin habilidades registradas.</span>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {specialist.bio && (
                        <Card className="custom-card">
                            <Card.Header>
                                <div className="card-title">Perfil profesional</div>
                            </Card.Header>
                            <Card.Body className="p-0 candidate-edu-timeline">
                                <div className="p-3">
                                    <h5 className="fw-medium fs-17 d-flex align-items-center gap-2">
                                        <span className="avatar avatar-rounded bg-primary avatar-sm">
                                            <i className="ri-briefcase-4-line fs-13"></i>
                                        </span>
                                        Acerca del especialista:
                                    </h5>
                                    <div className="ms-4 ps-3">
                                        <p className="op-9 mb-0">{specialist.bio}</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                <Col xxl={4}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header>
                            <div className="card-title">Información personal</div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <SpkTablescomponent tableClass="table table-responsive">
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Nombre</span></td>
                                        <td>: {fullName}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Email</span></td>
                                        <td>: {specialist.person?.email ?? "—"}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Teléfono</span></td>
                                        <td>: {specialist.person?.phone ?? "—"}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Documento</span></td>
                                        <td>: {specialist.tax_document_type?.name ?? "—"}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">N° Documento</span></td>
                                        <td>: {specialist.tax_document_number ?? "—"}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">No domiciliado</span></td>
                                        <td>: {specialist.is_non_resident ? "Sí" : "No"}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Verificado</span></td>
                                        <td>: {specialist.verified_at ? formatDate(specialist.verified_at) : "No verificado"}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Registrado</span></td>
                                        <td>: {formatDate(specialist.created_at)}</td>
                                    </tr>
                                    <tr>
                                        <td className="w-50"><span className="fw-medium">Estado</span></td>
                                        <td>
                                            : {specialist.state === 1
                                                ? <span className="badge bg-success-transparent">Activo</span>
                                                : <span className="badge bg-danger-transparent">Inactivo</span>}
                                        </td>
                                    </tr>
                                </SpkTablescomponent>
                            </div>
                        </Card.Body>
                        <Card.Footer className="border-top-0">
                            <div className="d-flex align-items-center">
                                <p className="fs-15 mb-0 me-4 fw-medium">Social:</p>
                                <div className="btn-list mb-0 d-flex gap-1 flex-wrap">
                                    {specialist.linkedin_url && (
                                        <a href={specialist.linkedin_url} target="_blank" rel="noopener noreferrer">
                                            <SpkButton Buttonvariant="primary-light" Size="sm" Customclass="btn-icon waves-effect waves-light">
                                                <i className="ri-linkedin-line"></i>
                                            </SpkButton>
                                        </a>
                                    )}
                                    {specialist.portfolio_url && (
                                        <a href={specialist.portfolio_url} target="_blank" rel="noopener noreferrer">
                                            <SpkButton Buttonvariant="secondary-light" Size="sm" Customclass="btn-icon waves-effect waves-light">
                                                <i className="ri-global-line"></i>
                                            </SpkButton>
                                        </a>
                                    )}
                                    {specialist.cv_url && (
                                        <a href={specialist.cv_url} target="_blank" rel="noopener noreferrer">
                                            <SpkButton Buttonvariant="success-light" Size="sm" Customclass="btn-icon waves-effect waves-light">
                                                <i className="ri-file-text-line"></i>
                                            </SpkButton>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>

                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Opera en</div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex gap-2 flex-wrap">
                                {specialist.countries?.map(c => (
                                    <SpkBadge key={c.country_id} Pill={true} variant="info-transparent" Customclass="fs-12">
                                        <i className="ri-map-pin-line me-1"></i>{c.country?.name}
                                    </SpkBadge>
                                ))}
                                {specialist.countries?.length === 0 && (
                                    <span className="text-muted fs-13">Sin países registrados.</span>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="custom-card">
                        <Card.Header>
                            <div className="card-title">Estadísticas</div>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-muted">Rating promedio</span>
                                    <div className="d-flex align-items-center gap-1">
                                        <span className="fw-medium">{specialist.rating_avg.toFixed(1)}</span>
                                        <i className="ri-star-fill text-warning fs-12"></i>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-muted">Total reseñas</span>
                                    <span className="fw-medium">{specialist.total_reviews}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-muted">Tickets completados</span>
                                    <span className="fw-medium">{specialist.completed_tickets}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-muted">Tarifa por hora</span>
                                    <span className="fw-medium">${specialist.hourly_rate_usd ?? "—"}/hr</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    )
}