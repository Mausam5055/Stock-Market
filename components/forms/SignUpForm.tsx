'use client';

import { signUpWithEmail } from '@/lib/actions/auth.actions';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { CountrySelectField } from '@/components/CountrySelectField';
import { SelectField } from '@/components/SelectField';
import { InputField } from '@/components/InputField';
import { FooterLink } from '@/components/FooterLink';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  INVESTMENT_GOALS,
  RISK_TOLERANCE_OPTIONS,
  PREFERRED_INDUSTRIES,
} from '@/lib/constants';

export const SignUpForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      country: 'US',
      investmentGoals: 'Growth',
      riskTolerance: 'Medium',
      preferredIndustry: 'Technology',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await signUpWithEmail(data);
      if (result.success) router.push('/');
    } catch (error) {
      console.error('Sign-up failed:', error);
      toast.error('Sign-up Failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create account. Please try again.',
      });
    }
  };

  return (
    <>
      <h1 className='form-title'>Sign Up & Personalize</h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {/* Full Name */}
        <InputField
          name='fullName'
          label='Full Name'
          placeholder='John Doe'
          register={register}
          error={errors.fullName}
          validation={{
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          }}
        />

        {/* Email */}
        <InputField
          name='email'
          label='Email'
          type='email'
          placeholder='Enter your email'
          register={register}
          error={errors.email}
          validation={{
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i, // This regex checks for a valid email format
              message: 'Invalid email address',
            },
          }}
        />

        {/* Password */}
        <InputField
          name='password'
          label='Password'
          type='password'
          placeholder='Enter a strong password'
          register={register}
          error={errors.password}
          validation={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
        />

        {/* Country */}
        <CountrySelectField
          name='country'
          label='Country'
          control={control}
          error={errors.country}
          required
        />

        {/* Investment Goals */}
        <SelectField
          name='investmentGoals'
          label='Investment Goals'
          placeholder='Select your investment goal'
          options={INVESTMENT_GOALS}
          control={control}
          error={errors.investmentGoals}
          required
        />

        {/* Risk Tolerance */}
        <SelectField
          name='riskTolerance'
          label='Risk Tolerance'
          placeholder='Select your risk level'
          options={RISK_TOLERANCE_OPTIONS}
          control={control}
          error={errors.riskTolerance}
          required
        />

        {/* Preferred Industry */}
        <SelectField
          name='preferredIndustry'
          label='Preferred Industry'
          placeholder='Select your preferred industry'
          options={PREFERRED_INDUSTRIES}
          control={control}
          error={errors.preferredIndustry}
          required
        />

        {/* Submit Button */}
        <Button
          type='submit'
          disabled={isSubmitting}
          className='yellow-btn w-full mt-5'
        >
          {isSubmitting
            ? 'Creating Account...'
            : 'Start Your Investing Journey'}
        </Button>

        {/* Sign In Link */}
        <FooterLink
          text='Already have an account?'
          linkText='Sign in'
          href='/sign-in'
        />
      </form>
    </>
  );
};
