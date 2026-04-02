import React, { Fragment, useState } from 'react';
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";

interface SpkRatingsIntProps {
    name:       string;
    value:      number | null;
    max?:       number;
    readOnly?:  boolean;
    size?:      'small' | 'medium' | 'large';
    precision?: number;
    onChange?:  (value: number | null) => void;
    label?:     string;
    showBadge?: boolean;
}

const badgeClass = (v: number) =>
    v >= 4 ? "bg-success-transparent" : v >= 3 ? "bg-warning-transparent" : "bg-danger-transparent";

const SpkRatingsInt: React.FC<SpkRatingsIntProps> = ({
    name, value, max = 5, readOnly = false, size = 'medium',
    precision = 1, onChange, label, showBadge = true,
}) => {
    const [hover, setHover] = useState(-1);
    const display = hover !== -1 ? hover : value;

    return (
        <Fragment>
            {label && <label className="form-label form-label-sm mb-1">{label}</label>}
            <div className="d-flex align-items-center gap-2">
                <Box>
                    <Rating
                        name={name}
                        value={value}
                        max={max}
                        size={size}
                        precision={precision}
                        readOnly={readOnly}
                        getLabelText={(v) => `${v}`}
                        onChange={onChange ? (_e, newVal) => onChange(newVal) : undefined}
                        onChangeActive={(_e, newHover) => setHover(newHover)}
                    />
                </Box>
                {showBadge && display !== null && display > 0 && (
                    <span className={`badge ${badgeClass(display)}`}>{display}</span>
                )}
            </div>
        </Fragment>
    );
};

export default SpkRatingsInt;