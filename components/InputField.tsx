/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormRegister, FieldError, RegisterOptions } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormInputProps = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  validation?: RegisterOptions;
  disabled?: boolean;
  value?: string;
};

export const InputField = ({
  name,
  label,
  placeholder,
  type = 'text',
  register,
  error,
  validation,
  disabled,
  value,
}: FormInputProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        className={cn('form-input', {
          'opacity-50 cursor-not-allowed!': disabled,
        })}
        {...register(name, validation)}
      />
      {error && <p className='text-sm text-red-500'>{error.message}</p>}
    </div>
  );
};
