'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { submitContactForm } from '@/actions/contact.actions';
import styles from './page.module.css';
import { useToast } from '@/components/ui/Toast';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };
    
    const result = await submitContactForm(data);
    
    if (result?.error) {
      toast('error', result.error);
    } else {
      toast('success', 'Message sent successfully. We will be in touch!');
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        name="name"
        required
        placeholder="John Doe"
      />
      <Input
        label="Email Address"
        name="email"
        type="email"
        required
        placeholder="john@example.com"
      />
      <Input
        label="Subject"
        name="subject"
        required
        placeholder="How can we help?"
      />
      <Textarea
        label="Message"
        name="message"
        required
        rows={5}
        placeholder="Your message here..."
      />
      <Button 
        type="submit" 
        className={styles.submitBtn} 
        loading={loading}
        fullWidth
      >
        Send Message
      </Button>
    </form>
  );
}
