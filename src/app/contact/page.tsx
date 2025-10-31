'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="container-narrow section-padding">
          <div className="text-center py-16">
            <div className="success-icon mx-auto mb-8">
              ✓
            </div>
            <h1 className="text-hero text-ink mb-6">Thank you!</h1>
            <p className="text-deck text-muted mb-8">
              Your message has been sent successfully. We'll get back to you soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-narrow section-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-hero text-ink mb-6">Get in Touch</h1>
          <p className="text-deck text-muted max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <div className="field-error">{errors.name}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="field-error">{errors.email}</div>
              )}
            </div>

            {/* Message Field */}
            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`form-input resize-none ${errors.message ? 'error' : ''}`}
                placeholder="Tell us about your project, question, or how we can help..."
                disabled={isSubmitting}
              />
              {errors.message && (
                <div className="field-error">{errors.message}</div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="generating-spinner w-5 h-5"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Contact Info */}
        <div className="max-w-2xl mx-auto mt-16 pt-16 border-t border-subtle">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-ink mb-4">
              Other Ways to Reach Us
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📧</span>
                </div>
                <h3 className="font-semibold text-ink mb-2">Email</h3>
                <p className="text-muted">hello@hushh.ai</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">💬</span>
                </div>
                <h3 className="font-semibold text-ink mb-2">Support</h3>
                <p className="text-muted">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
