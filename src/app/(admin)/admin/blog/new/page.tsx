'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('Draft');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the blog post
    console.log({ title, author, status, content });
    router.push('/admin/blog');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Create New Post</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter blog post title"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              placeholder="e.g. Dr. John Doe"
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: 'Draft', value: 'Draft' },
                { label: 'Published', value: 'Published' },
              ]}
            />
          </div>

          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your post content here..."
            rows={15}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>
              Cancel
            </Button>
            <Button type="submit">
              Save Post
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
