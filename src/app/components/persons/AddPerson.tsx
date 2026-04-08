"use client";

import React, { useEffect, useState } from "react";
import { Col, Form, InputGroup, Modal } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { ActionMeta, MultiValue, SingleValue } from "react-select";
import { toast } from "react-toastify";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import SpkSelectFormik from "@/app/components/@spk-reusable/reusable-plugins/spk-reactselectformik";
import { apiFetch } from "@/utils/api";
import { IPerson, SelectOption, IProvince, IDistrict } from "@/app/interfaces/general_interface";

interface AddPersonModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;        // el padre llama fetchItems() aquí
    personToEdit?: IPerson | null;
    urlbase: string;
}

const DOC_TYPE = {
    DNI: 1,
    PASSPORT: 2,
    FOREIGN_CARD: 3,
} as const;

const MAX_LENGTH_BY_DOC: Record<number, number> = {
    [DOC_TYPE.DNI]: 8,
    [DOC_TYPE.PASSPORT]: 20,
    [DOC_TYPE.FOREIGN_CARD]: 20,
};

const buildValidationSchema = (maxlength: number) =>
    Yup.object().shape({
        names: Yup.string()
            .required("El nombre es obligatorio")
            .min(4, "Mínimo 4 caracteres")
            .max(100, "Máximo 100 caracteres")
            .matches(/^[a-zA-Z]/, "Debe comenzar con una letra")
            .trim(),
        lastnames: Yup.string()
            .required("Los apellidos son obligatorios")
            .min(4, "Mínimo 4 caracteres")
            .max(100, "Máximo 100 caracteres")
            .matches(/^[a-zA-Z]/, "Debe comenzar con una letra")
            .trim(),
        identity_document_id: Yup.string().required("El tipo de documento es obligatorio"),
        document_number: Yup.string()
            .required("El número de documento es obligatorio")
            .min(8, "Mínimo 8 caracteres")
            .max(maxlength, `Máximo ${maxlength} caracteres`)
            .matches(/^[0-9]+$/, "Solo debe contener números"),
        address: Yup.string()
            .nullable()
            .min(5, "La dirección debe tener al menos 5 caracteres")
            .max(255, "Máximo 255 caracteres"),
        email: Yup.string()
            .nullable()
            .max(100, "Máximo 100 caracteres")
            .email("Debe ser un correo electrónico válido")
            .trim(),
        phone: Yup.string()
            .nullable()
            .min(6, "El teléfono debe tener al menos 6 dígitos")
            .max(15, "No puede superar 15 dígitos")
            .matches(/^[0-9]+$/, "Solo debe contener números"),
        area_id: Yup.string().required("El área es obligatoria"),
        charge_id: Yup.string().required("El cargo es obligatorio"),
        department_id: Yup.string().required("El departamento es obligatorio"),
        province_id: Yup.string().required("La provincia es obligatoria"),
        district_id: Yup.string().required("El distrito es obligatorio"),
    });

const initialPerson: IPerson = {
    id: null,
    names: "",
    lastnames: "",
    identity_document_id: 1,
    document_number: "",
    email: "",
    phone: "",
    country_id: "PE",
    department_id: "",
    province_id: "",
    district_id: "",
    area_id: null,
    charge_id: null,
};

