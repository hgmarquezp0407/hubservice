// BadgeState.jsx
const BadgeState = ({ state }) => {
    const badgeClasses = {
        ACTIVE: "badge bg-success-transparent",
        INACTIVE: "badge bg-danger-transparent",
        PENDING: "badge bg-warning-transparent",
    };

    return (
        <span className={badgeClasses[state?.code] || "badge bg-light"}>
        {state?.name || "Desconocido"}
        </span>
    );
};

export default BadgeState;
