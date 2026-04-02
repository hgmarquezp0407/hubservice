export interface SelectOption {
    value: string;
    label: string;
}

// export interface SelectOption {
//     id: string;
//     name: string;
// }

export interface SelectOptionNumber {
    value: number;
    label: string;
}

export interface SelectOptionAdvance {
    id: number;
    name: string;
    code: string;
}

export interface IStateSimple {
    name: string;
    is_default: number
}

export interface IDocumentIdentity {
    id: number;
    name: string;
    description: string
}

export interface IUserCreator {
    id: number;
    username: string;
}
export interface IUserUpdater {
    id: number;
    username: string;
}
export interface IUserDeleter {
    id: number;
    username: string;
}

export interface IDepartment {
    id: string;
    name: string;
}

export interface IProvince {
    id: string;
    name: string;
    department: IDepartment;
}

export interface IDistrict {
    id: string;
    name: string;
    province: IProvince;
}

export interface IPersons {
    id: number;
    names: string;
    lastnames: string;
    identity_document_id: number;
    document_number: string;
    email: string;
    phone: string;
    country_id: string;
    department_id: string;
    province_id: string;
    district_id: string;
    area_id: number;
    charge_id: number;
    created_at: string;
    state_id: string;
    identity_document: IDocumentIdentity;
    district: IDistrict;
    state: IStateSimple;
}

export interface IPerson {
    id: number | null;
    names: string;
    lastnames: string;
    identity_document_id: number | null;
    document_number: string;
    email: string;
    phone: string;
    country_id: string;
    department_id: string;
    province_id: string;
    district_id: string;
    area_id: number | null;
    charge_id: number | null;
}

export interface IPersonUser {
    first_name: string;
    last_name: string;     
    email: string;
}

export interface IRoleSimple {
    id: number,
    name: string,
    description: string,
    state_id: string
}

export interface IUser {
    id: number | null;
    person_id: number | null;
    role_id: number | null;
    username: string;
    password?: string;    
}

export interface IUsers {
    id: number;
    username: string;
    role_id: number;
    created_at: string;
    updated_at?: string | null;
    state: number;
    person: IPersonUser;
    role: IRoleSimple;
}

export interface IRole {
    id: number | null;
    name: string;
    description: string;
}

export interface IRoles {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    state_id: string;
    state: IStateSimple;
}

export interface ICountry {
    id: string;
    name: string;
}


export interface IPersonSimple {
    id: number;
    names: string;
    lastnames: string;
    email: string;
    phone: string | null;
}

export interface ICurrencies {
    id: string;
    name: string;
    symbol: string | null;
    country_id: string | null;
    state: number;
    country: ICountry;
}

export interface ICurrency {
    id: string | null;
    name: string;
    symbol: string;
    country_id: string | null;
}


export interface IFiscalIdType {
    id         : number;
    code       : string;
    name       : string;
    country_id : string;
}

export interface ICountrySimple {
    id   : string;
    name : string;
}

export interface IPrimaryContact {
    id           : string;
    person_type  : string;
    first_name   : string | null;
    last_name    : string | null;
    socialreason : string | null;
    email        : string | null;
    phone        : string | null;
}

export interface ICompanies {
    id                 : string;
    name               : string;
    fiscal_id_type_id  : number | null;
    tax_id             : string | null;
    industry           : string | null;
    country_id         : string;
    primary_contact_id : string | null;
    billing_email      : string | null;
    address            : string | null;
    website            : string | null;
    logo_url           : string | null;
    created_at         : string;
    updated_at         : string | null;
    state              : number;
    country            : ICountrySimple;
    fiscal_id_type     : IFiscalIdType | null;
    primary_contact    : IPrimaryContact | null;
}

export interface ICompany {
    id                 : string | null;
    name               : string;
    fiscal_id_type_id  : number | null;
    tax_id             : string | null;
    industry           : string | null;
    country_id         : string;
    primary_contact_id : string | null;
    billing_email      : string | null;
    address            : string | null;
    website            : string | null;
    logo_url           : string | null;
}

export interface ISkillLevel { 
    id: number; 
    name: string; 
}

export interface IServiceCategories {
    id          : number;
    name        : string;
    slug        : string;
    description : string | null;
    icon        : string | null;
    parent_id   : number | null;
    sort_order  : number;
    state       : number;
}

