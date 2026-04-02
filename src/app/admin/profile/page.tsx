"use client";

import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkTablescomponent from "@/app/components/@spk-reusable/reusable-tables/tables-component";
import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Card, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import { debounce } from "lodash";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdmin } from "@/app/hooks/useAdmin";
import { useCrud } from "@/app/hooks/useCrud";
import { formatDate } from "@/utils/validators";
import { IPersons, IPerson } from "@/app/interfaces/general_interface";
import dynamic from "next/dynamic";
const CreatableSelect = dynamic(() => import("react-select/creatable"), { ssr: false });

export default function ProfilePage() {
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
            <Seo title="Perfil" />

            <Row>
                <Col xl={12}>
                    <Card className="custom-card profile-card">
                        {/* <div className="profile-banner-img">
                            <img src="../../assets/images/media/media-3.jpg" className="card-img-top" alt="..." />
                        </div> */}
                        <Card.Body className=" pb-0 position-relative">
                            <div className="row profile-content">
                                <Col xl={3}>
                                    <Card className="custom-card overflow-hidden border">
                                        <Card.Body className=" border-bottom border-block-end-dashed">
                                            <div className="text-center">
                                                <span className="avatar avatar-xxl avatar-rounded online mb-3">
                                                    <img src="../../assets/images/faces/11.jpg" alt="" />
                                                </span>
                                                <h5 className="fw-semibold mb-1">Spencer Robin</h5>
                                                <span className="d-block fw-medium text-muted mb-2">Software Development Manager</span>
                                                <p className="fs-12 mb-0 text-muted"> <span className="me-3"><i className="ri-building-line me-1 align-middle"></i>Hamburg</span> <span><i className="ri-map-pin-line me-1 align-middle"></i>Germany</span> </p>
                                            </div>
                                        </Card.Body>
                                        <div className="p-3 pb-1 d-flex flex-wrap justify-content-between">
                                            <div className="fw-medium fs-15 text-primary1">
                                                Información Básica :
                                            </div>
                                        </div>
                                        <Card.Body className=" border-bottom border-block-end-dashed p-0">
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item pt-2 border-0">
                                                    <div><span className="fw-medium me-2">Nombre y Apellidos :</span><span className="text-muted">Spencer Robin</span></div>
                                                </li>
                                                <li className="list-group-item pt-2 border-0">
                                                    <div><span className="fw-medium me-2">Cargo :</span><span className="text-muted">Software Development Manager</span></div>
                                                </li>
                                                <li className="list-group-item pt-2 border-0">
                                                    <div><span className="fw-medium me-2">Email :</span><span className="text-muted">spencer.robin22@example.com</span></div>
                                                </li>
                                                <li className="list-group-item pt-2 border-0">
                                                    <div><span className="fw-medium me-2">Teléfono :</span><span className="text-muted">+1 (222) 111 - 57840</span></div>
                                                </li>
                                                <li className="list-group-item pt-2 border-0">
                                                    <div><span className="fw-medium me-2">Experience :</span><span className="text-muted">10 Years</span></div>
                                                </li>
                                                <li className="list-group-item pt-2 border-0">
                                                    <div><span className="fw-medium me-2">Age :</span><span className="text-muted">28</span></div>
                                                </li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xl={9}>
                                    <Card className="custom-card overflow-hidden border">
                                        <Card.Body className="">
                                            <Tab.Container defaultActiveKey="edit">
                                                <Nav className="nav-tabs tab-style-6 mb-3 p-0" id="myTab" role="tablist">
                                                    <Nav.Item className="" role="presentation">
                                                        <Nav.Link eventKey="edit" className="w-100 text-start" id="edit-profile-tab" data-bs-toggle="tab"
                                                            data-bs-target="#edit-profile-tab-pane" type="button" role="tab" active
                                                            aria-controls="edit-profile-tab-pane" aria-selected="true">Editar Perfil</Nav.Link>
                                                    </Nav.Item>
                                                </Nav>
                                                <Tab.Content id="profile-tabs">
                                                    <Tab.Pane eventKey="edit" className="p-0 border-0" id="edit-profile-tab-pane" role="tabpanel"
                                                        aria-labelledby="edit-profile-tab" tabIndex={0}>
                                                        <ul className="list-group list-group-flush border rounded-3">
                                                            <li className="list-group-item p-3">
                                                                <span className="fw-medium fs-15 d-block mb-3">Personal Info :</span>
                                                                <div className="row gy-3 align-items-center">
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">User Name :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">First Name :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">Last Name :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">Designation :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                </div>
                                                            </li>
                                                            <li className="list-group-item p-3">
                                                                <span className="fw-medium fs-15 d-block mb-3">Contact Info :</span>
                                                                <div className="row gy-3 align-items-center">
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">Email :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="email" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">Phone :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">Website :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                    <Col xl={3}>
                                                                        <div className="lh-1">
                                                                            <span className="fw-medium">Location :</span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col xl={9}>
                                                                        <input type="text" className="form-control" placeholder="" defaultValue="" />
                                                                    </Col>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Tab.Container>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
}