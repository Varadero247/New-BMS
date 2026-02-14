import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FormGroup, FormField, FormError, FormActions } from './form';
import { Input } from './input';
import { Button } from './button';

const meta: Meta = {
  title: 'Components/Form',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const FormGroupDefault: Story = {
  render: () => (
    <FormGroup title="Personal Information" description="Enter your basic details">
      <FormField label="Full Name" required={true}>
        <Input placeholder="John Doe" />
      </FormField>
      <FormField label="Email" required={true}>
        <Input type="email" placeholder="john@example.com" />
      </FormField>
    </FormGroup>
  ),
};

export const FormGroupWithColumns: Story = {
  render: () => (
    <FormGroup title="Address" description="Enter your address details" columns={2}>
      <FormField label="Street Address" required={true}>
        <Input placeholder="123 Main St" />
      </FormField>
      <FormField label="City" required={true}>
        <Input placeholder="New York" />
      </FormField>
      <FormField label="State" required={true}>
        <Input placeholder="NY" />
      </FormField>
      <FormField label="ZIP Code" required={true}>
        <Input placeholder="10001" />
      </FormField>
    </FormGroup>
  ),
};

export const FormFieldBasic: Story = {
  render: () => (
    <FormField label="Username" required={true}>
      <Input placeholder="Enter username" />
    </FormField>
  ),
};

export const FormFieldWithHint: Story = {
  render: () => (
    <FormField label="Password" required={true} hint="Must be at least 8 characters">
      <Input type="password" placeholder="Enter password" />
    </FormField>
  ),
};

export const FormFieldWithError: Story = {
  render: () => (
    <FormField label="Email" required={true} error="Invalid email format">
      <Input type="email" placeholder="john@example.com" style={{ borderColor: '#DC2626' }} />
    </FormField>
  ),
};

export const FormFieldOptional: Story = {
  render: () => (
    <FormField label="Phone Number">
      <Input type="tel" placeholder="(555) 123-4567" />
    </FormField>
  ),
};

export const FormError: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <FormError message="This field is required" />
      <FormError message="Username already exists" />
      <FormError message="Password does not match" />
    </div>
  ),
};

export const FormActions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Right Aligned (Default)</h4>
        <FormActions>
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Save</Button>
        </FormActions>
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Left Aligned</h4>
        <FormActions align="left">
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Save</Button>
        </FormActions>
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Space Between</h4>
        <FormActions align="between">
          <Button variant="outline">Delete</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline">Cancel</Button>
            <Button variant="default">Save</Button>
          </div>
        </FormActions>
      </div>
    </div>
  ),
};

export const CompleteForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      email: '',
      firstName: '',
      lastName: '',
      bio: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      alert('Form submitted successfully!');
    };

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <FormGroup title="Profile Setup" description="Tell us about yourself">
          <FormField label="Email" required={true} error={errors.email}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={errors.email ? { borderColor: '#DC2626' } : {}}
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="First Name" required={true} error={errors.firstName}>
              <Input
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                style={errors.firstName ? { borderColor: '#DC2626' } : {}}
              />
            </FormField>
            <FormField label="Last Name" required={true} error={errors.lastName}>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                style={errors.lastName ? { borderColor: '#DC2626' } : {}}
              />
            </FormField>
          </div>
          <FormField label="Bio" hint="Max 500 characters">
            <textarea
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '100px',
              }}
            />
          </FormField>
        </FormGroup>
        <FormActions>
          <Button variant="outline" type="button">Cancel</Button>
          <Button variant="default" type="submit">Create Profile</Button>
        </FormActions>
      </form>
    );
  },
};

export const MultiColumnForm: Story = {
  render: () => (
    <form style={{ maxWidth: '600px' }}>
      <FormGroup title="Account Settings" columns={2}>
        <FormField label="Company Name" required={true}>
          <Input placeholder="Acme Corp" />
        </FormField>
        <FormField label="Industry" required={true}>
          <Input placeholder="Technology" />
        </FormField>
        <FormField label="Website" hint="Include protocol (https://)">
          <Input placeholder="https://example.com" type="url" />
        </FormField>
        <FormField label="Employees" required={true}>
          <Input placeholder="50-100" type="number" />
        </FormField>
        <FormField label="Address" fullWidth={true}>
          <Input placeholder="123 Business Ave" />
        </FormField>
      </FormGroup>
      <FormActions>
        <Button variant="outline">Cancel</Button>
        <Button variant="default">Save Changes</Button>
      </FormActions>
    </form>
  ),
};

export const FormWithValidation: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleEmailChange = (value: string) => {
      setEmail(value);
      if (value && !value.includes('@')) {
        setEmailError('Please enter a valid email');
      } else {
        setEmailError('');
      }
    };

    return (
      <FormField
        label="Email Address"
        required={true}
        error={emailError}
      >
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          style={emailError ? { borderColor: '#DC2626' } : {}}
        />
      </FormField>
    );
  },
};
