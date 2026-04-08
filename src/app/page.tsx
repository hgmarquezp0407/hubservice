"use client";

import Seo from "@/app/components/layouts/seo/seo";
import React, { Fragment, useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/app/contexts/AuthContext";
import localFont from 'next/font/local';
import Link from "next/link";

const montserrat = localFont({
    src: '../../public/fonts/Montserrat/Montserrat-Black.woff2',
    weight: '900',
    display: 'swap',
});

function LoginSuccessMessage() {
    return (
        <div className="text-center mt-3" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(40,180,100,0.12)', marginBottom: 8,
                animation: 'pulseCheck 1.5s ease-in-out infinite',
            }}>
                <i className="ri-check-line" style={{ fontSize: 24, color: 'rgb(40,180,100)' }}></i>
            </div>
            <p style={{ color: 'rgb(40,180,100)', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                Inicio de sesión exitoso
            </p>
            <p style={{ color: '#888', fontSize: 12 }}>Redirigiendo al sistema...</p>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseCheck {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40,180,100,0.3); }
                    50%      { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(40,180,100,0); }
                }
            `}</style>
        </div>
    );
}

export default function Login() {
    const { login, loading } = useAuth();

    const [mounted,          setMounted]         = useState(false);
    const [passwordVisible,  setPasswordVisible]  = useState(false);
    const [loginError,       setLoginError]       = useState<string | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [loginSuccess,     setLoginSuccess]     = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const validationSchema = Yup.object({
        username: Yup.string().required("El usuario es obligatorio"),
        password: Yup.string().required("La contraseña es obligatoria").min(3, "Debe tener al menos 3 caracteres"),
    });

    const handleLogin = async (
        values: { username: string; password: string },
        { setSubmitting }: { setSubmitting: (v: boolean) => void }
    ) => {
        setIsSubmittingForm(true);
        setLoginError(null);
        try {
            const result = await login(values.username, values.password);
            if (result.success) {
                setLoginSuccess(true);
            } else {
                setLoginError(result.error || "Error al iniciar sesión");
            }
        } catch {
            setLoginError("Error de conexión. Intente nuevamente.");
        } finally {
            setIsSubmittingForm(false);
            setSubmitting(false);
        }
    };

    const isDisabled = isSubmittingForm || loading || loginSuccess;

    return (
        <Fragment>
            <Seo title="Inicio Sesión" />
            <Row className="authentication authentication-cover-main mx-0">
                <Col xxl={3} xl={4} className="d-flex flex-column">
                    <Row className="justify-content-center align-items-center flex-grow-1">
                        <Col xxl={10} xl={9} lg={6} md={6} sm={8} className="col-12">
                            <p className="mb-4 text-muted op-7 fw-normal text-center">Bienvenido a</p>
                            <h3 className={`${montserrat.className} text-center font-regular`}>APP HUB SERVICE</h3>
                            <p className={`${montserrat.className} text-center font-regular`} style={{ fontSize: '12px' }}>
                                SOPORTE EN LÍNEA
                            </p>
                            <div className="text-center my-3 authentication-barrier">
                                <span>Inicie Sesión</span>
                            </div>
                            {!mounted ? (
                                <div className="row gy-3">
                                    <div className="col-xl-12">
                                        <input type="text" className="form-control" placeholder="Ingrese su usuario" disabled={false} readOnly />
                                    </div>
                                    <div className="col-xl-12 mb-2">
                                        <input type="password" className="form-control" placeholder="Ingrese su contraseña" disabled={false} readOnly />
                                    </div>
                                    <div className="d-grid mt-4">
                                        <button type="button" className="btn" style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "white" }}>
                                            INICIAR SESIÓN
                                        </button>
                                    </div>
                                </div>
                            ) : (
                            <Formik
                                initialValues={{ username: "", password: "" }}
                                validationSchema={validationSchema}
                                onSubmit={handleLogin}
                            >
                                {({ isSubmitting }) => (
                                    <FormikForm className="row gy-3">
                                        <div className="col-xl-12">
                                            <Form.Label htmlFor="username" className="text-default">Usuario:</Form.Label>
                                            <Field type="text" name="username" className="form-control"
                                                placeholder="Ingrese su usuario"
                                                disabled={isDisabled || isSubmitting} />
                                            <ErrorMessage name="username" component="div" className="text-danger mt-1" />
                                        </div>
                                        <Col xl={12} className="mb-2">
                                            <Form.Label htmlFor="password" className="text-default">Contraseña:</Form.Label>
                                            <Link href="/reset-password" className="float-end fw-normal text-muted">¿Olvidaste tu contraseña?</Link>
                                            <div className="position-relative">
                                                <Field type={passwordVisible ? "text" : "password"} name="password"
                                                    className="form-control" placeholder="Ingrese su contraseña"
                                                    disabled={isDisabled || isSubmitting} />
                                                <button type="button"
                                                    className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y"
                                                    onClick={() => setPasswordVisible(v => !v)}
                                                    disabled={isDisabled || isSubmitting}>
                                                    <i className={`${passwordVisible ? "ri-eye-line" : "ri-eye-off-line"} align-middle`}></i>
                                                </button>
                                            </div>
                                            <ErrorMessage name="password" component="div" className="text-danger mt-1" />
                                        </Col>
                                        {loginError && (
                                            <div className="col-12">
                                                <div className="alert alert-danger py-2" role="alert">
                                                    <i className="ri-error-warning-line me-2"></i>{loginError}
                                                </div>
                                            </div>
                                        )}
                                        <div className="d-grid mt-4">
                                            {loginSuccess ? (
                                                <button type="button" className="btn" disabled style={{
                                                    backgroundColor: "rgb(40,180,100)", borderColor: "rgb(40,180,100)",
                                                    color: "white", transition: "0.5s",
                                                }}>
                                                    <i className="ri-check-line me-2"></i>Sesión iniciada
                                                </button>
                                            ) : (
                                                <button type="submit" className="btn"
                                                    disabled={isDisabled || isSubmitting}
                                                    style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "white", transition: "0.3s" }}
                                                    onMouseEnter={e => { if (!isDisabled && !isSubmitting) { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; } }}
                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}>
                                                    {isSubmitting || isSubmittingForm
                                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Iniciando sesión...</>
                                                        : "INICIAR SESIÓN"}
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted mt-3 mb-0">¿No tienes una cuenta? <Link scroll={false} href="/register" className="text-primary">Regístrate</Link></p>
                                        </div>
                                        {loginSuccess && <LoginSuccessMessage />}
                                    </FormikForm>
                                )}
                            </Formik>
                            )}
                        </Col>
                    </Row>
                </Col>

                <Col xxl={9} xl={8} className="d-xl-block d-none px-0"
                    style={{ height: "100vh", background: "rgb(14,22,50)", position: "relative", overflow: "hidden" }}>

                    {/* Círculos decorativos de fondo */}
                    <div style={{
                        position: "absolute", width: 600, height: 600, borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.04)",
                        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    }} />
                    <div style={{
                        position: "absolute", width: 400, height: 400, borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.06)",
                        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    }} />
                    <div style={{
                        position: "absolute", width: 200, height: 200, borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.08)",
                        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    }} />

                    {/* Glow superior izquierdo */}
                    <div style={{
                        position: "absolute", width: 350, height: 350, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(32,51,114,0.5) 0%, transparent 70%)",
                        top: -80, left: -80,
                    }} />

                    {/* Glow inferior derecho */}
                    <div style={{
                        position: "absolute", width: 300, height: 300, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(13,110,253,0.2) 0%, transparent 70%)",
                        bottom: -60, right: -60,
                    }} />

                    {/* Contenido central */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center", width: "75%", maxWidth: 680,
                    }}>
                        {/* Ícono central */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 72, height: 72, borderRadius: 20,
                            background: "linear-gradient(135deg, rgb(32,51,114), rgb(13,110,253))",
                            marginBottom: 28, boxShadow: "0 8px 32px rgba(13,110,253,0.3)",
                        }}>
                            <i className="ri-global-line" style={{ fontSize: 34, color: "#fff" }} />
                        </div>

                        <h2 style={{
                            color: "#fff", fontWeight: 700, fontSize: 28,
                            letterSpacing: 1, marginBottom: 8,
                        }}>
                            APP HUB SERVICE
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, letterSpacing: 2, marginBottom: 36 }}>
                            MARKETPLACE B2B · LATINOAMÉRICA
                        </p>

                        {/* Separador */}
                        <div style={{
                            width: 48, height: 2, margin: "0 auto 36px",
                            background: "linear-gradient(90deg, transparent, rgba(13,110,253,0.8), transparent)",
                        }} />

                        {/* Stats */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
                            {[
                                { icon: "ri-building-2-line", value: "Empresas", desc: "Publica tickets y contrata especialistas TI" },
                                { icon: "ri-user-star-line", value: "Especialistas", desc: "Ofrece servicios y gestiona contratos" },
                                { icon: "ri-file-list-3-line", value: "Contratos", desc: "Gestiona acuerdos, pagos y entregas en un solo lugar" },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 14, padding: "20px 16px",
                                    backdropFilter: "blur(8px)",
                                }}>
                                    <i className={item.icon} style={{ fontSize: 26, color: "rgb(13,110,253)", display: "block", marginBottom: 10 }} />
                                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item.value}</div>
                                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Categorías */}
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                            {[
                                "Soporte Técnico", "Desarrollo de Software", "Ciberseguridad",
                                "Cloud & Infraestructura", "Redes & Telecomunicaciones", "ERP & Software Empresarial",
                            ].map((cat, i) => (
                                <span key={i} style={{
                                    background: "rgba(13,110,253,0.12)",
                                    border: "1px solid rgba(13,110,253,0.25)",
                                    color: "rgba(255,255,255,0.6)",
                                    borderRadius: 20, padding: "5px 14px",
                                    fontSize: 11, letterSpacing: 0.5,
                                }}>
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer del panel */}
                    <div style={{
                        position: "absolute", bottom: 24, left: 0, right: 0,
                        textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11,
                    }}>
                        © {new Date().getFullYear()} App Hub Service · Todos los derecesos reservados
                    </div>
                </Col>
            </Row>
        </Fragment>
    );
}



































// "use client";

// import Seo from "@/app/components/layouts/seo/seo";
// import React, { Fragment, useState, useEffect } from "react";
// import { Col, Form, Row } from "react-bootstrap";
// import { useRouter } from 'next/navigation';
// import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { useAuth } from "@/app/contexts/AuthContext";
// import localFont from 'next/font/local';
// import Link from "next/link";

// const montserrat = localFont({
//     src: '../../public/fonts/Montserrat/Montserrat-Black.woff2',
//     weight: '900',
//     display: 'swap',
// });

// function LoginSuccessMessage() {
//     return (
//         <div className="text-center mt-3" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
//             <div style={{
//                 display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
//                 width: 44, height: 44, borderRadius: '50%',
//                 background: 'rgba(40,180,100,0.12)', marginBottom: 8,
//                 animation: 'pulseCheck 1.5s ease-in-out infinite',
//             }}>
//                 <i className="ri-check-line" style={{ fontSize: 24, color: 'rgb(40,180,100)' }}></i>
//             </div>
//             <p style={{ color: 'rgb(40,180,100)', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
//                 Inicio de sesión exitoso
//             </p>
//             <p style={{ color: '#888', fontSize: 12 }}>Redirigiendo al sistema...</p>
//             <style>{`
//                 @keyframes fadeInUp {
//                     from { opacity: 0; transform: translateY(10px); }
//                     to   { opacity: 1; transform: translateY(0); }
//                 }
//                 @keyframes pulseCheck {
//                     0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40,180,100,0.3); }
//                     50%      { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(40,180,100,0); }
//                 }
//             `}</style>
//         </div>
//     );
// }

// export default function Login() {
//     const { login, user, loading } = useAuth();
//     const router = useRouter();

//     const [mounted,          setMounted]          = useState(false);
//     const [passwordVisible,  setPasswordVisible]  = useState(false);
//     const [loginError,       setLoginError]        = useState<string | null>(null);
//     const [isSubmittingForm, setIsSubmittingForm]  = useState(false);
//     const [loginSuccess,     setLoginSuccess]      = useState(false);

//     useEffect(() => { setMounted(true); }, []);

//     const validationSchema = Yup.object({
//         username: Yup.string().required("El usuario es obligatorio"),
//         password: Yup.string().required("La contraseña es obligatoria").min(3, "Debe tener al menos 3 caracteres"),
//     });

//     useEffect(() => {
//         if (user?.id && !loginSuccess) router.push('/admin/home');
//     }, [user, router, loginSuccess]);

//     const handleLogin = async (
//         values: { username: string; password: string },
//         { setSubmitting }: { setSubmitting: (v: boolean) => void }
//     ) => {
//         setIsSubmittingForm(true);
//         setLoginError(null);
//         try {
//             const result = await login(values.username, values.password);
//             if (result.success) {
//                 setLoginSuccess(true);
//                 setTimeout(() => router.push('/admin/home'), 2500);
//             } else {
//                 setLoginError(result.error || "Error al iniciar sesión");
//             }
//         } catch {
//             setLoginError("Error de conexión. Intente nuevamente.");
//         } finally {
//             setIsSubmittingForm(false);
//             setSubmitting(false);
//         }
//     };

//     const isDisabled = isSubmittingForm || loading || loginSuccess;

//     return (
//         <Fragment>
//             <Seo title="Inicio Sesión" />
//             <Row className="authentication authentication-cover-main mx-0">
//                 <Col xxl={3} xl={4} className="d-flex flex-column">
//                     <Row className="justify-content-center align-items-center flex-grow-1">
//                         <Col xxl={10} xl={9} lg={6} md={6} sm={8} className="col-12">
//                             <p className="mb-4 text-muted op-7 fw-normal text-center">Bienvenido a</p>
//                             <h3 className={`${montserrat.className} text-center font-regular`}>APP HUB SERVICE</h3>
//                             <p className={`${montserrat.className} text-center font-regular`} style={{ fontSize: '12px' }}>
//                                 SOPORTE EN LÍNEA
//                             </p>
//                             <div className="text-center my-3 authentication-barrier">
//                                 <span>Inicie Sesión</span>
//                             </div>
//                             {!mounted ? (
//                                 <div className="row gy-3">
//                                     <div className="col-xl-12">
//                                         <input type="text" className="form-control" placeholder="Ingrese su usuario" disabled={false} readOnly />
//                                     </div>
//                                     <div className="col-xl-12 mb-2">
//                                         <input type="password" className="form-control" placeholder="Ingrese su contraseña" disabled={false} readOnly />
//                                     </div>
//                                     <div className="d-grid mt-4">
//                                         <button type="button" className="btn" style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "white" }}>
//                                             INICIAR SESIÓN
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                             <Formik
//                                 initialValues={{ username: "", password: "" }}
//                                 validationSchema={validationSchema}
//                                 onSubmit={handleLogin}
//                             >
//                                 {({ isSubmitting }) => (
//                                     <FormikForm className="row gy-3">
//                                         <div className="col-xl-12">
//                                             <Form.Label htmlFor="username" className="text-default">Usuario:</Form.Label>
//                                             <Field type="text" name="username" className="form-control"
//                                                 placeholder="Ingrese su usuario"
//                                                 disabled={isDisabled || isSubmitting} />
//                                             <ErrorMessage name="username" component="div" className="text-danger mt-1" />
//                                         </div>
//                                         <Col xl={12} className="mb-2">
//                                             <Form.Label htmlFor="password" className="text-default">Contraseña:</Form.Label>
//                                             <Link href="/reset-password" className="float-end fw-normal text-muted">¿Olvidaste tu contraseña?</Link>
//                                             <div className="position-relative">
//                                                 <Field type={passwordVisible ? "text" : "password"} name="password"
//                                                     className="form-control" placeholder="Ingrese su contraseña"
//                                                     disabled={isDisabled || isSubmitting} />
//                                                 <button type="button"
//                                                     className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y"
//                                                     onClick={() => setPasswordVisible(v => !v)}
//                                                     disabled={isDisabled || isSubmitting}>
//                                                     <i className={`${passwordVisible ? "ri-eye-line" : "ri-eye-off-line"} align-middle`}></i>
//                                                 </button>
//                                             </div>
//                                             <ErrorMessage name="password" component="div" className="text-danger mt-1" />
//                                         </Col>
//                                         {loginError && (
//                                             <div className="col-12">
//                                                 <div className="alert alert-danger py-2" role="alert">
//                                                     <i className="ri-error-warning-line me-2"></i>{loginError}
//                                                 </div>
//                                             </div>
//                                         )}
//                                         <div className="d-grid mt-4">
//                                             {loginSuccess ? (
//                                                 <button type="button" className="btn" disabled style={{
//                                                     backgroundColor: "rgb(40,180,100)", borderColor: "rgb(40,180,100)",
//                                                     color: "white", transition: "0.5s",
//                                                 }}>
//                                                     <i className="ri-check-line me-2"></i>Sesión iniciada
//                                                 </button>
//                                             ) : (
//                                                 <button type="submit" className="btn"
//                                                     disabled={isDisabled || isSubmitting}
//                                                     style={{ backgroundColor: "rgb(32,51,114)", borderColor: "rgb(32,51,114)", color: "white", transition: "0.3s" }}
//                                                     onMouseEnter={e => { if (!isDisabled && !isSubmitting) { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "rgb(32,51,114)"; } }}
//                                                     onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(32,51,114)"; e.currentTarget.style.color = "white"; }}>
//                                                     {isSubmitting || isSubmittingForm
//                                                         ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Iniciando sesión...</>
//                                                         : "INICIAR SESIÓN"}
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <div className="text-center">
//                                             <p className="text-muted mt-3 mb-0">¿No tienes una cuenta? <Link scroll={false} href="/register" className="text-primary">Regístrate</Link></p>
//                                         </div>
//                                         {loginSuccess && <LoginSuccessMessage />}
//                                     </FormikForm>
//                                 )}
//                             </Formik>
//                             )}
//                         </Col>
//                     </Row>
//                 </Col>

//                 <Col xxl={9} xl={8} className="d-xl-block d-none px-0"
//                     style={{ height: "100vh", background: "rgb(14,22,50)", position: "relative", overflow: "hidden" }}>

//                     {/* Círculos decorativos de fondo */}
//                     <div style={{
//                         position: "absolute", width: 600, height: 600, borderRadius: "50%",
//                         border: "1px solid rgba(255,255,255,0.04)",
//                         top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//                     }} />
//                     <div style={{
//                         position: "absolute", width: 400, height: 400, borderRadius: "50%",
//                         border: "1px solid rgba(255,255,255,0.06)",
//                         top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//                     }} />
//                     <div style={{
//                         position: "absolute", width: 200, height: 200, borderRadius: "50%",
//                         border: "1px solid rgba(255,255,255,0.08)",
//                         top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//                     }} />

//                     {/* Glow superior izquierdo */}
//                     <div style={{
//                         position: "absolute", width: 350, height: 350, borderRadius: "50%",
//                         background: "radial-gradient(circle, rgba(32,51,114,0.5) 0%, transparent 70%)",
//                         top: -80, left: -80,
//                     }} />

//                     {/* Glow inferior derecho */}
//                     <div style={{
//                         position: "absolute", width: 300, height: 300, borderRadius: "50%",
//                         background: "radial-gradient(circle, rgba(13,110,253,0.2) 0%, transparent 70%)",
//                         bottom: -60, right: -60,
//                     }} />

//                     {/* Contenido central */}
//                     <div style={{
//                         position: "absolute", top: "50%", left: "50%",
//                         transform: "translate(-50%, -50%)",
//                         textAlign: "center", width: "75%", maxWidth: 680,
//                     }}>
//                         {/* Ícono central */}
//                         <div style={{
//                             display: "inline-flex", alignItems: "center", justifyContent: "center",
//                             width: 72, height: 72, borderRadius: 20,
//                             background: "linear-gradient(135deg, rgb(32,51,114), rgb(13,110,253))",
//                             marginBottom: 28, boxShadow: "0 8px 32px rgba(13,110,253,0.3)",
//                         }}>
//                             <i className="ri-global-line" style={{ fontSize: 34, color: "#fff" }} />
//                         </div>

//                         <h2 style={{
//                             color: "#fff", fontWeight: 700, fontSize: 28,
//                             letterSpacing: 1, marginBottom: 8,
//                         }}>
//                             APP HUB SERVICE
//                         </h2>
//                         <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, letterSpacing: 2, marginBottom: 36 }}>
//                             MARKETPLACE B2B · LATINOAMÉRICA
//                         </p>

//                         {/* Separador */}
//                         <div style={{
//                             width: 48, height: 2, margin: "0 auto 36px",
//                             background: "linear-gradient(90deg, transparent, rgba(13,110,253,0.8), transparent)",
//                         }} />

//                         {/* Stats */}
//                         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
//                             {[
//                                 { icon: "ri-building-2-line", value: "Empresas", desc: "Publica tickets y contrata especialistas TI" },
//                                 { icon: "ri-user-star-line", value: "Especialistas", desc: "Ofrece servicios y gestiona contratos" },
//                                 { icon: "ri-file-list-3-line", value: "Contratos", desc: "Gestiona acuerdos, pagos y entregas en un solo lugar" },
//                             ].map((item, i) => (
//                                 <div key={i} style={{
//                                     background: "rgba(255,255,255,0.04)",
//                                     border: "1px solid rgba(255,255,255,0.08)",
//                                     borderRadius: 14, padding: "20px 16px",
//                                     backdropFilter: "blur(8px)",
//                                 }}>
//                                     <i className={item.icon} style={{ fontSize: 26, color: "rgb(13,110,253)", display: "block", marginBottom: 10 }} />
//                                     <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item.value}</div>
//                                     <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.5 }}>{item.desc}</div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Categorías */}
//                         <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
//                             {[
//                                 "Soporte Técnico", "Desarrollo de Software", "Ciberseguridad",
//                                 "Cloud & Infraestructura", "Redes & Telecomunicaciones", "ERP & Software Empresarial",
//                             ].map((cat, i) => (
//                                 <span key={i} style={{
//                                     background: "rgba(13,110,253,0.12)",
//                                     border: "1px solid rgba(13,110,253,0.25)",
//                                     color: "rgba(255,255,255,0.6)",
//                                     borderRadius: 20, padding: "5px 14px",
//                                     fontSize: 11, letterSpacing: 0.5,
//                                 }}>
//                                     {cat}
//                                 </span>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Footer del panel */}
//                     <div style={{
//                         position: "absolute", bottom: 24, left: 0, right: 0,
//                         textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11,
//                     }}>
//                         © {new Date().getFullYear()} App Hub Service · Todos los derechos reservados
//                     </div>
//                 </Col>
//             </Row>
//         </Fragment>
//     );
// }