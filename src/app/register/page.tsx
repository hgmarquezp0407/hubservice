
"use client";

import React, { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Col, Form, Row } from "react-bootstrap";
import Seo from "@/app/components/layouts/seo/seo";
import { useAdmin } from "@/app/hooks/useAdmin";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";

interface SelectOption {
    value:       string | number;
    label:       string;
    min_length?: number | null;
    max_length?: number | null;
}

interface Step1Form {
    role_id:          number | null;
    country_id:       string;
    document_type_id: string;
    document_number:  string;
    first_name:       string;
    last_name:        string;
    email:            string;
    username:         string;
    password:         string;
    confirm_password: string;
}

interface CompanyForm {
    name:              string;
    fiscal_id_type_id: string;
    tax_id:            string;
    industry:          string;
    country_id:        string;
    billing_email:     string;
    address:           string;
    website:           string;
}

interface SpecialistForm {
    bio:                  string;
    hourly_rate_usd:      string;
    linkedin_url:         string;
    portfolio_url:        string;
    tax_document_type_id: string;
    tax_document_number:  string;
    is_non_resident:      boolean;
}

type FormErrors = Record<string, string>;

const initStep1: Step1Form = {
    role_id: null,
    country_id: "", document_type_id: "", document_number: "",
    first_name: "", last_name: "", email: "", username: "", password: "", confirm_password: "",
};

const initCompany: CompanyForm = {
    name: "", fiscal_id_type_id: "", tax_id: "", industry: "",
    country_id: "", billing_email: "", address: "", website: "",
};

const initSpecialist: SpecialistForm = {
    bio: "", hourly_rate_usd: "", linkedin_url: "", portfolio_url: "",
    tax_document_type_id: "", tax_document_number: "", is_non_resident: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RightPanel = ({ title, subtitle, text }: { title: string; subtitle: string; text: string }) => (
    <Col xxl={6} xl={5} lg={12} className="d-xl-block d-none px-0"
        style={{ height: "100vh", background: "rgb(14,22,50)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(32,51,114,0.5) 0%, transparent 70%)", top: -80, left: -80 }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,110,253,0.2) 0%, transparent 70%)", bottom: -60, right: -60 }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "75%", maxWidth: 680 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, rgb(32,51,114), rgb(13,110,253))", marginBottom: 28, boxShadow: "0 8px 32px rgba(13,110,253,0.3)" }}>
                <i className="ri-global-line" style={{ fontSize: 34, color: "#fff" }} />
            </div>
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>APP HUB SERVICE</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, letterSpacing: 2, marginBottom: 36 }}>MARKETPLACE B2B · LATINOAMÉRICA</p>
            <div style={{ width: 48, height: 2, margin: "0 auto 36px", background: "linear-gradient(90deg, transparent, rgba(13,110,253,0.8), transparent)" }} />
            <h3 className="text-fixed-white mb-1 fw-medium">{title}</h3>
            <h6 className="text-fixed-white mb-3 fw-medium">{subtitle}</h6>
            <p className="text-fixed-white mb-1 op-6">{text}</p>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
            © {new Date().getFullYear()} App Hub Service · Todos los derechos reservados
        </div>
    </Col>
);

