"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTablescomponent from "@/app/components/@spk-reusable/reusable-tables/tables-component";
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { debounce } from "lodash";
import Paginator from "@/app/components/paginator/paginator";
import BadgeState from "@/app/components/general/BadgeState";
import TableActions from "@/app/components/general/TableActions";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { useCrud } from "@/app/hooks/useCrud";
import { formatDate } from "@/utils/validators";
import { IPersons, IPerson } from "@/app/interfaces/general_interface";
import AddPersonModal from "@/app/components/persons/AddPerson";
import TableHeaderActions from "@/app/components/general/TableHeaderActions";

export default function PersonsPage() {
    const { user }    = useAuth();
    const { urlbase } = useAdmin();

    const [show, setShow]               = useState(false);
    const [personToEdit, setPersonToEdit] = useState<IPerson | null>(null);
    const [search, setSearch] = useState("");

    const itemsPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10;

    // useCrud: solo gestiona el listado 
    const {
        items,
        loading,
        isSubmitting,
        total,
        totalPages,
        currentPage,
        from,
        to,
        permissions,
        can,
        setCurrentPage,
        fetchItems,
        fetchItem,
        deleteItem,
        restoreItem,
        exportToExcel,
    } = useCrud<IPersons>({ endpoint: `${urlbase}/admin/persons`, itemsPerPage });

    // Carga inicial
    useEffect(() => {
        if (!user?.id) return;
        fetchItems(currentPage, search);
    }, [user, currentPage]);

    // Búsqueda con debounce
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setCurrentPage(1);
            fetchItems(1, term);
        }, 200),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    // Abrir modal para crear
    const handleShowCreate = () => {
        setPersonToEdit(null);  // sin datos → modo creación
        setShow(true);
    };

    // Abrir modal para editar
    const handleEdit = async (id: number) => {
        const data = await fetchItem(id);
        if (!data) return;
        // fetchItem ya devuelve el objeto; lo normalizo antes de pasarlo al modal
        setPersonToEdit({
            id: data.id ?? null,
            names: data.names ?? "",
            lastnames: data.lastnames ?? "",
            identity_document_id: data.identity_document_id ?? 1,
            document_number: data.document_number ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            country_id: data.country_id ?? "PE",
            department_id: data.department_id ?? "",
            province_id: data.province_id ?? "",
            district_id: data.district_id ?? "",
            area_id: data.area_id ?? null,
            charge_id: data.charge_id ?? null,
        });
        setShow(true);
    };

    // Eliminar / Restaurar
    const handleDelete  = (id: number) => deleteItem(id,  () => fetchItems(currentPage, search));
    const handleRestore = (id: number) => restoreItem(id, () => fetchItems(currentPage, search));

    // Callback del modal: recargar lista 
    const handleSuccess = () => fetchItems(currentPage, search);

    return (
        <Fragment>
            <Seo title="Personas" />

            <Row>
                <Col xxl={12}>
                    <Card className="custom-card">
                        <Card.Header className="card-header justify-content-between">
                            <div className="card-title">Gestión de Personas</div>

                            <div className="d-flex flex-wrap gap-2">
                                <div className="custom-form-group flex-grow-1">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        placeholder="Buscar Persona"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                    <Link scroll={false} href="#!" className="text-muted custom-form-btn">
                                        <i className="ti ti-search"></i>
                                    </Link>
                                </div>

                                <TableHeaderActions
                                    permissions={permissions}
                                    onNew={handleShowCreate}
                                    onExport={() => exportToExcel(search)}
                                />
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div className="table-responsive">
                                <SpkTablescomponent
                                    tableClass="text-nowrap table-striped table-hover"
                                    header={[
                                        { title: "#" },
                                        { title: "Documento Identidad" },
                                        { title: "Nombres y Apellidos" },
                                        { title: "Email / Teléfono" },
                                        { title: "Área" },
                                        { title: "Cargo" },
                                        { title: "F. Creación" },
                                        { title: "Estado" },
                                        { title: "Acciones" },
                                    ]}
                                >
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-4">
                                                Ningún dato para mostrar.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((elem, index) => (
                                            <tr className="task-list" key={elem.id ?? index}>
                                                <td><span className="fw-medium">{from + index}</span></td>
                                                <td>
                                                    <span className="d-block fw-semibold">{elem.document_number}</span>
                                                    <span className="d-block text-muted fs-11">
                                                        {elem.identity_document.name} - {elem.identity_document.description}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="d-block fw-semibold">{elem.names} {elem.lastnames}</span>
                                                    <span className="d-block text-muted fs-11">
                                                        <i className="ri-map-pin-line me-1 align-middle"></i>
                                                        {elem.district.name} - {elem.district.province.name} - {elem.district.province.department.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="d-block fw-medium">
                                                        <i className="ri-mail-line me-1 align-middle"></i>{elem.email}
                                                    </span>
                                                    {elem.phone?.trim() && (
                                                        <span className="d-block text-muted fs-11">
                                                            <i className="ri-phone-line me-1 align-middle"></i>{elem.phone}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{formatDate(elem.created_at)}</td>
                                                <td><BadgeState state={elem.state} /></td>
                                                <td>
                                                    <TableActions
                                                        id={elem.id!}
                                                        stateId={elem.state_id}
                                                        permissions={permissions}
                                                        protected={elem.id === 1}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        onRestore={handleRestore}
                                                    />
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
                                        Mostrando {from} a {to} de {total} registros{" "}
                                        <i className="bi bi-arrow-right ms-2 fw-semibold"></i>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="ms-auto">
                                            <Paginator
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

            <AddPersonModal
                show={show}
                onHide={() => setShow(false)}
                onSuccess={handleSuccess}
                personToEdit={personToEdit}
                urlbase={urlbase}
            />
        </Fragment>
    );
}