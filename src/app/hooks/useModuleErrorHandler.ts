// app/hooks/useModuleErrorHandler.ts

import Swal from "sweetalert2";

interface ErrorData {
    error?: string;
    idrequest?: string;
    detail?: string;
    message?: string;
}

interface ParsedErrorDetail {
    title?: string;
    message?: string;
    type?: "error" | "warning";
    show_contact?: boolean;
}

export const useModuleErrorHandler = () => {
    const handleModuleError = (response: Response, data: ErrorData): boolean => {
        if (response.status === 403 || response.status === 404) {
            let title   = "Error";
            let message = "Error desconocido";
            let icon: "error" | "warning" = "error";
            let footer  = "";

            // Prioridad 1: Campo "error" directo
            if (data.error) {
                message = data.error;
                if (data.idrequest) {
                    footer = `<small>ID Request: ${data.idrequest}</small>`;
                }
            }
            // Prioridad 2: Estructura compleja en "detail"
            else if (data.detail) {
                try {
                    const errorData: ParsedErrorDetail = JSON.parse(data.detail);
                    title   = errorData.title   || title;
                    message = errorData.message || message;
                    icon    = errorData.type === "error" ? "error" : "warning";
                    footer  = errorData.show_contact
                        ? '<a href="/contact-admin">Contactar Administrador</a>'
                        : "";
                } catch {
                    message = data.detail;
                }
            }
            // Prioridad 3: Campo "message"
            else if (data.message) {
                message = data.message;
            }

            Swal.fire({
                title,
                text:              message,
                icon,
                confirmButtonText: "Entendido",
                footer,
            });

            return true;
        }

        return false;
    };

    return { handleModuleError };
};