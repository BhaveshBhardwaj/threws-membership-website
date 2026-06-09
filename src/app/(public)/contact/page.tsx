'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { submitContactForm } from '@/actions/contact.actions';
import { ORG } from '@/lib/site-content';
import styles from './page.module.css';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Connect to the actual Server Action for real-time contact notification email dispatching
      const res = await submitContactForm(data);
      if (res.success) {
        toast('success', res.message || 'Message sent successfully! We will get back to you soon.');
        reset();
      } else {
        toast('error', res.error || 'Failed to send your message. Please try again.');
      }
    } catch (error) {
       toast('error', 'An unexpected error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg-primary)' }}>
      
      {/* ---------- Animated Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.glow1} />
          <div className={styles.glow2} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.logoContainer}>
            <div className={styles.logoRing} />
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" stroke="#d4af37" strokeWidth="4" strokeLinejoin="round" />
              <path d="M50 30L72 43V57L50 70L28 57V43L50 30Z" fill="url(#crestGold)" opacity="0.85" />
              <defs>
                <linearGradient id="crestGold" x1="28" y1="30" x2="72" y2="70" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="50%" stopColor="#f3e5ab" />
                  <stop offset="100%" stopColor="#aa7c11" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Questions about membership, research collaboration, conferences, or publication support? Reach our team in Delhi, India.
          </p>
        </div>
      </section>

      {/* ---------- Main Form Section ---------- */}
      <section className={styles.section}>
        <div className={`container ${styles.grid}`}>
          
          {/* Info Card column */}
          <div className={styles.infoCard}>
            <h2>Get in Touch</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem', fontSize: '0.975rem', lineHeight: '1.6' }}>
              Have an academic inquiry or research proposal? Submit the form and a Westbridge Research representative will coordinate with you.
            </p>
            
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Mail size={22} />
              </div>
              <div>
                <h3>Official Communications</h3>
                <p>contact@westbridgeresearch.com</p>
                <p>support@westbridgeresearch.com</p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <MapPin size={22} />
              </div>
              <div>
                <h3>Office</h3>
                <p>Delhi, India</p>
                <p>westbridgeresearch.com</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Phone size={22} />
              </div>
              <div>
                <h3>Administrative Desk</h3>
                <p>{ORG.phone}</p>
                <p>Mon-Fri from 9:00 AM to 6:00 PM (IST)</p>
              </div>
            </div>
          </div>

          {/* Form Card column */}
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Input
                label="Full Name"
                placeholder="Bhavesh Bhardwaj"
                {...register('name')}
                error={errors.name?.message}
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="bhavesh@example.com"
                {...register('email')}
                error={errors.email?.message}
                required
              />
              
              <Input
                label="Subject"
                placeholder="Fellowship Application / Syndicate Proposal"
                {...register('subject')}
                error={errors.subject?.message}
                required
              />
              
              <Textarea
                label="Message Details"
                placeholder="Describe your research areas, academic publication proposals, or general inquiries here..."
                rows={5}
                {...register('message')}
                error={errors.message?.message}
                required
              />
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                loading={isSubmitting}
                style={{
                  backgroundColor: '#d4af37',
                  color: '#0f172a',
                  borderColor: '#d4af37',
                  fontWeight: 750,
                  boxShadow: '0 4px 15px rgba(212,175,55,0.15)',
                  marginTop: '10px'
                }}
              >
                Send Official Message
              </Button>
            </form>
          </div>
          
        </div>
      </section>
    </div>
  );
}
