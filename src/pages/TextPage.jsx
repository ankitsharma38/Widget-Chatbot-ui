import React from 'react'
import ContactFormCard from '../components/forms/ContactFormCard'

const textFields = [
  [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
  ],
  [{ name: 'phone', label: 'Cell Phone *', type: 'tel' }],
  [{ name: 'message', label: 'Message *', type: 'textarea' }],
]

const TextPage = () => {
  return <ContactFormCard title="Send us a text" fields={textFields} />
}

export default TextPage
