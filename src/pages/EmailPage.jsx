import React from 'react'
import ContactFormCard from '../components/forms/ContactFormCard'

const emailFields = [
  [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
  ],
  [{ name: 'email', label: 'Email Address *', type: 'email' }],
  [{ name: 'phone', label: 'Cell Phone *', type: 'tel' }],
  [{ name: 'subject', label: 'Subject *', type: 'text' }],
  [{ name: 'message', label: 'Message *', type: 'textarea' }],
]

const EmailPage = () => {
  return <ContactFormCard title="Send us an email" fields={emailFields} />
}

export default EmailPage
