import React from 'react'
import ContactFormCard from '../components/forms/ContactFormCard'

const callFields = [
  [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
  ],
  [{ name: 'phone', label: 'Cell Phone *', type: 'tel' }],
  [{ name: 'message', label: 'Message *', type: 'textarea' }],
]

const CallPage = () => {
  return <ContactFormCard title="Request a callback" fields={callFields} />
}

export default CallPage
