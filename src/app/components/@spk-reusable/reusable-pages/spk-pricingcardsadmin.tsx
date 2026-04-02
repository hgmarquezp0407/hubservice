import React, { Fragment } from 'react'
import { Card } from 'react-bootstrap'
import SpkButton from '../reusable-uielements/spk-button'
import SpkBadge from '../reusable-uielements/spk-badge';


interface Pricing {
    planType?: string;
    landing?: boolean;
    card: any;
}

const SpkPricingcardsAdmin: React.FC<Pricing> = ({ planType, landing = false, card }) => {
    return (
        <Fragment>
            <Card className={`custom-card pricing-card ${card.Customclass}`}>
                {/* {card.Ribbon ?
                    <div className="pricing-table-item-icon">
                        <i className="fe fe-zap me-2"></i> Popular
                    </div> : ""} */}
                <Card.Body className={`border-bottom border-block-end-dashed ${card.Mainclass} ${landing ? " p-4" : "p-3"}`}>
                    <h6 className={`fw-medium mb-1`}>{card.name}</h6>
                    <h2 className={`fw-semibold d-block ${landing ? "mb-1" : "mb-3"}`}>
                        {planType == "monthly" ? card.price : card.yearprice}
                        <span className="fs-12 fw-medium ms-1 op-8"> / {planType == "monthly" ? "Mes" : "Año"}</span>
                    </h2>
                    <span className={`d-block fs-11 ${card.descriptionclass}`}> prueba dakljdlaj cdas</span>
                </Card.Body>
                <Card.Body className={`${landing ? " p-4" : "p-3"}${card.Custombodyclass}`}>
                    <ul className="list-unstyled pricing-body">
                        {/* {card.features.map((item: any, index: any) => ( */}
                            <li>
                                <div className="d-flex align-items-center">
                                    <span className="avatar avatar-xs svg-success">
                                        <i className={`ti ti-circle-arrow-right-filled text-primary fs-18`}></i>
                                    </span>
                                    <span className="ms-2 my-auto flex-fill">Usuarios: { card.limit_users == 0 ? "Ilimitado" : card.limit_users }</span>
                                </div>
                            </li>
                            <li>
                                <div className="d-flex align-items-center">
                                    <span className="avatar avatar-xs svg-success">
                                        <i className={`ti ti-circle-arrow-right-filled text-primary fs-18`}></i>
                                    </span>
                                    <span className="ms-2 my-auto flex-fill">Comprobantes: { card.limit_documents == 0 ? "Ilimitado" : card.limit_documents }</span>
                                </div>
                            </li>
                            <li>
                                <div className="d-flex align-items-center">
                                    <span className="avatar avatar-xs svg-success">
                                        <i className={`ti ti-circle-arrow-right-filled text-primary fs-18`}></i>
                                    </span>
                                    <span className="ms-2 my-auto flex-fill">Establecimientos: { card.establishments_unlimited == 0 ? card.establishments_limit : "Ilimitado" }</span>
                                </div>
                            </li>
                            <li>
                                <div className="d-flex align-items-center">
                                    <span className="avatar avatar-xs svg-success">
                                        <i className={`ti ti-circle-arrow-right-filled text-primary fs-18`}></i>
                                    </span>
                                    <span className="ms-2 my-auto flex-fill">Ventas: { card.sales_unlimited == 0 ? card.sales_limit : "Ilimitado" }</span>
                                </div>
                            </li>
                        {/* ))} */}
                    </ul>
                </Card.Body>
            </Card>
        </Fragment>
    )
}

export default SpkPricingcardsAdmin