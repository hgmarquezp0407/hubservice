import Select, { ActionMeta, MultiValue, Props as SelectProps, SingleValue } from 'react-select';

interface OptionType {
    value: string | number;
    label: string;
    document?: string;
    socialreason?: string;
    documenttype?: string;
    [key: string]: any;
}

interface IPartnerPOS {
    id: number;
    socialreason: string;
    documenttype: string;
    document: string;
    label: string; // Campo concatenado
}

interface SpkSelectProps {
    option?: OptionType[]; // Para opciones tradicionales
    partners?: IPartnerPOS[]; // Para usar directamente IPartnerPOS
    defaultvalue?: OptionType;
    mainClass?: string;
    onfunchange?: (value: SingleValue<any> | MultiValue<any>, actionMeta: ActionMeta<any>) => void;
    // Callback adicional para enviar los datos extra (como el updateClient de Laravel)
    onSelectCallback?: (
        id: number,
        document: string,
        socialreason: string,
        documenttype: string,
        fullPartner?: IPartnerPOS
    ) => void;
    disabled?: boolean;
    getValue?: string | number | null | undefined;
    clearable?: boolean;
    multi?: boolean;
    searchable?: boolean;
    placeholder?: string;
    autofocus?: boolean;
    noOptionsmessage?: any;
    name?: string;
    menuplacement?: any;
    classNameprefix?: string;
    id?: string;
    required?: boolean;
}

const SelectClient: React.FC<SpkSelectProps> = ({ option, partners, menuplacement, id, autofocus, noOptionsmessage, classNameprefix, 
    defaultvalue, mainClass, onfunchange, onSelectCallback, disabled, name, getValue, clearable, multi, searchable, placeholder, required, 
    ...rest 
}) => {
    // Transformar IPartnerPOS[] a OptionType[] si se proporciona partners
    const transformedOptions: OptionType[] = partners 
        ? partners.map(partner => ({
            value: partner.id,
            label: partner.label, // Usa el label ya concatenado
            document: partner.document,
            socialreason: partner.socialreason,
            documenttype: partner.documenttype,
            originalPartner: partner // Guardamos el objeto original
        }))
        : option || [];

    // Encontrar el valor seleccionado actual
    const getSelectedValue = () => {
        if (!getValue) return null;
        
        // Buscar por value, convirtiendo ambos a string para comparación
        return transformedOptions.find(opt => 
            String(opt.value) === String(getValue)
        ) || null;
    };

    const handleChange = (selectedOption: SingleValue<OptionType> | MultiValue<OptionType>,  actionMeta: ActionMeta<OptionType>) => {
        // Llamar al callback original si existe
        if (onfunchange) {
            onfunchange(selectedOption, actionMeta);
        }

        // Llamar al callback adicional con los datos extra (equivalente a updateClient)
        if (onSelectCallback && selectedOption && !Array.isArray(selectedOption)) {
            const option = selectedOption as OptionType;
            
            // Si viene de partners, usar el objeto original, sino usar las propiedades de OptionType
            if (option.originalPartner) {
                const partner = option.originalPartner as IPartnerPOS;
                onSelectCallback(
                    partner.id,
                    partner.document,
                    partner.socialreason,
                    partner.documenttype,
                    partner
                );
            } else {
                onSelectCallback(
                    Number(option.value),
                    option.document || '',
                    option.socialreason || '',
                    option.documenttype || ''
                );
            }
        }
    };

    return (
        <Select name={name} options={transformedOptions} className={mainClass} id={id} onChange={handleChange} isDisabled={disabled} isMulti={multi}
            menuPlacement={menuplacement} classNamePrefix={classNameprefix} defaultValue={defaultvalue} value={getSelectedValue()} isClearable={clearable} 
            isSearchable={searchable} placeholder={placeholder} autoFocus={autofocus} noOptionsMessage={noOptionsmessage} required={required} 
            menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            styles={{
                menuPortal: base => ({
                    ...base,
                    zIndex: 9999,
                }),
            }} 
            {...rest}
        />
    );
};

export default SelectClient;