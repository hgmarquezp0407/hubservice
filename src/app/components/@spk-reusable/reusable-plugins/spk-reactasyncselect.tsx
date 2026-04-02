import AsyncSelect from "react-select/async";
import { ActionMeta, MultiValue, SingleValue } from "react-select";

interface OptionType {
    value: string | number;
    label: string;
}

interface SpkAsyncSelectProps {
    fetchOptions: (inputValue: string) => Promise<OptionType[]>; // Función para cargar opciones dinámicas
    defaultvalue?: OptionType;
    mainClass?: string;
    onfunchange?: (value: SingleValue<OptionType> | MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => void;
    disabled?: boolean;
    getValue?: string | number | null;
    clearable?: boolean;
    multi?: boolean;
    placeholder?: string;
    autofocus?: boolean;
    name?: string;
    menuplacement?: any;
    classNameprefix?: string;
    id?: string;
    required?: boolean;
}

const SpkAsyncSelect: React.FC<SpkAsyncSelectProps> = ({
    fetchOptions, menuplacement, id, autofocus, classNameprefix, defaultvalue, mainClass, onfunchange, disabled, name, getValue, clearable, multi, placeholder, required, ...rest
}) => {

    return (
        <AsyncSelect
            name={name}
            loadOptions={fetchOptions}
            className={mainClass}
            id={id}
            onChange={onfunchange}
            isDisabled={disabled}
            isMulti={multi}
            menuPlacement={menuplacement}
            classNamePrefix={classNameprefix}
            defaultValue={defaultvalue}
            isClearable={clearable}
            placeholder={placeholder}
            autoFocus={autofocus}
            required={required}
            cacheOptions
            defaultOptions // Opcional: cargar opciones iniciales
            value={getValue ? { value: getValue, label: `${getValue}` } : null}
            {...rest}
        />
    );
};

export default SpkAsyncSelect;
