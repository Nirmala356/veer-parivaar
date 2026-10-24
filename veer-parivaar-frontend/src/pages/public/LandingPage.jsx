import {
  ArrowRight,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'

const features = [
  {
    title: 'Family profiles',
    description:
      'Keep household details accurate and ready so support teams can respond without repeated paperwork.',
    icon: Users,
  },
  {
    title: 'Document management',
    description:
      'Upload service and identity documents as PDF, JPEG, or PNG, then download them when they are needed.',
    icon: FileText,
  },
  {
    title: 'Support requests',
    description:
      'Raise a request, follow its status, and let administrators assign a volunteer who can see it through.',
    icon: ClipboardList,
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your account',
    text: 'Register with your email. New accounts are created as family members.',
  },
  {
    number: '02',
    title: 'Complete your profile',
    text: 'Add family details and store authorised documents in one place.',
  },
  {
    number: '03',
    title: 'Request support',
    text: 'Submit a request. Administrators assign volunteers and status stays visible.',
  },
]

export function LandingPage() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-white/70 uppercase">
              Veer Parivaar
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Support for Indian defence families, kept in one trusted place.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Manage family records, keep documents ready, and request
              assistance with a clear path from submission to resolution.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/register" variant="secondary" size="lg">
                Get Started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button to="/login" variant="ghost" size="lg">
                Sign In
              </Button>
            </div>
          </div>
          <Card className="border-white/10 bg-white/5 p-6 text-white shadow-none">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-6 text-white" />
              <div>
                <h2 className="text-lg font-semibold">Built for trust</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Role-based access keeps family records, volunteer work, and
                  administration separate. You only see what you are authorised
                  to handle.
                </p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
              <div>
                <dt className="text-xs text-white/60">Families</dt>
                <dd className="mt-1 text-sm font-semibold">Profiles</dd>
              </div>
              <div>
                <dt className="text-xs text-white/60">Records</dt>
                <dd className="mt-1 text-sm font-semibold">Documents</dd>
              </div>
              <div>
                <dt className="text-xs text-white/60">Care</dt>
                <dd className="mt-1 text-sm font-semibold">Requests</dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          For defence families
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy">
          Practical tools for everyday welfare work
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Veer Parivaar is designed for families, administrators, and
          volunteers who need a calm, professional workspace—not a generic
          dashboard.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} as="article">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-page text-navy">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Badge>Simple process</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Three steps from first sign-in to a tracked support request.
          </p>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.number}>
                <Card>
                  <p className="text-xs font-semibold tracking-[0.16em] text-accent">
                    {step.number}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                </Card>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Button to="/register">Create a family account</Button>
          </div>
        </div>
      </section>
    </>
  )
}