export interface IServiceCategory {
    id          : number | null;
    name        : string;
    slug        : string;
    description : string;
    icon        : string;
    parent_id   : number | null;
    sort_order  : number;
}

export interface IServiceCategoryMin {
    id   : number;
    name : string;
}

export interface IServices {
    id                      : string;
    service_category_id     : number;
    name                    : string;
    description             : string;
    internal_code           : string;
    sunat_code              : string;
    unit_id                 : string;
    currency_id             : string;
    has_igv                 : number;
    id_sale_affectation_igv : string;
    created_at              : string;
    updated_at              : string | null;
    state                   : number;
    service_category        : IServiceCategoryMin | null;
}

export interface IService {
    id                      : string | null;
    service_category_id     : number | null;
    name                    : string;
    description             : string;
    internal_code           : string;
    sunat_code              : string;
    unit_id                 : string;
    currency_id             : string;
    has_igv                 : number;
    id_sale_affectation_igv : string;
}


export interface ISpecialistSkill { 
    id: string; 
    specialist_id: string; 
    service_category_id: number; 
    skill_level_id: number; 
    state: number; 
    service_category: IServiceCategory; 
    skill_level: ISkillLevel; 
}

export interface ISpecialistCountry { 
    specialist_id: string; 
    country_id: string; 
    country: ICountry; 
}

export interface ITaxDocumentType { 
    id: string; 
    name: string; 
    description: string | null; 
}

export interface ISpecialists {
    id                  : string;
    person_id           : string;
    bio                 : string | null;
    hourly_rate_usd     : number | null;
    linkedin_url        : string | null;
    portfolio_url       : string | null;
    cv_url              : string | null;
    rating_avg          : number;
    total_reviews       : number;
    completed_tickets   : number;
    is_available        : boolean;
    verified_at         : string | null;
    tax_document_type_id: string | null;
    tax_document_number : string | null;
    is_non_resident     : boolean;
    created_at          : string;
    updated_at          : string | null;
    state               : number;
    person              : IPrimaryContact;
    tax_document_type   : ITaxDocumentType | null;
    skills              : ISpecialistSkill[];
    countries           : ISpecialistCountry[];
}


export interface ITicketPriority { 
    id: number; 
    name: string; 
    sorter: number; 
}

export interface ITicketStatus { 
    id: string; 
    name: string; 
}

export interface ITicketService { 
    id: string; 
    name: string; 
}

export interface ITicketCompany { 
    id: string; 
    name: string; 
}

export interface ITicketCountry { 
    id: string; 
    name: string; 
}

export interface ITicketPerson { 
    id: string; 
    first_name: string | null; 
    last_name: string | null; 
}

export interface ITicketSpecialist { 
    id: string; 
    person_id: string; 
    person: ITicketPerson; 
}

export interface ITickets {
    id                : string;
    ticket_number     : string;
    title             : string;
    description       : string;
    ticket_priority_id: number;
    service_id        : string;
    company_id        : string;
    created_by        : string;
    assigned_to       : string | null;
    country_id        : string;
    budget_usd        : number | null;
    sla_deadline      : string | null;
    resolved_at       : string | null;
    created_at        : string;
    updated_at        : string | null;
    ticket_status_id  : string;
    priority          : ITicketPriority;
    service           : ITicketService;
    company           : ITicketCompany;
    country           : ITicketCountry;
    status            : ITicketStatus;
    specialist        : ITicketSpecialist | null;
}


export interface IContractStatus { 
    id: string; 
    name: string; 
}

export interface IContractCompany { 
    id: string; 
    name: string; 
}

export interface IContractSpecialist { 
    id: string; 
    person_id: string; 
    person: ITicketPerson; 
}

export interface IContracts {
    id                  : string;
    ticket_id           : string;
    bid_id              : string;
    company_id          : string;
    specialist_id       : string;
    agreed_price_usd    : number;
    commission_rule_id  : number | null;
    commission_rate     : number;
    commission_usd      : number;
    terms               : string | null;
    started_at          : string | null;
    completed_at        : string | null;
    created_at          : string;
    contract_status_id  : string;
    status              : IContractStatus;
    company             : IContractCompany;
    specialist          : IContractSpecialist | null;
}

export interface IOrderStatus { 
    id: string; 
    name: string; 
}

export interface IOrderCompany { 
    id: string; 
    name: string; 
}