export default function Register() {
    const router      = useRouter();
    const { urlbase } = useAdmin();

    const [step, setStep]               = useState<1 | 2 | 3>(1);
    const [form1, setForm1]             = useState<Step1Form>(initStep1);
    const [formC, setFormC]             = useState<CompanyForm>(initCompany);
    const [formSp, setFormSp]           = useState<SpecialistForm>(initSpecialist);
    const [errors, setErrors]           = useState<FormErrors>({});
    const [loading, setLoading]         = useState(false);
    const [showPass, setShowPass]       = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [countries,   setCountries]   = useState<SelectOption[]>([]);
    const [docTypes,    setDocTypes]    = useState<SelectOption[]>([]);
    const [fiscalTypes, setFiscalTypes] = useState<SelectOption[]>([]);
    const [taxDocTypes, setTaxDocTypes] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (!urlbase) return;
        const ctrl = new AbortController();
        const load = async (endpoint: string, setter: (opts: SelectOption[]) => void) => {
            try {
                const data = await apiFetch(endpoint, { signal: ctrl.signal });
                setter(data.map((i: { id: any; name: string; min_length?: number; max_length?: number }) => ({
                    value:      i.id,
                    label:      i.name,
                    min_length: i.min_length ?? null,
                    max_length: i.max_length ?? null,
                })));
            } catch (err: any) {
                if (err.name !== "AbortError") toast.error(`Error cargando opciones: ${err.message}`);
            }
        };
        Promise.all([
            load(`${urlbase}/admin/countries`,                   setCountries),
            load(`${urlbase}/admin/catalogs/identitydocuments`, setDocTypes),
            load(`${urlbase}/admin/catalogs/fiscalidtypes`,     setFiscalTypes),
            load(`${urlbase}/admin/catalogs/tax-document-types`, setTaxDocTypes),
        ]);
        return () => ctrl.abort();
    }, [urlbase]);

    const handleChange1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm1(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: "" }));
    };

    const handleChangeC = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormC(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: "" }));
    };

    const handleChangeSp = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormSp(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        setErrors(p => ({ ...p, [name]: "" }));
    };

    const selectRole = (role_id: number) => {
        setForm1(p => ({ ...p, role_id }));
        setErrors(p => ({ ...p, role_id: "" }));
    };

    const validateStep1 = (): boolean => {
        const e: FormErrors = {};
        if (!form1.role_id)                   e.role_id          = "Selecciona un tipo de cuenta";
        if (!form1.country_id)                e.country_id       = "Requerido";
        if (!form1.document_type_id)          e.document_type_id = "Requerido";
        if (!form1.document_number.trim())    e.document_number  = "Requerido";
        else {
            const selected = docTypes.find(d => String(d.value) === String(form1.document_type_id));
            const min = selected?.min_length ?? null;
            const max = selected?.max_length ?? null;
            if (min !== null && max !== null) {
                const len = form1.document_number.length;
                if (len < min || len > max)
                    e.document_number = min === max ? `Debe tener exactamente ${max} dígitos` : `Entre ${min} y ${max} dígitos`;
            }
        }
        if (!form1.first_name.trim())         e.first_name       = "Requerido";
        if (!form1.last_name.trim())          e.last_name        = "Requerido";
        if (!form1.email.trim())              e.email            = "Requerido";
        else if (!EMAIL_RE.test(form1.email)) e.email            = "Email inválido";
        if (!form1.username.trim())           e.username         = "Requerido";
        else if (form1.username.length < 4)   e.username         = "Mínimo 4 caracteres";
        if (!form1.password)                  e.password         = "Requerido";
        else if (form1.password.length < 8)   e.password         = "Mínimo 8 caracteres";
        if (form1.password !== form1.confirm_password) e.confirm_password = "Las contraseñas no coinciden";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2Company = (): boolean => {
        const e: FormErrors = {};
        if (!formC.name.trim())          e.name              = "Requerido";
        if (!formC.fiscal_id_type_id)    e.fiscal_id_type_id = "Requerido";
        if (!formC.tax_id.trim())        e.tax_id            = "Requerido";
        if (!formC.country_id)           e.country_id        = "Requerido";
        if (!formC.billing_email.trim()) e.billing_email     = "Requerido";
        else if (!EMAIL_RE.test(formC.billing_email)) e.billing_email = "Email inválido";
        if (!formC.address.trim())       e.address           = "Requerido";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2Specialist = (): boolean => {
        const e: FormErrors = {};
        if (!formSp.tax_document_type_id)       e.tax_document_type_id = "Requerido";
        if (!formSp.tax_document_number.trim()) e.tax_document_number  = "Requerido";
        if (!formSp.hourly_rate_usd)            e.hourly_rate_usd      = "Requerido";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleStep1Submit = async () => {
        if (!validateStep1()) return;
        setLoading(true);
        try {
            const { confirm_password, ...payload } = form1;
            await apiFetch(`${urlbase}/admin/auth/register`, {
                method: "POST",
                body:   JSON.stringify(payload),
            });
            setFormC(p => ({ ...p, country_id: form1.country_id }));
            setStep(2);
        } catch (err: any) {
            toast.error(err.message || "Error en el registro");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async () => {
        const isCompany = form1.role_id === 2;
        if (isCompany ? !validateStep2Company() : !validateStep2Specialist()) return;
        setLoading(true);
        try {
            if (isCompany) {
                const payload = { ...formC, fiscal_id_type_id: Number(formC.fiscal_id_type_id) };
                await apiFetch(`${urlbase}/admin/auth/company/setup`, {
                    method: "POST",
                    body:   JSON.stringify(payload),
                });
            } else {
                const payload = { ...formSp, hourly_rate_usd: Number(formSp.hourly_rate_usd) };
                await apiFetch(`${urlbase}/admin/auth/specialist/setup`, {
                    method: "POST",
                    body:   JSON.stringify(payload),
                });
            }
            setStep(3);
        } catch (err: any) {
            toast.error(err.message || "Error al guardar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const fieldErr = (field: string) =>
        errors[field] ? <div className="invalid-feedback d-block">{errors[field]}</div> : null;

    const inputCls  = (field: string) => `form-control form-control-sm${errors[field] ? " is-invalid" : ""}`;
    const selectCls = (field: string) => `form-select form-select-sm${errors[field] ? " is-invalid" : ""}`;

    const StepIndicator = () => (
        <div className="d-flex align-items-center justify-content-center mb-4">
            {([1, 2, 3] as const).map((s, i) => (
                <React.Fragment key={s}>
                    <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 600, fontSize: 13,
                        background: step >= s ? "rgb(32,51,114)" : "#e9ecef",
                        color: step >= s ? "#fff" : "#6c757d",
                        transition: "all .3s",
                    }}>
                        {step > s ? "✓" : s}
                    </div>
                    {i < 2 && (
                        <div style={{ width: 60, height: 2, background: step > s ? "rgb(32,51,114)" : "#e9ecef", transition: "all .3s" }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // Paso 1 — Datos de acceso
    if (step === 1) return (
        <Fragment>
            <Seo title="Registro" />
            <Row className="authentication authentication-cover-main mx-0">
                <Col xxl={6} xl={7}>
                    <Row className="justify-content-center align-items-center h-100">
                        <Col xxl={8} xl={9} lg={7} md={8} sm={10} className="col-12">
                            <Card className="custom-card my-5 border">
                                <Card.Body className="p-4 p-md-5">
                                    <p className="h5 mb-1 text-center">REGÍSTRATE</p>
                                    <p className="mb-3 text-muted op-7 fw-normal text-center fs-13">¡Bienvenido! Crea tu cuenta para comenzar.</p>

                                    <StepIndicator />

                                    <p className="fs-13 fw-semibold text-center text-muted mb-2">¿Qué tipo de cuenta deseas crear?</p>
                                    <Row className="g-2 mb-3">
                                        {([
                                            { id: 2, icon: "ri-building-2-line", label: "Empresa",      desc: "Publico tickets y contrato especialistas" },
                                            { id: 3, icon: "ri-user-star-line",  label: "Especialista", desc: "Ofrezco servicios de TI especializados" },
                                        ] as const).map(r => (
                                            <Col xs={6} key={r.id}>
                                                <div onClick={() => selectRole(r.id)} className="text-center p-3 rounded-3" style={{
                                                    border: `2px solid ${form1.role_id === r.id ? "rgb(32,51,114)" : "#dee2e6"}`,
                                                    background: form1.role_id === r.id ? "rgba(32,51,114,.06)" : "#fff",
                                                    cursor: "pointer", transition: "all .2s",
                                                }}>
                                                    <i className={r.icon} style={{ fontSize: 28, color: form1.role_id === r.id ? "rgb(32,51,114)" : "#adb5bd", display: "block", marginBottom: 6 }} />
                                                    <div className="fw-semibold fs-14" style={{ color: form1.role_id === r.id ? "rgb(32,51,114)" : undefined }}>{r.label}</div>
                                                    <div className="fs-11 text-muted mt-1">{r.desc}</div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                    {fieldErr("role_id")}

                                    <Row className="gy-2 mt-1">
                                        <Col sm={6}>
                                            <Form.Label className="fs-13">País <span className="text-danger fw-medium">*</span></Form.Label>
                                            <Form.Select size="sm" className={selectCls("country_id")} name="country_id" value={form1.country_id} onChange={handleChange1}>
                                                <option value="">Seleccionar...</option>
                                                {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </Form.Select>
                                            {fieldErr("country_id")}
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label className="fs-13">Tipo Documento <span className="text-danger fw-medium">*</span></Form.Label>
                                            <Form.Select size="sm" className={selectCls("document_type_id")} name="document_type_id" value={form1.document_type_id} onChange={handleChange1}>
                                                <option value="">Seleccionar...</option>
                                                {docTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                            </Form.Select>
                                            {fieldErr("document_type_id")}
                                        </Col>
                                        <Col sm={12}>
                                            <Form.Label className="fs-13">N° Documento <span className="text-danger fw-medium">*</span></Form.Label>
                                            {(() => {
                                                const selected     = docTypes.find(d => String(d.value) === String(form1.document_type_id));
                                                const min          = selected?.min_length ?? null;
                                                const max          = selected?.max_length ?? null;
                                                const len          = form1.document_number.length;
                                                const hasLimits    = min !== null && max !== null;
                                                const isValid      = hasLimits && len >= min! && len <= max!;
                                                const counterColor = !hasLimits || len === 0 ? "#6c757d" : isValid ? "#198754" : "#dc3545";
                                                return (
                                                    <>
                                                        <div className="position-relative">
                                                            <Form.Control
                                                                size="sm"
                                                                className={inputCls("document_number")}
                                                                name="document_number"
                                                                value={form1.document_number}
                                                                onChange={handleChange1}
                                                                placeholder={hasLimits ? (min === max ? `${max} dígitos` : `${min} - ${max} dígitos`) : "Número de documento"}
                                                                maxLength={max ?? undefined}
                                                                style={{ paddingRight: hasLimits ? 56 : undefined }}
                                                            />
                                                            {hasLimits && (
                                                                <span style={{
                                                                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                                                    fontSize: 11, fontWeight: 600, color: counterColor,
                                                                    pointerEvents: "none", lineHeight: 1, whiteSpace: "nowrap",
                                                                }}>
                                                                    {len}/{max}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hasLimits && len > 0 && !isValid && (
                                                            <div style={{ fontSize: 11, color: "#dc3545", marginTop: 2 }}>
                                                                {min === max ? `Debe tener exactamente ${max} dígitos` : `Entre ${min} y ${max} dígitos`}
                                                            </div>
                                                        )}
                                                        {fieldErr("document_number")}
                                                    </>
                                                );
                                            })()}
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label className="fs-13">Nombres <span className="text-danger fw-medium">*</span></Form.Label>
                                            <Form.Control size="sm" className={inputCls("first_name")} name="first_name" value={form1.first_name} onChange={handleChange1} placeholder="Nombres" />
                                            {fieldErr("first_name")}
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label className="fs-13">Apellidos <span className="text-danger fw-medium">*</span></Form.Label>
                                            <Form.Control size="sm" className={inputCls("last_name")} name="last_name" value={form1.last_name} onChange={handleChange1} placeholder="Apellidos" />
                                            {fieldErr("last_name")}
                                        </Col>
                                        <Col sm={12}>
                                            <Form.Label className="fs-13">Email <span className="text-danger fw-medium">*</span></Form.Label>
                                            <Form.Control size="sm" type="email" className={inputCls("email")} name="email" value={form1.email} onChange={handleChange1} placeholder="correo@ejemplo.com" />
                                            {fieldErr("email")}
                                        </Col>
                                        <Col sm={12}>
                                            <Form.Label className="fs-13">Usuario <span className="text-danger fw-medium">*</span></Form.Label>
                                            <Form.Control size="sm" className={inputCls("username")} name="username" value={form1.username} onChange={handleChange1} placeholder="nombre de usuario" />
                                            {fieldErr("username")}
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label className="fs-13">Contraseña <span className="text-danger fw-medium">*</span></Form.Label>
                                            <div className="position-relative">
                                                <Form.Control size="sm" className={inputCls("password")} type={showPass ? "text" : "password"} name="password" value={form1.password} onChange={handleChange1} placeholder="••••••••" />
                                                <Link scroll={false} href="#!" onClick={() => setShowPass(p => !p)} className="show-password-button text-muted" style={{ top: "50%", transform: "translateY(-50%)" }}>
                                                    <i className={showPass ? "ri-eye-line" : "ri-eye-off-line"} />
                                                </Link>
                                            </div>
                                            {fieldErr("password")}
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label className="fs-13">Confirmar <span className="text-danger fw-medium">*</span></Form.Label>
                                            <div className="position-relative">
                                                <Form.Control size="sm" className={inputCls("confirm_password")} type={showConfirm ? "text" : "password"} name="confirm_password" value={form1.confirm_password} onChange={handleChange1} placeholder="••••••••" />
                                                <Link scroll={false} href="#!" onClick={() => setShowConfirm(p => !p)} className="show-password-button text-muted" style={{ top: "50%", transform: "translateY(-50%)" }}>
                                                    <i className={showConfirm ? "ri-eye-line" : "ri-eye-off-line"} />
                                                </Link>
                                            </div>
                                            {fieldErr("confirm_password")}
                                        </Col>
                                    </Row>

                                    <div className="d-grid mt-4">
                                        <button type="button" className="btn btn-sm"
                                            style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "#fff", transition: "0.3s" }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}
                                            onClick={handleStep1Submit} disabled={loading}>
                                            {loading
                                                ? <><span className="spinner-border spinner-border-sm me-2" />Registrando...</>
                                                : <><i className="ri-arrow-right-line me-1" />Continuar</>}
                                        </button>
                                    </div>
                                    <p className="text-muted text-center mt-3 mb-0 fs-13">
                                        ¿Ya tienes cuenta? <Link scroll={false} href="/" className="text-primary">Inicia Sesión</Link>
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <RightPanel
                    title="¡BIENVENIDO!"
                    subtitle="Crea tu cuenta en minutos"
                    text="Conecta tu empresa con los mejores especialistas TI de Latinoamérica o empieza a ofrecer tus servicios hoy."
                />
            </Row>
        </Fragment>
    );

    // Paso 2 — Setup perfil
    if (step === 2) return (
        <Fragment>
            <Seo title={form1.role_id === 2 ? "Perfil de Empresa" : "Perfil de Especialista"} />
            <Row className="authentication authentication-cover-main mx-0">
                <Col xxl={6} xl={7}>
                    <Row className="justify-content-center align-items-center h-100">
                        <Col xxl={8} xl={9} lg={7} md={8} sm={10} className="col-12">
                            <Card className="custom-card my-5 border">
                                <Card.Body className="p-4 p-md-5">
                                    <div className="text-center mb-3">
                                        <p className="h5 mb-1">{form1.role_id === 2 ? "Perfil de Empresa" : "Perfil de Especialista"}</p>
                                        <p className="text-muted op-7 fw-normal fs-13 mb-0">
                                            {form1.role_id === 2 ? "Completa los datos de tu empresa." : "Completa tu perfil profesional."}
                                        </p>
                                    </div>

                                    <StepIndicator />

                                    {form1.role_id === 2 ? (
                                        <Row className="gy-2">
                                            <Col sm={12}>
                                                <Form.Label className="fs-13">Razón Social <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Control size="sm" className={inputCls("name")} name="name" value={formC.name} onChange={handleChangeC} placeholder="Nombre de la empresa" />
                                                {fieldErr("name")}
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">Tipo Fiscal <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Select size="sm" className={selectCls("fiscal_id_type_id")} name="fiscal_id_type_id" value={formC.fiscal_id_type_id} onChange={handleChangeC}>
                                                    <option value="">Seleccionar...</option>
                                                    {fiscalTypes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                </Form.Select>
                                                {fieldErr("fiscal_id_type_id")}
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">RUC / Tax ID <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Control size="sm" className={inputCls("tax_id")} name="tax_id" value={formC.tax_id} onChange={handleChangeC} placeholder="Ej: 20123456789" />
                                                {fieldErr("tax_id")}
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">Industria</Form.Label>
                                                <Form.Control size="sm" name="industry" value={formC.industry} onChange={handleChangeC} placeholder="Ej: Tecnología" />
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">País <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Select size="sm" className={selectCls("country_id")} name="country_id" value={formC.country_id} onChange={handleChangeC}>
                                                    <option value="">Seleccionar...</option>
                                                    {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </Form.Select>
                                                {fieldErr("country_id")}
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Label className="fs-13">Email de Facturación <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Control size="sm" type="email" className={inputCls("billing_email")} name="billing_email" value={formC.billing_email} onChange={handleChangeC} placeholder="facturacion@empresa.com" />
                                                {fieldErr("billing_email")}
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Label className="fs-13">Dirección <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Control size="sm" className={inputCls("address")} name="address" value={formC.address} onChange={handleChangeC} placeholder="Av. Ejemplo 123, Lima" />
                                                {fieldErr("address")}
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Label className="fs-13">Sitio Web</Form.Label>
                                                <Form.Control size="sm" name="website" value={formC.website} onChange={handleChangeC} placeholder="https://miempresa.com" />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row className="gy-2">
                                            <Col sm={12}>
                                                <Form.Label className="fs-13">Bio / Descripción profesional</Form.Label>
                                                <Form.Control as="textarea" rows={3} size="sm" name="bio" value={formSp.bio} onChange={handleChangeSp} placeholder="Cuéntanos sobre tu experiencia..." />
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">Tipo Doc. Tributario <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Select size="sm" className={selectCls("tax_document_type_id")} name="tax_document_type_id" value={formSp.tax_document_type_id} onChange={handleChangeSp}>
                                                    <option value="">Seleccionar...</option>
                                                    {taxDocTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                </Form.Select>
                                                {fieldErr("tax_document_type_id")}
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">N° Doc. Tributario <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Control size="sm" className={inputCls("tax_document_number")} name="tax_document_number" value={formSp.tax_document_number} onChange={handleChangeSp} placeholder="Ej: 12345678" />
                                                {fieldErr("tax_document_number")}
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">Tarifa / hora (USD) <span className="text-danger fw-medium">*</span></Form.Label>
                                                <Form.Control size="sm" type="number" min="0" step="0.01" className={inputCls("hourly_rate_usd")} name="hourly_rate_usd" value={formSp.hourly_rate_usd} onChange={handleChangeSp} placeholder="0.00" />
                                                {fieldErr("hourly_rate_usd")}
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Label className="fs-13">LinkedIn URL</Form.Label>
                                                <Form.Control size="sm" name="linkedin_url" value={formSp.linkedin_url} onChange={handleChangeSp} placeholder="https://linkedin.com/in/..." />
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Label className="fs-13">Portfolio URL</Form.Label>
                                                <Form.Control size="sm" name="portfolio_url" value={formSp.portfolio_url} onChange={handleChangeSp} placeholder="https://miportfolio.com" />
                                            </Col>
                                            <Col sm={12}>
                                                <div className="d-flex align-items-center gap-2 bg-light rounded-3 p-3">
                                                    <Form.Check type="checkbox" id="is_non_resident" name="is_non_resident" checked={formSp.is_non_resident} onChange={handleChangeSp} />
                                                    <Form.Label htmlFor="is_non_resident" className="mb-0 fs-13 cursor-pointer">
                                                        Soy <strong>no residente</strong> en Perú <span className="text-muted">(aplica retención IR 30%)</span>
                                                    </Form.Label>
                                                </div>
                                            </Col>
                                        </Row>
                                    )}

                                    <div className="d-grid mt-4">
                                        <button type="button" className="btn btn-sm"
                                            style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "#fff", transition: "0.3s" }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}
                                            onClick={handleStep2Submit} disabled={loading}>
                                            {loading
                                                ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                                                : <><i className="ri-save-3-line me-1" />Completar Registro</>}
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <RightPanel
                    title="¡CASI LISTO!"
                    subtitle="Completa tu perfil"
                    text="Un perfil completo te ayuda a conectar mejor con empresas y especialistas en la plataforma."
                />
            </Row>
        </Fragment>
    );

    // Paso 3 — Éxito
    return (
        <Fragment>
            <Seo title="Registro Completado" />
            <Row className="authentication authentication-cover-main mx-0">
                <Col xxl={6} xl={7}>
                    <Row className="justify-content-center align-items-center h-100">
                        <Col xxl={7} xl={9} lg={6} md={6} sm={8} className="col-12">
                            <Card className="custom-card my-5 border">
                                <Card.Body className="p-5 text-center">
                                    <StepIndicator />
                                    <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ width: 72, height: 72, background: "rgba(25,135,84,.15)" }}>
                                        <i className="ri-checkbox-circle-fill fs-36 text-success" />
                                    </div>
                                    <h5 className="fw-bold mb-2">¡Registro completado!</h5>
                                    <p className="text-muted fs-13 mb-4">
                                        Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar a usar la plataforma.
                                    </p>
                                    <div className="d-grid">
                                        <button type="button" className="btn btn-sm"
                                            style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "#fff", transition: "0.3s" }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}
                                            onClick={() => router.push("/")}>
                                            <i className="ri-login-box-line me-1" />Ir al Login
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <RightPanel
                    title="¡BIENVENIDO!"
                    subtitle="Todo listo"
                    text="Tu cuenta está activa. Inicia sesión y comienza a explorar la plataforma."
                />
            </Row>
        </Fragment>
    );
}