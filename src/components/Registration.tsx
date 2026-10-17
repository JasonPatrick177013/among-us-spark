import { useState, type CSSProperties, type FormEvent } from 'react'
import { CircleCheck, ExternalLink, Info, Send, TriangleAlert } from 'lucide-react'
import { eventConfig } from '../config/event'
import { validateRegistration, type RegistrationErrors, type RegistrationValues } from '../lib/validation'
import { Cadet } from './art/Cadet'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

type Status = 'idle' | 'submitting' | 'demo-ok' | 'sent' | 'failed'

const empty: RegistrationValues = { name: '', email: '', username: '', team: '' }

type FieldProps = {
  name: keyof RegistrationValues
  label: string
  type?: string
  autoComplete?: string
  hint?: string
  optional?: boolean
  value: string
  error?: string
  onChange: (value: string) => void
}

function Field({ name, label, type = 'text', autoComplete, hint, optional, value, error, onChange }: FieldProps) {
  const id = `field-${name}`
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between font-display font-semibold">
        {label}
        {optional && <span className="readout text-mute">Optional</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border-2 bg-void px-4 py-3 text-base text-cream placeholder:text-mute/60 ${
          error ? 'border-sus' : 'border-line hover:border-mute focus:border-gold'
        }`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-sus">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

/** What the built-in form is actually doing right now, said plainly. */
function ModeNotice() {
  const { endpoint } = eventConfig.registration
  return (
    <div className="mt-8 flex gap-3 rounded-2xl border border-gold/50 bg-gold/10 p-4 text-sm">
      <Info size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
      <p className="text-cream">
        {endpoint ? (
          <>Your entry is sent to the organizers' form service when you submit.</>
        ) : (
          <>
            <strong>Demo mode.</strong> This form checks your answers, but it is not connected to a registration service.
            Nothing you type is saved or sent anywhere.
          </>
        )}
      </p>
    </div>
  )
}

function RegistrationForm() {
  const { endpoint } = eventConfig.registration
  const [values, setValues] = useState<RegistrationValues>(empty)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  const setField = (key: keyof RegistrationValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    // Clear that field's error as soon as the person starts fixing it.
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validateRegistration(values)
    setErrors(found)
    const firstBad = (Object.keys(found) as (keyof RegistrationValues)[])[0]
    if (firstBad) {
      setStatus('idle')
      document.getElementById(`field-${firstBad}`)?.focus()
      return
    }

    if (!endpoint) {
      setStatus('demo-ok') // Honest result: checked, but NOT stored.
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(`Request failed with ${res.status}`)
      setStatus('sent')
      setValues(empty)
    } catch {
      setStatus('failed')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <CircleCheck size={40} className="text-lime" aria-hidden="true" />
        <h3 className="text-3xl font-bold">Entry received</h3>
        <p className="text-mute">Your details were sent to the organizers. Watch your inbox for what happens next.</p>
        <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
          Submit another entry
        </button>
      </div>
    )
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {errorCount > 0 && (
        <p role="alert" className="rounded-xl border border-sus bg-sus/10 px-4 py-3 text-sm text-cream">
          {errorCount === 1 ? 'One field needs attention.' : `${errorCount} fields need attention.`} Fix them below and try again.
        </p>
      )}

      <Field name="name" label="Player name" autoComplete="name" value={values.name} error={errors.name} onChange={setField('name')} />
      <Field name="email" label="Email address" type="email" autoComplete="email" value={values.email} error={errors.email} onChange={setField('email')} />
      <Field
        name="username"
        label="Preferred username"
        autoComplete="username"
        hint="Letters, numbers, dashes and underscores. 3 to 20 characters."
        value={values.username}
        error={errors.username}
        onChange={setField('username')}
      />
      <Field name="team" label="Team name" optional value={values.team} error={errors.team} onChange={setField('team')} />

      <button type="submit" className="btn btn-primary mt-2" disabled={status === 'submitting'}>
        <Send size={18} aria-hidden="true" />
        {status === 'submitting' ? 'Sending…' : endpoint ? 'Submit registration' : 'Check my entry'}
      </button>

      <div aria-live="polite">
        {status === 'demo-ok' && (
          <p className="flex gap-3 rounded-xl border border-sky/60 bg-sky/10 p-4 text-sm">
            <CircleCheck size={20} className="mt-0.5 shrink-0 text-sky" aria-hidden="true" />
            <span>
              Your answers look valid, but <strong>you are not registered</strong>. This is a demo form, so nothing was saved or
              sent. Real sign-up opens once the organizers connect a registration service.
            </span>
          </p>
        )}
        {status === 'failed' && (
          <p role="alert" className="flex gap-3 rounded-xl border border-sus bg-sus/10 p-4 text-sm">
            <TriangleAlert size={20} className="mt-0.5 shrink-0 text-sus" aria-hidden="true" />
            <span>Something went wrong and your entry was not sent. Check your connection and try again.</span>
          </p>
        )}
      </div>

      <ModeNotice />
    </form>
  )
}

export function Registration() {
  const { externalFormUrl } = eventConfig.registration

  return (
    <section id="register" aria-labelledby="register-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid items-start gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading
            id="register-title"
            kicker="Crew manifest"
            title="Join the crew"
            intro="Put your name on the manifest so the organizers know you are coming aboard."
            accent="sus"
          />
          <Cadet suit="red" pose="wave" className="float hidden h-56 w-auto lg:block" style={{ '--dur': '7s' } as CSSProperties} />
        </div>

        <Reveal className="lg:col-span-3">
          <div className="panel p-6 sm:p-9">
            {externalFormUrl ? (
              <div className="flex flex-col items-start gap-5">
                <h3 className="text-3xl font-bold">Register on the official form</h3>
                <p className="text-mute">Sign-up is handled on a separate page. It opens in a new tab.</p>
                <a href={externalFormUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <ExternalLink size={18} aria-hidden="true" /> Open registration form
                </a>
              </div>
            ) : (
              <RegistrationForm />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
