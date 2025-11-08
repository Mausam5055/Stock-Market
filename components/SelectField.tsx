/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, Controller, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Option = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  options: readonly Option[];
  control: Control<any>;
  error?: FieldError;
  required?: boolean;
};

export const SelectField = ({
  name,
  label,
  placeholder,
  options,
  control,
  error,
  required = false,
}: SelectFieldProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className='select-trigger'>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600 text-white'>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='focus:bg-gray-600 focus:text-white'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className='text-sm text-red-500'>{error.message}</p>}
    </div>
  );
};
