import React from 'react'

const ContactFormCard = ({ title, fields }) => {
  const textareaRows = title === 'Send us an email' ? 4 : 3

  return (
    <div className="h-full w-full overflow-y-auto bg-white text-gray-800">
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-xs text-gray-500">We'll get back to you shortly.</p>
      </div>

      <form className="px-4 py-3 space-y-3">
        {fields.map((row, rowIdx) => (
          <div key={rowIdx} className={`grid gap-3 ${row.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {row.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-gray-600">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={textareaRows}
                    placeholder="Enter your message…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-100 resize-none transition"
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.label.replace(' *', '')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-100 transition"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
          By submitting, you agree to be contacted using automated technology. Msg & data rates may apply. Text STOP to cancel.
        </p>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-green-700 hover:bg-green-800 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default ContactFormCard
