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
import ViewContractModal from "@/app/components/contracts/ViewContractModal";
import EditContractModal from "@/app/components/contracts/EditContractModal";
import { IContracts } from "@/app/interfaces/general_interface";

const STATUS_COLORS: Record<string, string> = {
    active    : "primary",
    completed : "success",
    disputed  : "warning",
    cancelled : "danger",
}

export default function Contracts() {
    const { user }    = useAuth()
    const { urlbase } = useAdmin()

    const [search, setSearch] = useState("")

    const [showView, setShowView]             = useState(false)
    const [showEdit, setShowEdit]             = useState(false)
    const [contractToView, setContractToView] = useState<IContracts | null>(null)
    const [contractToEdit, setContractToEdit] = useState<IContracts | null>(null)

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
    } = useFetch<IContracts>({ endpoint: `${urlbase}/admin/contracts`, itemsPerPage })

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
        setContractToView(data)
        setShowView(true)
    }

    const handleEdit = async (id: string) => {
        const data = await fetchItem(id)
        if (!data) return
        setContractToEdit(data)
        setShowEdit(true)
    }

    const handleStart = async (id: string) => {
        const result = await Swal.fire({
            title             : "¿Iniciar contrato?",
            text              : "El contrato pasará a estado 'En progreso'.",
            icon              : "question",
            showCancelButton  : true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor : "#d33",
            confirmButtonText : "Sí, iniciar",
            cancelButtonText  : "Cancelar",
        })
        if (!result.isConfirmed) return
        try {
            const data = await apiFetch(`${urlbase}/admin/contracts/${id}/start`, { method: "POST" })
            await Swal.fire("¡Iniciado!", data.message || "Contrato iniciado correctamente.", "success")
            fetchItems(currentPage, search)
        } catch (err: any) {
            toast.error(err.message || "Error al iniciar el contrato.")
        }
    }

    const handleComplete = async (id: string) => {
        const result = await Swal.fire({
            title             : "¿Completar contrato?",
            text              : "Se generará la orden automáticamente.",
            icon              : "question",
            showCancelButton  : true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor : "#d33",
            confirmButtonText : "Sí, completar",
            cancelButtonText  : "Cancelar",
        })
        if (!result.isConfirmed) return
        try {
            const data = await apiFetch(`${urlbase}/admin/contracts/${id}/complete`, { method: "POST" })
            await Swal.fire("¡Completado!", data.message || "Contrato completado correctamente.", "success")
            fetchItems(currentPage, search)
        } catch (err: any) {
            toast.error(err.message || "Error al completar el contrato.")
        }
    }

    const handleSuccess = () => fetchItems(currentPage, search)

    return (
        <Fragment>
            <Seo title="Contratos" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Contratos</div>
                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar contrato..."
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
                                        { title: "Empresa" },
                                        { title: "Especialista" },
                                        { title: "Precio acordado" },
                                        { title: "Comisión" },
                                        { title: "Tasa" },
                                        { title: "Estado" },
                                        { title: "Iniciado" },
                                        { title: "Completado" },
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
                                        items.map((contract, index) => (
                                            <tr key={contract.id}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>{contract.company?.name ?? "—"}</td>
                                                <td>
                                                    {contract.specialist?.person
                                                        ? `${contract.specialist.person.first_name ?? ""} ${contract.specialist.person.last_name ?? ""}`.trim()
                                                        : "—"
                                                    }
                                                </td>
                                                <td><span className="fw-medium">${contract.agreed_price_usd.toLocaleString()}</span></td>
                                                <td><span className="fw-medium">${contract.commission_usd.toLocaleString()}</span></td>
                                                <td>
                                                    <span className="badge bg-info-transparent">{contract.commission_rate}%</span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${STATUS_COLORS[contract.contract_status_id] ?? "secondary"}-transparent`}>
                                                        {contract.status?.name ?? "—"}
                                                    </span>
                                                </td>
                                                <td>{contract.started_at ? formatDate(contract.started_at) : <span className="text-muted">—</span>}</td>
                                                <td>{contract.completed_at ? formatDate(contract.completed_at) : <span className="text-muted">—</span>}</td>
                                                <td>{formatDate(contract.created_at)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <SpkButton Buttonvariant="info-light" Size="sm" Buttontoggle="tooltip" Title="Ver detalle" onClickfunc={() => handleView(contract.id)}>
                                                            <i className="ri-eye-line"></i>
                                                        </SpkButton>
                                                        {contract.contract_status_id === "active" && (
                                                            <>
                                                                <SpkButton Buttonvariant="primary-light" Size="sm" Buttontoggle="tooltip" Title="Editar" onClickfunc={() => handleEdit(contract.id)}>
                                                                    <i className="ri-edit-line"></i>
                                                                </SpkButton>
                                                                <SpkButton Buttonvariant="warning-light" Size="sm" Buttontoggle="tooltip" Title="Iniciar" onClickfunc={() => handleStart(contract.id)}>
                                                                    <i className="ri-play-line"></i>
                                                                </SpkButton>
                                                                <SpkButton Buttonvariant="success-light" Size="sm" Buttontoggle="tooltip" Title="Completar" onClickfunc={() => handleComplete(contract.id)}>
                                                                    <i className="ri-check-double-line"></i>
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

            <ViewContractModal
                show={showView}
                onHide={() => setShowView(false)}
                contract={contractToView}
            />

            <EditContractModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                onSuccess={handleSuccess}
                contract={contractToEdit}
                urlbase={urlbase}
            />
        </Fragment>
    )
}