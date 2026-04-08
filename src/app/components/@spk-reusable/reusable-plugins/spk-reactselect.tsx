import Select, { ActionMeta, MultiValue, Props as SelectProps, SingleValue } from 'react-select';

interface OptionType {
    value: string | number;
    label: string;
}

interface SpkSelectProps {
    option: OptionType[];
    defaultvalue?: OptionType;
    mainClass?: string;
    // onfunchange?: (value: any) => void;
    onfunchange?: (value: SingleValue<any> | MultiValue<any>, actionMeta: ActionMeta<any>) => void;
    disabled?: boolean;
    getValue?: string | number | null;
    clearable?: boolean;
    multi?: boolean;
    searchable?: boolean;
    placeholder?: string;
    autofocus?: boolean;
    noOptionsmessage?: any;
    name?: string
    menuplacement?: any;
    classNameprefix?: string;
    id?: string;
    required?: boolean;
}

const SpkSelect: React.FC<SpkSelectProps> = ({ option, menuplacement, id, autofocus, noOptionsmessage, classNameprefix, defaultvalue, mainClass, onfunchange, disabled, name, getValue, clearable, multi, searchable, placeholder, required, ...rest }) => {

    return (
        <>
            <Select name={name} options={option} className={mainClass} id={id} onChange={onfunchange as SelectProps['onChange']} isDisabled={disabled} isMulti={multi}
                menuPlacement={menuplacement} classNamePrefix={classNameprefix} defaultValue={defaultvalue} value={option.find(opt => opt.value === getValue) || null} isClearable={clearable} isSearchable={searchable} placeholder={placeholder}
                autoFocus={autofocus} noOptionsMessage={noOptionsmessage} required={required} menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                styles={{
                    menuPortal: base => ({
                    ...base,
                    zIndex: 9999, // Puedes ajustarlo si tienes modales encima
                    }),
                }} 
                    {...rest}
            />
        </>
    )
}
export default SpkSelect;