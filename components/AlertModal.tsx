'use client';

import { useForm } from 'react-hook-form';
import { InputField } from '@/components/InputField';
import { SelectField } from '@/components/SelectField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ALERT_TYPE_OPTIONS } from '@/lib/constants';
import { createAlert, updateAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';

export const AlertModal = ({
  alertId,
  action = 'create',
  alertData,
  open,
  setOpen,
}: AlertModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AlertData>({
    defaultValues: {
      symbol: alertData?.symbol || '',
      company: alertData?.company || '',
      alertName: alertData?.alertName || '',
      alertType: alertData?.alertType || 'upper',
      threshold: alertData?.threshold || '',
    },
  });

  const onSubmit = async (data: AlertData) => {
    try {
      const alertData = {
        symbol: data.symbol.toUpperCase(),
        company: data.company,
        alertName: data.alertName,
        alertType: data.alertType,
        threshold: data.threshold,
      };

      const result =
        action === 'update' && alertId
          ? await updateAlert(alertId, alertData)
          : await createAlert(alertData);

      if (result.success) {
        setOpen(false);
        reset();
        toast.success(`Alert ${action === 'update' ? 'updated' : 'created'}!`);
      }
    } catch {
      toast.error(`Failed to ${action} alert. Try again.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='alert-dialog'>
        <DialogHeader>
          <DialogTitle className='alert-title'>
            {action === 'update' ? 'Update Alert' : 'Add Alert'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <InputField
            name='alertName'
            label='Alert Name'
            placeholder='Ex: Apple Price Alert'
            register={register}
            error={errors.alertName}
            validation={{ required: 'Alert name is required' }}
          />

          <div className='cursor-not-allowed'>
            <InputField
              name='stockIdentifier'
              label='Stock Identifier'
              value={`${alertData?.company} (${alertData?.symbol})`}
              disabled
              register={register}
              placeholder=''
            />
          </div>

          <SelectField
            name='alertType'
            label='Alert Type'
            placeholder='Select alert type'
            options={ALERT_TYPE_OPTIONS}
            control={control}
            error={errors.alertType}
            required
          />

          <InputField
            name='threshold'
            label='Threshold Value'
            placeholder={alertData?.threshold.toString() || '0.00'}
            register={register}
            error={errors.threshold}
            validation={{
              required: 'Threshold value is required',
            }}
          />

          <Button
            type='submit'
            disabled={isSubmitting}
            className='yellow-btn w-full mt-5'
          >
            {isSubmitting
              ? `${action === 'update' ? 'Updating' : 'Creating'}...`
              : `${action === 'update' ? 'Update' : 'Create'} Alert`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