export default function AddPersonModal({ show, onHide, onSuccess, personToEdit, urlbase }: AddPersonModalProps) {
    const [person, setPerson]                   = useState<IPerson>(initialPerson);
    const [isSubmitting, setIsSubmitting]       = useState(false);
    const [maxlength, setMaxlength]             = useState(8);
    const [departments, setDepartments]         = useState<SelectOption[]>([]);
    const [provinces, setProvinces]             = useState<SelectOption[]>([]);
    const [districts, setDistricts]             = useState<SelectOption[]>([]);
    const [areas, setAreas]                     = useState<SelectOption[]>([]);
    const [charges, setCharges]                 = useState<SelectOption[]>([]);
    const [identityDocuments, setIdentityDocuments] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (!show) return;
        const ctrl = new AbortController();

        const load = async (endpoint: string, setter: (opts: SelectOption[]) => void) => {
            try {
                const data = await apiFetch(endpoint, { signal: ctrl.signal });
                setter(data.map((item: { id: number; name: string }) => ({
                    value: item.id,
                    label: item.name,
                })));
            } catch (err: any) {
                if (err.name !== "AbortError")
                    toast.error(`Error cargando opciones: ${err.message}`);
            }
        };

        Promise.all([
            load(`${urlbase}/admin/ubigeo/departments`, setDepartments),
            load(`${urlbase}/admin/areas/list`, setAreas),
            load(`${urlbase}/admin/charges/list`, setCharges),
            load(`${urlbase}/admin/catalogs/identitydocuments`, setIdentityDocuments),
        ]);

        return () => ctrl.abort();
    }, [show, urlbase]);

    useEffect(() => {
        if (show && personToEdit) {
            setPerson({
                id:                   personToEdit.id ?? null,
                names:                personToEdit.names ?? "",
                lastnames:            personToEdit.lastnames ?? "",
                identity_document_id: personToEdit.identity_document_id ?? 1,
                document_number:      personToEdit.document_number ?? "",
                email:                personToEdit.email ?? "",
                phone:                personToEdit.phone ?? "",
                country_id:           personToEdit.country_id ?? "PE",
                department_id:        personToEdit.department_id ?? "",
                province_id:          personToEdit.province_id ?? "",
                district_id:          personToEdit.district_id ?? "",
                area_id:              personToEdit.area_id ?? null,
                charge_id:            personToEdit.charge_id ?? null,
            });
            // Ajustar maxlength según el tipo de documento del registro a editar
            const docId = Number(personToEdit.identity_document_id);
            setMaxlength(MAX_LENGTH_BY_DOC[docId] ?? 8);
        } else if (show && !personToEdit) {
            setPerson(initialPerson);
            setMaxlength(8);
        }
    }, [show, personToEdit]);

    // Al cerrar: limpiar
    const handleClose = () => {
        setPerson(initialPerson);
        setMaxlength(8);
        onHide();
    };

    // Cambio de tipo de documento
    const handleDocTypeChange = (selected: SingleValue<any> | MultiValue<any>, _: ActionMeta<any>) => {
        if (!selected || Array.isArray(selected)) return;
        const docId = Number(selected.value);
        setMaxlength(MAX_LENGTH_BY_DOC[docId] ?? 8);
    };

    // Cambio de departamento → cargar provincias
    const handleDepartmentChange = async (selected: SingleValue<any> | MultiValue<any>, _: ActionMeta<any>) => {
        const id = (selected as SingleValue<any>)?.value;
        if (!id) return;
        try {
            const data = await apiFetch(`${urlbase}/admin/ubigeo/departments/${id}`);
            setProvinces(data.map((p: IProvince) => ({ value: p.id, label: p.name })));
            setDistricts([]);
        } catch (err: any) {
            toast.error(`Error cargando provincias: ${err.message}`);
        }
    };

    // Cambio de provincia → cargar distritos
    const handleProvinceChange = async (selected: SingleValue<any> | MultiValue<any>, _: ActionMeta<any>) => {
        const id = (selected as SingleValue<any>)?.value;
        if (!id) return;
        try {
            const data = await apiFetch(`${urlbase}/admin/ubigeo/provinces/${id}`);
            setDistricts(data.map((d: IDistrict) => ({ value: d.id, label: d.name })));
        } catch (err: any) {
            toast.error(`Error cargando distritos: ${err.message}`);
        }
    };

    const handleSubmit = async (values: IPerson, { resetForm }: any) => {
        setIsSubmitting(true);
        try {
            const method  = values.id ? "PUT" : "POST";
            const url     = values.id
                                ? `${urlbase}/admin/persons/${values.id}`
                                : `${urlbase}/admin/persons`;

            await apiFetch(url, { method, body: JSON.stringify(values) });

            toast.success(values.id ? "Persona actualizada." : "Persona registrada.");
            resetForm();
            setPerson(initialPerson);
            onSuccess();   // el padre recarga la lista
            handleClose();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal size="lg" show={show} onHide={handleClose} centered className="fade" tabIndex={-1}>
            <Formik
                initialValues={person}
                validationSchema={buildValidationSchema(maxlength)}
                enableReinitialize
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit: fmkSubmit, setFieldValue }) => (
                    <Form onSubmit={fmkSubmit}>
                        <Modal.Header>
                            <h6 className="modal-title">
                                {person.id ? "Editar Persona" : "Agregar Persona"}
                            </h6>
                            <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={handleClose} Buttonlabel="Close"/>
                        </Modal.Header>

                        <Modal.Body>
                            <div className="row gy-2">

                                <Col sm={12} lg={6}>
                                    <Form.Label>Nombres:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.names && touched.names ? "is-invalid" : ""}`} name="names" placeholder="Ingrese nombres" value={values.names} onChange={handleChange} onBlur={handleBlur}/>

                                    {errors.names && touched.names && (
                                        <div className="invalid-feedback">{errors.names}</div>
                                    )}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>Apellidos:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.lastnames && touched.lastnames ? "is-invalid" : ""}`} name="lastnames" placeholder="Ingrese apellidos" value={values.lastnames} onChange={handleChange} onBlur={handleBlur}/>

                                    {errors.lastnames && touched.lastnames && (
                                        <div className="invalid-feedback">{errors.lastnames}</div>
                                    )}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>
                                        Tipo Documento Identidad:<span className="fw-medium text-danger">*</span>
                                    </Form.Label>
                                    <SpkSelectFormik name="identity_document_id" option={identityDocuments} placeholder="Seleccionar..." getValue={values.identity_document_id!}
                                        onChange={(sel, meta) => {
                                            handleDocTypeChange(sel, meta);
                                            // limpiar número de documento al cambiar tipo
                                            setFieldValue("document_number", "");
                                        }}
                                    />
                                    {errors.identity_document_id && touched.identity_document_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.identity_document_id}
                                        </div>
                                    )}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>
                                        Número Documento:<span className="fw-medium text-danger">*</span>
                                    </Form.Label>

                                    <InputGroup
                                        size="sm"
                                        className={errors.document_number && touched.document_number ? "is-invalid" : ""}
                                    >
                                        <Form.Control type="text" name="document_number"
                                            className={`form-control-sm ${errors.document_number && touched.document_number ? "is-invalid" : ""}`} value={values.document_number}
                                            onChange={(e) => {
                                                // Solo números y respeta maxlength
                                                const val = e.target.value.replace(/\D/g, "");
                                                if (val.length <= maxlength)
                                                    setFieldValue("document_number", val);
                                            }}
                                            onBlur={handleBlur} maxLength={maxlength}
                                        />
                                        <InputGroup.Text>
                                            {values.document_number.length}/{maxlength}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {errors.document_number && touched.document_number && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.document_number}
                                        </div>
                                    )}
                                </Col>

                                <Col sm={12} lg={8}>
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.email && touched.email ? "is-invalid" : ""}`} name="email" placeholder="Ingrese email" value={values.email} onChange={handleChange} onBlur={handleBlur}/>

                                    {errors.email && touched.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Teléfono:</Form.Label>
                                    <Form.Control type="text" className={`form-control-sm ${errors.phone && touched.phone ? "is-invalid" : ""}`} name="phone" placeholder="Ingrese Teléfono" value={values.phone} onChange={handleChange} onBlur={handleBlur}/>

                                    {errors.phone && touched.phone && (
                                        <div className="invalid-feedback">{errors.phone}</div>
                                    )}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>Área:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="area_id" option={areas} placeholder="Seleccionar...!!" getValue={values.area_id!} />

                                    {errors.area_id && touched.area_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.area_id}
                                        </div>
                                    )}
                                </Col>

                                <Col sm={12} lg={6}>
                                    <Form.Label>Cargo:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="charge_id" option={charges} placeholder="Seleccionar...!!" getValue={values.charge_id!} />

                                    {errors.charge_id && touched.charge_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.charge_id}
                                        </div>
                                    )}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Departamento:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="department_id" option={departments} placeholder="Seleccionar...!!" getValue={values.department_id!}  onChange={handleDepartmentChange} />

                                    {errors.department_id && touched.department_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.department_id}
                                        </div>
                                    )}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Provincia:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="province_id" option={provinces} placeholder="Seleccionar...!!" getValue={values.province_id!} onChange={handleProvinceChange} />

                                    {errors.province_id && touched.province_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.province_id}
                                        </div>
                                    )}
                                </Col>

                                <Col sm={12} lg={4}>
                                    <Form.Label>Distrito:<span className="fw-medium text-danger">*</span></Form.Label>
                                    <SpkSelectFormik name="district_id" option={districts} placeholder="Seleccionar...!!" getValue={values.district_id!} />

                                    {errors.district_id && touched.district_id && (
                                        <div className="text-danger" style={{ fontSize: "0.875em", marginTop: "0.25rem" }}>
                                            {errors.district_id}
                                        </div>
                                    )}
                                </Col>

                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <SpkButton Buttonvariant="light" Buttontype="button" onClickfunc={handleClose} Buttondismiss="modal">
                                <i className="ri-arrow-left-circle-fill align-middle me-1"></i>Cancelar
                            </SpkButton>
                            <SpkButton Buttonvariant="primary" Buttontype="submit" Disabled={isSubmitting} Customclass={isSubmitting ? "btn-loader" : "waves-light"}
                            >
                                {isSubmitting ? (
                                    <span className="loading"><i className="ri-loader-2-fill fs-16"></i></span>
                                ) : (
                                    <i className="ri-save-3-line align-middle me-1"></i>
                                )}
                                <span className="me-1">{isSubmitting ? "Guardando..." : "Guardar"}</span>
                            </SpkButton>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}