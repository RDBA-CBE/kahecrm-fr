import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomeDatePicker = (props: any) => {
    const { value, onChange, title, name, required, className, error, placeholder, minDate, ...rest } = props;

    const CustomInput = ({ value, onClick }: any) => (
        <input
            className={`form-input w-full ${className} ${error ? 'border-red-500' : ''}`}
            onClick={onClick}
            value={value}
            readOnly
            style={{ width: '100%' }}
            placeholder={placeholder ? placeholder : 'Follow Up Date'}
        />
    );

    return (
        <div className="w-full">
            {title && (
                <label className="block text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="w-full">
                <DatePicker
                    selected={value}
                    onChange={onChange}
                    showTimeSelect
                    dateFormat="Pp"
                    name={name}
                    isClearable={value ? true : false}
                    shouldCloseOnSelect={true}
                    customInput={<CustomInput />}
                    required={required}
                    minDate={minDate ? minDate : null}
                    popperClassName="z-9999"
                    portalId="root-portal"
                    {...rest}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CustomeDatePicker;
