import React, { useState } from 'react';

export interface TimelineAmountItem {
    id:     number;
    amount: number;
}

export interface TimelineItemProps {
    time:        string;
    user:        string;
    action:      React.ReactNode;
    description: string | null;
    filePath:    string | null;
    onFileClick: (path: string) => void;
    // Snapshot del contrato
    // snapshot: {
    //     contract_number:             string | null;
    //     selection_process:           string | null;
    //     contract_subject:            string | null;
    //     contract_date:               string | null;
    //     start_date:                  string | null;
    //     end_date:                    string | null;
    //     duration_months:             number | null;
    //     renewal:                     number | null;
    //     currency_id:                 string | null;
    //     amounts:                     TimelineAmountItem[];
    //     provider_name:               string | null;
    //     contract_type_name:          string | null;
    //     contract_category_name:      string | null;
    //     selection_process_type_name: string | null;
    //     payment_modality_name:       string | null;
    //     responsible_area_name:       string | null;
    //     conformity_area_name:        string | null;
    //     technical_manager_name:      string | null;
    //     administrative_manager_name: string | null;
    //     state_name:                  string | null;
    //     description_contract:        string | null;
    //     impacted_service:            string | null;
    //     notes:                       string | null;
    //     url_file:                    string | null;
    // };
}

export interface TimelineData {
    date:    string;
    color:   string;
    entries: TimelineItemProps[];
}

const val = (v?: string | number | null) =>
    v !== null && v !== undefined && v !== "" ? v : "—";

const Row2 = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="d-flex border-bottom py-1" style={{ fontSize: "0.78rem" }}>
        <div className="text-muted" style={{ minWidth: "45%", maxWidth: "45%" }}>{label}</div>
        <div className="flex-grow-1 fw-medium">{val(value)}</div>
    </div>
);

