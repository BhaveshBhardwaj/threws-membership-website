'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/Toast';
import { submitApplication } from '@/actions/application.actions';
import type { ApplicationFormData } from '@/types';
import { TierSelector } from '@/components/membership/TierSelector';
import { getTierById } from '@/lib/membership-tiers';
import styles from '@/styles/membership-form.module.css';

const TIER_ID = 'senior';

type DynamicFormFields = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  institution: string;
  designation: string;
  department: string;
  researchAreas: { value: string }[];
  qualifications: string;
  experience: string;
  motivation: string;
  photoUrl: string;
  publications?: string;
  achievements?: string;
  referenceNames?: string;
};

export default function SeniorApplicationPage() {
  const tierObj = getTierById(TIER_ID);
  
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DynamicFormFields>({
    defaultValues: {
      researchAreas: [{ value: '' }],
      photoUrl: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'researchAreas',
  });

  const photoUrl = watch('photoUrl');

  useEffect(() => {
    register('photoUrl');
  }, [register]);

  useEffect(() => {
    if (session?.user) {
      reset({
        fullName: session.user.name || '',
        email: session.user.email || '',
        researchAreas: [{ value: '' }],
        photoUrl: '',
      });
    }
  }, [session, reset]);

  if (!tierObj) return null;

  const onSubmit = async (formData: DynamicFormFields) => {
    setIsSubmitting(true);
    try {
      const payload = {
        type: TIER_ID,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),
        institution: formData.institution.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        researchAreas: formData.researchAreas.map((r) => r.value.trim()).filter(Boolean),
        qualifications: formData.qualifications.trim(),
        experience: formData.experience.trim(),
        motivation: formData.motivation.trim(),
        photoUrl: formData.photoUrl || undefined,
        publications: formData.publications?.trim(),
        achievements: formData.achievements?.trim(),
        referenceNames: formData.referenceNames?.trim(),
      };

      const result = await submitApplication(payload as ApplicationFormData);

      if (result.success) {
        toast('success', result.message || 'Application submitted successfully!');
        setSubmitted(true);
        reset();
      } else {
        toast('error', result.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Application submit error:', err);
      toast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`container ${styles.container}`}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Application Submitted!</h1>
          <p className={styles.description}>
            Thank you for applying for {tierObj.name} Membership at Westbridge Research. Our team will review your
            application and get back to you soon.
          </p>
          <Button variant="primary" onClick={() => setSubmitted(false)}>
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <Link href="/membership" className={styles.backLink}>
            <ArrowLeft size={16} /> All membership tiers
          </Link>
          <div className={styles.badge}>{tierObj.name} Membership</div>
          <h1 className={styles.title}>{tierObj.name} Application</h1>
          <p className={styles.description}>{tierObj.description}</p>
        </div>

        <TierSelector selected={TIER_ID} />

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.fullWidth} style={{ marginBottom: '0.75rem' }}>
                  <ImageUpload
                    value={photoUrl || ''}
                    onChange={(url) => setValue('photoUrl', url)}
                    error={errors.photoUrl?.message}
                  />
                </div>

                <div className={styles.fullWidth}>
                  <Input
                    label="Full Name"
                    placeholder="Jane Doe"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    error={errors.fullName?.message}
                    required
                    readOnly={!!session?.user}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="jane.doe@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                  })}
                  error={errors.email?.message}
                  required
                  readOnly={!!session?.user}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 234 567 890"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^[+]?[\d\s\-(]{7,20}$/, message: 'Invalid phone number' },
                  })}
                  error={errors.phone?.message}
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  error={errors.dateOfBirth?.message}
                  required
                />

                <Select
                  label="Gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                  ]}
                  placeholder="Select gender"
                  {...register('gender', { required: 'Please select a gender' })}
                  error={errors.gender?.message}
                />

                <div className={styles.fullWidth}>
                  <Textarea
                    label="Mailing Address"
                    placeholder="House/Flat No., Street, City, State, PIN/ZIP, Country"
                    rows={3}
                    {...register('address', {
                      required: 'Address is required',
                      minLength: { value: 5, message: 'Please provide a complete address' },
                    })}
                    error={errors.address?.message}
                    required
                  />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Academic & Professional Details</h2>
              <div className={styles.formGrid}>
                <Input
                  label="Institution / Organization"
                  placeholder="University Name"
                  {...register('institution', { required: 'Institution is required' })}
                  error={errors.institution?.message}
                  required
                />

                <Input
                  label="Designation"
                  placeholder="Student / Professor"
                  {...register('designation', { required: 'Designation is required' })}
                  error={errors.designation?.message}
                  required
                />

                <div className={styles.fullWidth}>
                  <Input
                    label="Department / School"
                    placeholder="Department of Computer Science"
                    {...register('department', { required: 'Department is required' })}
                    error={errors.department?.message}
                    required
                  />
                </div>

                <div className={styles.fullWidth}>
                  <label className={styles.fieldLabel}>
                    Research Areas <span className={styles.required}>*</span>
                  </label>
                  <p className={styles.fieldHint}>Add each research area separately (max 10)</p>
                  <div className={styles.researchAreasList}>
                    {fields.map((field, index) => (
                      <div key={field.id} className={styles.researchAreaRow}>
                        <input
                          className={styles.researchAreaInput}
                          placeholder={`Research area ${index + 1}`}
                          {...register(`researchAreas.${index}.value`, { required: 'Research area cannot be empty' })}
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => remove(index)}
                            aria-label="Remove research area"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {fields.length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ value: '' })}
                      >
                        + Add Research Area
                      </Button>
                    )}
                  </div>
                </div>

                <div className={styles.fullWidth}>
                  <Textarea
                    label="Qualifications"
                    placeholder="Ph.D., M.Tech, B.Sc..."
                    rows={3}
                    {...register('qualifications', { required: 'Qualifications are required' })}
                    error={errors.qualifications?.message}
                    required
                  />
                </div>

                <div className={styles.fullWidth}>
                  <Textarea
                    label="Experience"
                    placeholder="Briefly describe your experience..."
                    rows={3}
                    {...register('experience', { required: 'Experience is required' })}
                    error={errors.experience?.message}
                    required
                  />
                </div>

                <div className={styles.fullWidth}>
                  <Textarea
                    label="Key Publications"
                    placeholder="List your major publications..."
                    rows={4}
                    {...register('publications', { required: 'Publications are required for this tier' })}
                    error={errors.publications?.message}
                    required={true}
                  />
                </div>


                <div className={styles.fullWidth}>
                  <Textarea
                    label="Significant Achievements"
                    placeholder="Awards, grants, notable projects..."
                    rows={4}
                    {...register('achievements', { required: 'Achievements are required for this tier' })}
                    error={errors.achievements?.message}
                    required
                  />
                </div>


              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Statement of Motivation</h2>
              <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                   <Textarea
                    label={`Why do you want to join as a ${tierObj.name}?`}
                    placeholder="Describe your motivation..."
                    rows={5}
                    {...register('motivation', {
                      required: 'Motivation statement is required',
                      minLength: { value: 20, message: 'Motivation must be at least 20 characters' },
                    })}
                    error={errors.motivation?.message}
                    required
                  />
                </div>
              </div>
            </section>

            <div className={styles.formActions}>
              <p className={styles.disclaimer}>
                By submitting this application, you confirm that all information provided is accurate
                and complete.
              </p>
              <Button type="submit" variant="primary" size="lg" loading={isSubmitting} fullWidth>
                {isSubmitting ? 'Submitting Application...' : `Submit ${tierObj.name} Application`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
