import React from "react";
import { Pagination } from "react-bootstrap";

interface PaginatorCenteredProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginatorCentered: React.FC<PaginatorCenteredProps> = ({ currentPage, totalPages, onPageChange }) => {
    const renderPages = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 10) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Primeras 3 páginas
            for (let i = 1; i <= 3; i++) pages.push(i);

            // Puntos suspensivos si currentPage está lejos de las primeras
            if (currentPage > 5) pages.push("...");

            // Páginas alrededor del currentPage
            const start = Math.max(4, currentPage - 1);
            const end = Math.min(totalPages - 3, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            // Puntos suspensivos si currentPage está lejos del final
            if (currentPage < totalPages - 4) pages.push("...");

            // Últimas 3 páginas
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        }

        return pages.map((item, idx) =>
            item === "..." ? (
                <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
            ) : (
                <Pagination.Item key={item} active={item === currentPage} onClick={() => onPageChange(Number(item))}>
                    {item}
                </Pagination.Item>
            )
        );
    };

    return (
        <nav aria-label="Page navigation" className="pagination-style-4 mt-3">
            <Pagination className="pagination text-center justify-content-center gap-1">
                <Pagination.Item disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                    Atrás
                </Pagination.Item>

                {renderPages()}

                <Pagination.Item 
                    className="pagination-next" 
                    disabled={currentPage === totalPages} 
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Siguiente
                </Pagination.Item>
            </Pagination>
        </nav>
    );
};

export default PaginatorCentered;