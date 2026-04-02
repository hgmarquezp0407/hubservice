"use client";

import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/app/hooks/useAdmin";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RightPanel = () => (
    <Col xxl={6} xl={5} lg={12} className="d-xl-block d-none px-0"
        style={{ height: "100vh", background: "rgb(14,22,50)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(32,51,114,0.5) 0%, transparent 70%)", top: -80, left: -80 }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,110,253,0.2) 0%, transparent 70%)", bottom: -60, right: -60 }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "75%", maxWidth: 680 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, rgb(32,51,114), rgb(13,110,253))", marginBottom: 28, boxShadow: "0 8px 32px rgba(13,110,253,0.3)" }}>
                <i className="ri-lock-password-line" style={{ fontSize: 34, color: "#fff" }} />
            </div>
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>APP HUB SERVICE</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, letterSpacing: 2, marginBottom: 36 }}>MARKETPLACE B2B · LATINOAMÉRICA</p>
            <div style={{ width: 48, height: 2, margin: "0 auto 36px", background: "linear-gradient(90deg, transparent, rgba(13,110,253,0.8), transparent)" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.8, maxWidth: 400, margin: "0 auto" }}>
                Ingresa tu correo registrado y te enviaremos un código de verificación para restablecer tu contraseña de forma segura.
            </p>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
            © {new Date().getFullYear()} App Hub Service · Todos los derechos reservados
        </div>
    </Col>
);

export default function ResetPassword() {
    const router      = useRouter();
    const { urlbase } = useAdmin();

    const [email,   setEmail]   = useState("");
    const [error,   setError]   = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim())          { setError("El correo es obligatorio"); return; }
        if (!EMAIL_RE.test(email))  { setError("Correo inválido"); return; }
        setError("");
        setLoading(true);
        try {
            await apiFetch(`${urlbase}/admin/auth/forgot-password`, {
                method: "POST",
                body:   JSON.stringify({ email }),
            });
            router.push(`/reset-password/verify?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            toast.error(err.message || "Error al enviar el código");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Seo title="Recuperar Contraseña" />
            <Row className="authentication authentication-cover-main mx-0">
                <Col xxl={6} xl={7}>
                    <Row className="justify-content-center align-items-center h-100">
                        <Col xxl={7} xl={9} lg={6} md={6} sm={8} className="col-12">
                            <Card className="custom-card my-auto border">
                                <Card.Body className="p-5">
                                    <div className="text-center mb-4">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                            style={{ width: 56, height: 56, background: "rgba(14,22,50,0.08)" }}>
                                            <i className="ri-mail-send-line fs-24" style={{ color: "rgb(14,22,50)" }} />
                                        </div>
                                        <p className="h5 mb-1">¿Olvidaste tu contraseña?</p>
                                        <p className="text-muted op-7 fw-normal fs-13 mb-0">
                                            Ingresa tu correo y te enviaremos un código de verificación.
                                        </p>
                                    </div>

                                    <div className="row gy-3">
                                        <Col xl={12}>
                                            <Form.Label className="fs-13">
                                                Correo electrónico <span className="text-danger fw-medium">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                size="sm"
                                                type="email"
                                                className={`form-control-sm${error ? " is-invalid" : ""}`}
                                                placeholder="correo@ejemplo.com"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setError(""); }}
                                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                            />
                                            {error && <div className="invalid-feedback d-block">{error}</div>}
                                        </Col>
                                    </div>

                                    <div className="d-grid mt-4">
                                        <button type="button" className="btn btn-sm"
                                            style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "#fff", transition: "0.3s" }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}
                                            onClick={handleSubmit} disabled={loading}>
                                            {loading
                                                ? <><span className="spinner-border spinner-border-sm me-2" />Enviando...</>
                                                : <><i className="ri-send-plane-line me-1" />Enviar código</>}
                                        </button>
                                    </div>

                                    <p className="text-muted text-center mt-3 mb-0 fs-13">
                                        ¿Recordaste tu contraseña? <Link scroll={false} href="/" className="text-primary">Inicia Sesión</Link>
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <RightPanel />
            </Row>
        </Fragment>
    );
}