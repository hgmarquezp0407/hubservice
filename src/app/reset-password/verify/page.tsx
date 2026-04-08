"use client";

import Seo from "@/app/components/layouts/seo/seo";
import Link from "next/link";
import React, { Fragment, useState, useRef, Suspense } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdmin } from "@/app/hooks/useAdmin";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify";

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
                <i className="ri-shield-keyhole-line" style={{ fontSize: 34, color: "#fff" }} />
            </div>
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>APP HUB SERVICE</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, letterSpacing: 2, marginBottom: 36 }}>MARKETPLACE B2B · LATINOAMÉRICA</p>
            <div style={{ width: 48, height: 2, margin: "0 auto 36px", background: "linear-gradient(90deg, transparent, rgba(13,110,253,0.8), transparent)" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.8, maxWidth: 400, margin: "0 auto" }}>
                Revisa tu bandeja de entrada. El código expira en <strong style={{ color: "rgba(255,255,255,0.6)" }}>15 minutos</strong>. Si no lo encuentras, revisa tu carpeta de spam.
            </p>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
            © {new Date().getFullYear()} App Hub Service · Todos los derechos reservados
        </div>
    </Col>
);

const DIGITS = ["d1", "d2", "d3", "d4", "d5", "d6"] as const;
type DigitKey = typeof DIGITS[number];

