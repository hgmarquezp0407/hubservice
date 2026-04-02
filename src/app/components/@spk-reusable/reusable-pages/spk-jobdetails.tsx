import React from 'react';
import { Card } from 'react-bootstrap';
import Link from 'next/link';
import SpkTooltips from '../reusable-uielements/spk-tooltips';
import SpkBadge from '../reusable-uielements/spk-badge';

interface SpkJobdetailsProps {
    image?: string;
    title?: string;
    company?: string;
    location?: string;
    experience?: string;
    salary?: string;
    color?: string;
    icon?: string;
    cardClass?: string;
    avatarSize?: string;
    Imagetag?: boolean;
    mainClass?: string;
}

const SpkJobdetails: React.FC<SpkJobdetailsProps> = ({ cardClass, avatarSize = 'md', image, title, company, location, experience, salary, color, icon, Imagetag = false, mainClass }) => {
    return (
        <Card className={cardClass}>
            <Card.Body>
                <div className={mainClass}>
                    <div className="d-flex align-items-center">
                        {Imagetag ? <span className={`avatar avatar-${avatarSize} border p-1 me-2`}>
                            <img src={image} alt={title} />
                        </span>
                            :
                            <span className={`avatar avatar-${avatarSize} avatar-rounded bg-${color}-transparent border`}>
                                <i className={icon}></i>
                            </span>
                        }
                    </div>
                    <div className="ms-1 flex-grow-1 w-75 text-truncate">
                        <h6 className="fw-medium mb-0 d-flex align-items-center text-truncate w-75">
                            <Link scroll={false} href="#!">{title}</Link>
                        </h6>
                        <Link scroll={false} href="#!" className="fs-12 text-muted">
                            <i className="bi bi-building"></i> {company}
                        </Link>
                    </div>
                    <div className="ms-auto d-flex gap-1 flex-wrap flex-xxl-nowrap flex-shrink-0">
                        <SpkTooltips placement="top" title="Add to wishlist">
                            <Link scroll={false} href="#!" className="avatar avatar-sm avatar-rounded bg-primary1-transparent">
                                <span><i className="bi bi-heart"></i></span>
                            </Link>
                        </SpkTooltips>
                        <SpkTooltips placement="top" title="Featured Jobs">
                            <Link scroll={false} href="#!" className="avatar avatar-sm avatar-rounded bg-warning-transparent">
                                <span><i className="bi bi-star-fill"></i></span>
                            </Link>
                        </SpkTooltips>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="popular-tags mb-3 d-flex gap-1 flex-wrap flex-xxl-nowrap">
                        <SpkBadge Pill={true} variant='info-transparent'>
                            <i className="bi bi-geo-alt me-1"></i> {location}
                        </SpkBadge>
                        <SpkBadge Pill={true} variant='primary2-transparent'>
                            <i className="bi bi-mortarboard me-1"></i> {experience}
                        </SpkBadge>
                    </div>
                    <h6 className="fw-medium mb-0">{salary}</h6>
                </div>
                <Link scroll={false} href="#!" className="fw-medium btn btn-sm btn-primary d-grid text-nowrap">
                    Apply Now
                </Link>
            </Card.Body>
        </Card>
    );
};

export default SpkJobdetails;
