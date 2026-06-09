'use client';

import React, { useEffect, useState } from 'react';
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

const TIER_ID = 'student';

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

export default function StudentApplicationPage() {
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
        toast('success', result.message || 'Application submitted successfully.');
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
          <div className={styles.successIcon}>OK</div>
          <h1 className={styles.title}>Application Submitted</h1>
          <p className={styles.description}>
            Thank you for applying for {tierObj.name} membership. Our team will review your application and contact you soon.
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
                  <ImageUpload value={photoUrl || ''} onChange={(url) => setValue('photoUrl', url)} error={errors.photoUrl?.message} />
                </div>
                <div className={styles.fullWidth}>
                  <Input label="Full Name" placeholder="Jane Doe" {...register('fullName', { required: 'Full name is required' })} error={errors.fullName?.message} required readOnly={!!session?.user} />
                </div>
                <Input label="Email Address" type="email" placeholder="jane.doe@example.com" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' } })} error={errors.email?.message} required readOnly={!!session?.user} />
                <Input label="Phone Number" type="tel" placeholder="+1 234 567 890" {...register('phone', { required: 'Phone number is required', pattern: { value: /^[+]?[\d\s\-(]{7,20}$/, message: 'Invalid phone number' } })} error={errors.phone?.message} required />
                <Input label="Date of Birth" type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })} error={errors.dateOfBirth?.message} required />
                <Select label="Gender" {...register('gender', { required: 'Gender is required' })} error={errors.gender?.message} required options={[{ value: '', label: 'Select gender' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }, { value: 'prefer-not-to-say', label: 'Prefer not to say' }]} />
                <div className={styles.fullWidth}>
                  <Textarea label="Address" rows={3} placeholder="Full postal address" {...register('address', { required: 'Address is required' })} error={errors.address?.message} required />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Academic Information</h2>
              <div className={styles.formGrid}>
                <Input label="University / College" placeholder="University Name" {...register('institution', { required: 'Institution is required' })} error={errors.institution?.message} required />
                <Input label="Designation" placeholder="Student, Research Assistant, etc." {...register('designation', { required: 'Designation is required' })} error={errors.designation?.message} required />
                <Input label="Department" placeholder="Department or faculty" {...register('department', { required: 'Department is required' })} error={errors.department?.message} required />
                <Input label="Qualifications" placeholder="Current degree or completed qualifications" {...register('qualifications', { required: 'Qualifications are required' })} error={errors.qualifications?.message} required />
                <div className={styles.fullWidth}>
                  <Textarea label="Relevant Coursework or Project Experience" rows={4} placeholder="Research internships, academic projects, or technical experience" {...register('experience', { required: 'Experience is required' })} error={errors.experience?.message} required />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Research Areas</h2>
              <div className={styles.dynamicList}>
                {fields.map((field, index) => (
                  <div key={field.id} className={styles.dynamicItem}>
                    <Input label={index === 0 ? 'Research Area' : undefined} placeholder="AI, Sustainability, Education Technology, etc." {...register(`researchAreas.${index}.value`, { required: 'Research area is required' })} error={errors.researchAreas?.[index]?.value?.message} required />
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ value: '' })}>
                  Add Research Area
                </Button>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Supporting Details</h2>
              <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                  <Textarea label="Brief Statement of Research Interest" rows={5} placeholder="Why do you want to join this membership track? What are your research goals?" {...register('motivation', { required: 'Statement of Research Interest is required' })} error={errors.motivation?.message} required />
                </div>
                <Textarea label="Publications (Optional)" rows={4} placeholder="Relevant papers, presentations, or reports" {...register('publications')} error={errors.publications?.message} />
                <Textarea label="Achievements (Optional)" rows={4} placeholder="Awards, milestones, scholarships, or notable outcomes" {...register('achievements')} error={errors.achievements?.message} />
                <div className={styles.fullWidth}>
                  <Textarea label="References (Optional)" rows={3} placeholder="Names of faculty, supervisors, or professional references" {...register('referenceNames')} error={errors.referenceNames?.message} />
                </div>
              </div>
            </section>

            <div className={styles.actions}>
              <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