// ── Componente interno que usa useSearchParams ──────────────────────────────
function VerifyContent() {
    const router       = useRouter();
    const params       = useSearchParams();
    const { urlbase }  = useAdmin();
    const email        = params.get("email") ?? "";

    const [digits, setDigits]           = useState<Record<DigitKey, string>>({ d1: "", d2: "", d3: "", d4: "", d5: "", d6: "" });
    const [showPass, setShowPass]       = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword]       = useState("");
    const [confirm, setConfirm]         = useState("");
    const [errors, setErrors]           = useState<Record<string, string>>({});
    const [loading, setLoading]         = useState(false);
    const [resending, setResending]     = useState(false);
    const refs                          = useRef<Record<DigitKey, HTMLInputElement | null>>({ d1: null, d2: null, d3: null, d4: null, d5: null, d6: null });

    const handleDigit = (key: DigitKey, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const char = value.slice(-1);
        setDigits(p => ({ ...p, [key]: char }));
        setErrors(p => ({ ...p, otp: "" }));
        if (char) {
            const idx = DIGITS.indexOf(key);
            if (idx < DIGITS.length - 1) refs.current[DIGITS[idx + 1]]?.focus();
        }
    };

    const handleKeyDown = (key: DigitKey, e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Backspace" && !digits[key]) {
            const idx = DIGITS.indexOf(key);
            if (idx > 0) refs.current[DIGITS[idx - 1]]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        const updated = { ...digits };
        DIGITS.forEach((k, i) => { updated[k] = pasted[i] ?? ""; });
        setDigits(updated);
        const lastFilled = Math.min(pasted.length, 5);
        refs.current[DIGITS[lastFilled]]?.focus();
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        const otp = DIGITS.map(k => digits[k]).join("");
        if (otp.length < 6)           e.otp      = "Ingresa el código completo de 6 dígitos";
        if (!password)                e.password  = "Requerido";
        else if (password.length < 8) e.password  = "Mínimo 8 caracteres";
        if (password !== confirm)     e.confirm   = "Las contraseñas no coinciden";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const otp = DIGITS.map(k => digits[k]).join("");
            await apiFetch(`${urlbase}/admin/auth/reset-password`, {
                method: "POST",
                body:   JSON.stringify({ email, otp, new_password: password }),
            });
            try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
            toast.success("Contraseña actualizada correctamente");
            router.push("/");
        } catch (err: any) {
            toast.error(err.message || "Código inválido o expirado");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await apiFetch(`${urlbase}/admin/auth/forgot-password`, {
                method: "POST",
                body:   JSON.stringify({ email }),
            });
            toast.success("Código reenviado a tu correo");
            setDigits({ d1: "", d2: "", d3: "", d4: "", d5: "", d6: "" });
            refs.current.d1?.focus();
        } catch (err: any) {
            toast.error(err.message || "Error al reenviar el código");
        } finally {
            setResending(false);
        }
    };

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c);

    return (
        <Row className="authentication authentication-cover-main mx-0">
            <Col xxl={6} xl={7}>
                <Row className="justify-content-center align-items-center h-100">
                    <Col xxl={7} xl={9} lg={6} md={6} sm={8} className="col-12">
                        <Card className="custom-card my-auto border">
                            <Card.Body className="p-5">
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                        style={{ width: 56, height: 56, background: "rgba(14,22,50,0.08)" }}>
                                        <i className="ri-shield-keyhole-line fs-24" style={{ color: "rgb(14,22,50)" }} />
                                    </div>
                                    <p className="h5 mb-1">Verifica tu identidad</p>
                                    <p className="text-muted op-7 fw-normal fs-13 mb-0">
                                        Ingresa el código de 6 dígitos enviado a <strong>{maskedEmail}</strong>
                                    </p>
                                </div>

                                <div className="row gy-3">
                                    {/* OTP */}
                                    <Col xl={12}>
                                        <Form.Label className="fs-13 mb-2">Código de verificación <span className="text-danger fw-medium">*</span></Form.Label>
                                        <div className="d-flex justify-content-between gap-2" onPaste={handlePaste}>
                                            {DIGITS.map(key => (
                                                <Form.Control
                                                    key={key}
                                                    type="text"
                                                    inputMode="numeric"
                                                    className={`text-center fw-bold fs-18${errors.otp ? " is-invalid" : ""}`}
                                                    style={{ width: 48, height: 48, padding: 0, borderColor: digits[key] ? "rgb(14,22,50)" : undefined }}
                                                    maxLength={1}
                                                    value={digits[key]}
                                                    ref={el => { refs.current[key] = el; }}
                                                    onChange={e => handleDigit(key, e.target.value)}
                                                    onKeyDown={e => handleKeyDown(key, e)}
                                                />
                                            ))}
                                        </div>
                                        {errors.otp && <div className="invalid-feedback d-block mt-1">{errors.otp}</div>}
                                        <div className="mt-2 fs-13 text-muted">
                                            ¿No recibiste el código?{" "}
                                            <button type="button" className="btn btn-link p-0 fs-13 text-primary" onClick={handleResend} disabled={resending}>
                                                {resending ? "Reenviando..." : "Reenviar"}
                                            </button>
                                        </div>
                                    </Col>

                                    {/* Nueva contraseña */}
                                    <Col xl={12}>
                                        <Form.Label className="fs-13">Nueva contraseña <span className="text-danger fw-medium">*</span></Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                size="sm"
                                                type={showPass ? "text" : "password"}
                                                className={`form-control-sm${errors.password ? " is-invalid" : ""}`}
                                                placeholder="Mínimo 8 caracteres"
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                                            />
                                            <Link scroll={false} href="#!" onClick={() => setShowPass(p => !p)} className="show-password-button text-muted" style={{ top: "50%", transform: "translateY(-50%)" }}>
                                                <i className={showPass ? "ri-eye-line" : "ri-eye-off-line"} />
                                            </Link>
                                        </div>
                                        {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                                    </Col>

                                    {/* Confirmar contraseña */}
                                    <Col xl={12}>
                                        <Form.Label className="fs-13">Confirmar contraseña <span className="text-danger fw-medium">*</span></Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                size="sm"
                                                type={showConfirm ? "text" : "password"}
                                                className={`form-control-sm${errors.confirm ? " is-invalid" : ""}`}
                                                placeholder="Repite la contraseña"
                                                value={confirm}
                                                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
                                            />
                                            <Link scroll={false} href="#!" onClick={() => setShowConfirm(p => !p)} className="show-password-button text-muted" style={{ top: "50%", transform: "translateY(-50%)" }}>
                                                <i className={showConfirm ? "ri-eye-line" : "ri-eye-off-line"} />
                                            </Link>
                                        </div>
                                        {errors.confirm && <div className="invalid-feedback d-block">{errors.confirm}</div>}
                                    </Col>
                                </div>

                                <div className="d-grid mt-4">
                                    <button type="button" className="btn btn-sm"
                                        style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "#fff", transition: "0.3s" }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}
                                        onClick={handleSubmit} disabled={loading}>
                                        {loading
                                            ? <><span className="spinner-border spinner-border-sm me-2" />Actualizando...</>
                                            : <><i className="ri-lock-2-line me-1" />Restablecer contraseña</>}
                                    </button>
                                </div>

                                <p className="text-muted text-center mt-3 mb-0 fs-13">
                                    <Link scroll={false} href="/reset-password" className="text-primary">
                                        <i className="ri-arrow-left-line me-1" />Volver
                                    </Link>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <RightPanel />
        </Row>
    );
}

export default function ResetPasswordVerify() {
    return (
        <Fragment>
            <Seo title="Verificar Código" />
            <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}><span className="spinner-border" /></div>}>
                <VerifyContent />
            </Suspense>
        </Fragment>
    );
}