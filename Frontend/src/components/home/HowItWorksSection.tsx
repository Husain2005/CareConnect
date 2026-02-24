const steps = [
  {
    num: "01",
    title: "Create your account",
    description: "Sign up as patient or doctor in under a minute.",
  },
  {
    num: "02",
    title: "Find and book",
    description: "Browse specialists, check availability, and reserve your slot.",
  },
  {
    num: "03",
    title: "Manage care",
    description: "Track appointments, reports, and conversations in one place.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-foreground">Three simple steps</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="text-center bg-card border border-border rounded-2xl p-6 shadow-soft">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-secondary border border-border flex items-center justify-center">
                <p className="text-lg font-bold text-primary">{step.num}</p>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