export interface IOrderService { 
    id: string; 
    name: string; 
}

export interface IOrderItem {
    id: string; 
    order_id: string; 
    service_id: string;
    description: string | null; 
    quantity: number;
    unit_price: number; 
    igv_rate: number; 
    igv: number;
    subtotal: number; 
    total: number; 
    notes: string | null; 
    state: number;
    service: IOrderService;
}

export interface IOrders {
    id               : string;
    order_number     : string;
    contract_id      : string;
    company_id       : string;
    specialist_id    : string;
    concept_id       : number;
    currency_id      : string;
    scheduled_start  : string | null;
    scheduled_end    : string | null;
    actual_start     : string | null;
    actual_end       : string | null;
    specialist_notes : string | null;
    company_notes    : string | null;
    subtotal         : number;
    igv_rate         : number;
    igv              : number;
    platform_fee     : number;
    total            : number;
    created_at       : string;
    updated_at       : string | null;
    order_status_id  : string;
    status           : IOrderStatus;
    company          : IOrderCompany;
    specialist       : IContractSpecialist | null;
    items            : IOrderItem[];
}


export interface IInvoiceStatus { 
    id: string; 
    name: string; 
}

export interface IInvoiceService { 
    id: string; 
    name: string; 
}

export interface IInvoiceItem {
    id              : string;
    invoice_id      : string;
    service_id      : string;
    description     : string | null;
    sunat_code      : string | null;
    quantity        : number;
    unitprice       : number;
    unitvalue       : number;
    igv_rate        : number;
    igv             : number;
    subtotal        : number;
    total           : number;
    platform_fee_usd: number;
    state           : number;
    service         : IInvoiceService;
}

export interface IInvoices {
    id                  : string;
    contract_id         : string;
    order_id            : string;
    company_id          : string;
    specialist_id       : string;
    voucher_type_id     : string | null;
    serie               : string | null;
    voucher_number      : number | null;
    currency_id         : string;
    taxed               : number;
    igv_rate            : number;
    igv                 : number;
    subtotal            : number;
    total               : number;
    platform_fee_usd    : number;
    taxable_base_usd    : number;
    specialist_cost_usd : number;
    estimated_ir_usd    : number;
    customer_name       : string | null;
    customer_address    : string | null;
    hash                : string | null;
    cdr_code            : string | null;
    cdr_description     : string | null;
    xml_path            : string | null;
    cdr_path            : string | null;
    date_voucher        : string | null;
    due_date            : string | null;
    paid_at             : string | null;
    related_invoice_id      : string | null;
    ublversion              : string;
    user_id                 : string;
    concept_id              : number;
    operation_type_id       : string | null;
    paymenttype_id          : string | null;
    idexchangerate          : number;
    reason_note_id          : string | null;
    soap_type_id            : string | null;
    related_voucher_type_id : string | null;
    related_serie           : string | null;
    related_voucher_number  : number | null;
    itemscharges            : number;
    itemsdiscounts          : number;
    unaffected              : number;
    exonerated              : number;
    exportation             : number;
    free                    : number;
    totalvalue              : number;
    totalcharges            : number;
    totaldiscounts          : number;
    url_file                : string | null;
    filename                : string | null;
    shippingdate            : string | null;
    cdr_notes               : string | null;
    sunat_response          : any | null;
    notes                   : string | null;
    created_at          : string;
    invoice_status_id   : string;
    status              : IInvoiceStatus;
    items               : IInvoiceItem[];
}

export interface IBidPerson {
    id           : string;
    person_type  : string;
    first_name   : string;
    last_name    : string;
    socialreason : string | null;
    email        : string;
    phone        : string | null;
}

export interface IBidSpecialist {
    id        : string;
    person_id : string;
    person    : IBidPerson;
}

export interface IBidStatus {
    id   : string;
    name : string;
}

export interface IBids {
    id                 : string;
    ticket_id          : string;
    specialist_id      : string;
    proposed_price_usd : number;
    estimated_hours    : number | null;
    proposal           : string;
    bid_status_id      : string;
    expires_at         : string | null;
    created_at         : string;
    status             : IBidStatus | null;
    specialist         : IBidSpecialist | null;
}

export interface IBid {
    id                 : string | null;
    proposed_price_usd : number | null;
    estimated_hours    : number | null;
    proposal           : string;
    expires_at         : string;
}