const SpkTimelineFiles: React.FC<{ timelineData: TimelineData[] }> = ({ timelineData }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const TimelineItem: React.FC<TimelineItemProps & { itemKey: string }> = ({
        time, user, action, description, filePath, onFileClick, itemKey,
    }) => {
        // const isOpen = !!expanded[itemKey];
        // const total  = snapshot.amounts.reduce((s, a) => s + Number(a.amount), 0);

        return (
            <div className="timeline-right">
                <div className="timeline-content">
                    <p className="timeline-date text-muted mb-2">{time}</p>
                    <div className="timeline-box">
                        {/* Header */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <p className="mb-0">
                                <b>{user}</b> {action}
                            </p>
                            {/* <button
                                type="button"
                                className="btn btn-sm btn-light"
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => toggle(itemKey)}
                            >
                                <i className={`ri-${isOpen ? "arrow-up" : "arrow-down"}-s-line me-1`}></i>
                                {isOpen ? "Ocultar" : "Ver snapshot"}
                            </button> */}
                        </div>

                        {/* Motivo */}
                        {description && (
                            <p className="mb-2" style={{ fontSize: "0.82rem" }}>{description}</p>
                        )}

                        {/* Badges resumen */}
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            {/* {snapshot.amounts.length > 0 && (
                                <span className="badge bg-success-transparent" style={{ fontSize: "0.72rem" }}>
                                    <i className="ri-money-dollar-circle-line me-1"></i>
                                    {snapshot.currency_id ?? ""} {total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                                </span>
                            )}
                            {snapshot.start_date && snapshot.end_date && (
                                <span className="badge bg-info-transparent" style={{ fontSize: "0.72rem" }}>
                                    <i className="ri-calendar-2-line me-1"></i>
                                    {snapshot.start_date} — {snapshot.end_date}
                                </span>
                            )} */}
                            {filePath && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary3-light ms-auto"
                                    onClick={() => onFileClick(filePath)}
                                >
                                    <i className="ri-file-pdf-line me-1"></i>Ver documento
                                </button>
                            )}
                        </div>

                        {/* Snapshot expandible */}
                        {/* {isOpen && (
                            <div className="mt-2 p-2 rounded border" style={{ background: "var(--default-background)" }}>
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Identificación
                                        </div>
                                        <Row2 label="N° Contrato"       value={snapshot.contract_number} />
                                        <Row2 label="N° Proceso"        value={snapshot.selection_process} />
                                        <Row2 label="Categoría"         value={snapshot.contract_category_name} />
                                        <Row2 label="Tipo Proceso"      value={snapshot.selection_process_type_name} />
                                        <Row2 label="Tipo Contrato"     value={snapshot.contract_type_name} />
                                        <Row2 label="Objeto"            value={snapshot.contract_subject} />
                                        <Row2 label="Estado"            value={snapshot.state_name} />
                                        <Row2 label="F. Contrato"       value={snapshot.contract_date} />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Proveedor y Gestores
                                        </div>
                                        <Row2 label="Proveedor"             value={snapshot.provider_name} />
                                        <Row2 label="Gestor Técnico"        value={snapshot.technical_manager_name} />
                                        <Row2 label="Gestor Administrativo" value={snapshot.administrative_manager_name} />
                                        <Row2 label="Área Responsable"      value={snapshot.responsible_area_name} />
                                        <Row2 label="Área Conformidad"      value={snapshot.conformity_area_name} />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Vigencia
                                        </div>
                                        <Row2 label="Inicio"           value={snapshot.start_date} />
                                        <Row2 label="Fin"              value={snapshot.end_date} />
                                        <Row2 label="Duración (meses)" value={snapshot.duration_months} />
                                        <Row2 label="Renovación"       value={snapshot.renewal === 1 ? "Sí" : "No"} />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Condiciones Económicas
                                        </div>
                                        <Row2 label="Moneda"       value={snapshot.currency_id} />
                                        <Row2 label="Forma de Pago" value={snapshot.payment_modality_name} />
                                        {snapshot.amounts.length > 0 && (
                                            <div className="mt-1">
                                                <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.78rem" }}>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: "40px" }}>#</th>
                                                            <th>Monto ({snapshot.currency_id ?? "—"})</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {snapshot.amounts.map((a, i) => (
                                                            <tr key={a.id}>
                                                                <td className="text-muted">{i + 1}</td>
                                                                <td className="fw-medium">
                                                                    {Number(a.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="table-light">
                                                        <tr>
                                                            <td className="text-muted fw-semibold">Total</td>
                                                            <td className="fw-semibold">
                                                                {total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {snapshot.description_contract && (
                                        <div className="col-12">
                                            <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Descripción</div>
                                            <div className="p-2 rounded border" style={{ fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>{snapshot.description_contract}</div>
                                        </div>
                                    )}
                                    {snapshot.impacted_service && (
                                        <div className="col-12">
                                            <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Servicio Impactado</div>
                                            <div className="p-2 rounded border" style={{ fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>{snapshot.impacted_service}</div>
                                        </div>
                                    )}
                                    {snapshot.notes && (
                                        <div className="col-12">
                                            <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>Notas</div>
                                            <div className="p-2 rounded border" style={{ fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>{snapshot.notes}</div>
                                        </div>
                                    )}
                                    {snapshot.url_file && (
                                        <div className="col-12">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-info-light"
                                                onClick={() => onFileClick(snapshot.url_file!)}
                                            >
                                                <i className="ri-file-pdf-line me-1"></i>Ver contrato original
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="timeline-container">
            {timelineData.map((day, dayIndex) => (
                <React.Fragment key={dayIndex}>
                    <div className="timeline-end">
                        <span className={`p-1 fs-11 bg-${day.color} text-fixed-white backdrop-blur text-center border border-${day.color} border-opacity-10 rounded-1 lh-1 fw-medium`}>
                            {day.date}
                        </span>
                    </div>
                    <div className="timeline-continue">
                        {day.entries.map((item, itemIndex) => (
                            <TimelineItem
                                key={itemIndex}
                                itemKey={`${dayIndex}-${itemIndex}`}
                                {...item}
                            />
                        ))}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default SpkTimelineFiles;