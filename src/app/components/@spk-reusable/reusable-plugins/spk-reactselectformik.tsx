import { useField } from 'formik';
import { ActionMeta, SingleValue, MultiValue } from 'react-select';
import SpkSelect from './spk-reactselect';

interface OptionType {
  value: string | number;
  label: string;
}

interface SpkSelectFormikProps {
  name:              string;
  option:            OptionType[];
  getValue:          string | number | null;
  placeholder?:      string;
  clearable?:        boolean;
  multi?:            boolean;
  required?:         boolean;
  menuplacement?:    any;
  classNameprefix?:  string;
  searchable?:       boolean;
  autofocus?:        boolean;
  mainClass?:        string;
  noOptionsmessage?: any;
  disabled?:         boolean;
  onChange?:         (selectedOption: SingleValue<OptionType> | MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => void;
}

const SpkSelectFormik: React.FC<SpkSelectFormikProps> = ({
  name,
  option,
  getValue,
  placeholder,
  clearable        = true,
  multi            = false,
  required,
  menuplacement    = 'auto',
  classNameprefix  = 'Select2',
  searchable       = true,
  autofocus        = false,
  mainClass,
  noOptionsmessage,
  disabled,
  onChange,
}) => {
  const [, meta, helpers] = useField(name);
  const { setValue } = helpers;

  const handleChange = (
    selectedOption: SingleValue<OptionType> | MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (multi) {
      setValue(Array.isArray(selectedOption) ? selectedOption.map(o => o.value) : []);
    } else {
      const selected = selectedOption as SingleValue<OptionType>;
      setValue(selected ? selected.value : '');
    }
    onChange?.(selectedOption, actionMeta);
  };

  return (
    <>
      <SpkSelect
        name={name}
        option={option}
        getValue={getValue}
        onfunchange={handleChange}
        placeholder={placeholder}
        clearable={clearable}
        multi={multi}
        required={required}
        menuplacement={menuplacement}
        classNameprefix={classNameprefix}
        searchable={searchable}
        autofocus={autofocus}
        mainClass={mainClass}
        noOptionsmessage={noOptionsmessage}
        disabled={disabled}
      />
      {/* {meta.touched && meta.error && (
        <div className="text-danger small mt-1">{meta.error}</div>
      )} */}
    </>
  );
};

export default SpkSelectFormik;