'use client';

import { signInWithEmail } from '@/lib/actions/auth.actions';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/InputField';
import { FooterLink } from '@/components/FooterLink';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const SignInForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // when a user leaves a field (clicks or tabs away)
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);
      if (result.success) router.push('/');
    } catch (error) {
      console.error('Sign-in failed:', error);
      toast.error('Sign-in Failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <div className='flex h-full flex-col justify-center w-full'>
      <h1 className='form-title'>Sign In</h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
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
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          }}
        />

        {/* Password */}
        <InputField
          name='password'
          label='Password'
          type='password'
          placeholder='Enter your password'
          register={register}
          error={errors.password}
          validation={{
            required: 'Password is required',
          }}
        />

        {/* Submit Button */}
        <Button
          type='submit'
          disabled={isSubmitting}
          className='yellow-btn w-full mt-5'
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Sign Up Link */}
        <FooterLink
          text="Don't have an account?"
          linkText='Sign up'
          href='/sign-up'
        />
      </form>
    </div>
  );
};
