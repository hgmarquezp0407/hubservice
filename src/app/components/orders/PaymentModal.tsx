"use client";

import React, { useState, useEffect } from "react";
import { Modal, Nav, Tab } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import SpkButton from "@/app/components/@spk-reusable/reusable-uielements/spk-button";
import { apiFetch } from "@/utils/api";
import { IOrders } from "@/app/interfaces/general_interface";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
    show     : boolean;
    onHide   : () => void;
    onSuccess: () => void;
    order    : IOrders | null;
    urlbase  : string;
}

// Formulario interno de Stripe
function CheckoutForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) {
    const stripe   = useStripe()
    const elements = useElements()
    const [processing, setProcessing] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return
        setProcessing(true)
        try {
            const { error } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            })
            if (error) {
                onError(error.message || "Error al procesar el pago.")
            } else {
                onSuccess()
            }
        } finally {
            setProcessing(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <div className="d-flex justify-content-end mt-4">
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="btn btn-primary waves-light"
                >
                    {processing
                        ? <><span className="spinner-border spinner-border-sm me-2" />Procesando...</>
                        : <><i className="ri-lock-line me-1"></i>Confirmar pago</>
                    }
                </button>
            </div>
        </form>
    )
}

export default function PaymentModal({ show, onHide, onSuccess, order, urlbase }: PaymentModalProps) {
    const [step, setStep]               = useState<"summary" | "payment" | "success">("summary")
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [loadingIntent, setLoadingIntent] = useState(false)
    const [errorMsg, setErrorMsg]         = useState<string | null>(null)

    useEffect(() => {
        if (!show) {
            setStep("summary")
            setClientSecret(null)
            setErrorMsg(null)
        }
    }, [show])

    const handleGoToPayment = async () => {
        if (!order) return
        setLoadingIntent(true)
        setErrorMsg(null)
        try {
            const data = await apiFetch(`${urlbase}/admin/stripe/create-payment-intent?order_id=${order.id}`, {
                method: "POST",
            })
            setClientSecret(data.client_secret)
            setStep("payment")
        } catch (err: any) {
            setErrorMsg(err.message || "Error al iniciar el pago.")
        } finally {
            setLoadingIntent(false)
        }
    }

    const handlePaymentSuccess = () => {
        setStep("success")
        onSuccess()
    }

    if (!order) return null

    const specialistName = order.specialist?.person
        ? `${order.specialist.person.first_name ?? ""} ${order.specialist.person.last_name ?? ""}`.trim()
        : "—"

    const stepIndex = step === "summary" ? "1" : step === "payment" ? "2" : "3"

    return (
        <Modal size="lg" show={show} onHide={onHide} centered className="fade" tabIndex={-1}>
            <Modal.Header>
                <h6 className="modal-title">Pagar Orden</h6>
                <SpkButton Buttonvariant="" Buttontype="button" Customclass="btn-close" Buttondismiss="modal" onClickfunc={onHide} Buttonlabel="Close" />
            </Modal.Header>

            <Modal.Body className="p-0">
                <Tab.Container activeKey={stepIndex}>
                    {/* Steps nav */}
                    <div className="px-4 pt-4">
                        <Nav className="nav nav-tabs nav-justified flex-sm-row flex-column mb-4 tab-style-8 scaleX p-0">
                            <Nav.Item>
                                <Nav.Link eventKey="1" className="icon-btn d-flex align-items-center justify-content-sm-center gap-1">
                                    <i className="ri-file-list-3-line me-1"></i>
                                    <span>Resumen</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="2" className="icon-btn d-flex align-items-center justify-content-sm-center gap-1">
                                    <i className="ri-bank-card-line me-1"></i>
                                    <span>Pago</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="3" className="icon-btn d-flex align-items-center justify-content-sm-center gap-1">
                                    <i className="ri-checkbox-circle-line me-1"></i>
                                    <span>Confirmación</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <Tab.Content className="px-4 pb-4">
                        {/* Paso 1: Resumen */}
                        <Tab.Pane eventKey="1">
                            <div className="mb-3">
                                <h6 className="fw-semibold mb-3">Detalle de la orden</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <tbody>
                                            <tr>
                                                <td className="text-muted" style={{ width: 160 }}>N° Orden</td>
                                                <td className="fw-medium text-primary">{order.order_number}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Especialista</td>
                                                <td className="fw-medium">{specialistName}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Subtotal</td>
                                                <td>${order.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">IGV</td>
                                                <td>
                                                    {order.igv > 0
                                                        ? `$${order.igv.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                                                        : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                            </tr>
                                            <tr className="table-primary">
                                                <td className="fw-semibold">Total a pagar</td>
                                                <td className="fw-bold fs-15">${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} {order.currency_id}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {errorMsg && (
                                    <div className="alert alert-danger py-2 fs-13">
                                        <i className="ri-error-warning-line me-1"></i>{errorMsg}
                                    </div>
                                )}
                            </div>
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-primary waves-light" onClick={handleGoToPayment} disabled={loadingIntent}>
                                    {loadingIntent
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Cargando...</>
                                        : <>Continuar al pago <i className="ri-arrow-right-line ms-1"></i></>
                                    }
                                </button>
                            </div>
                        </Tab.Pane>

                        {/* Paso 2: Pago con Stripe */}
                        <Tab.Pane eventKey="2">
                            <h6 className="fw-semibold mb-3">Datos de pago</h6>
                            <p className="text-muted fs-12 mb-3">
                                <i className="ri-lock-line me-1 text-success"></i>
                                Pago seguro procesado por Stripe. Tus datos están protegidos.
                            </p>
                            {clientSecret && (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        appearance: { theme: "stripe" },
                                    }}
                                >
                                    <CheckoutForm
                                        onSuccess={handlePaymentSuccess}
                                        onError={(msg) => setErrorMsg(msg)}
                                    />
                                </Elements>
                            )}
                            {errorMsg && (
                                <div className="alert alert-danger py-2 fs-13 mt-3">
                                    <i className="ri-error-warning-line me-1"></i>{errorMsg}
                                </div>
                            )}
                            <div className="mt-3">
                                <button className="btn btn-light btn-sm" onClick={() => setStep("summary")}>
                                    <i className="ri-arrow-left-line me-1"></i>Volver
                                </button>
                            </div>
                        </Tab.Pane>

                        {/* Paso 3: Éxito */}
                        <Tab.Pane eventKey="3">
                            <div className="text-center py-4">
                                <div style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    width: 72, height: 72, borderRadius: "50%",
                                    background: "rgba(40,180,100,0.12)", marginBottom: 20,
                                }}>
                                    <i className="ri-check-line" style={{ fontSize: 36, color: "rgb(40,180,100)" }}></i>
                                </div>
                                <h5 className="fw-semibold mb-2">¡Pago realizado con éxito!</h5>
                                <p className="text-muted mb-4">
                                    Tu pago fue procesado correctamente. La factura será generada
                                    automáticamente.
                                </p>
                                <button className="btn btn-primary waves-light" onClick={onHide}>
                                    <i className="ri-check-double-line me-1"></i>Cerrar
                                </button>
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    )
}