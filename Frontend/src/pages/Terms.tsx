import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Welcome to CareConnect. By using our services, you agree to comply with and be bound by the following terms and conditions of use.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Acceptance of terms</h2>
            <p>
              By accessing and using CareConnect, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Use license</h2>
            <p>
              Permission is granted to temporarily access the materials on CareConnect for personal, non-commercial transitory viewing only.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Disclaimer</h2>
            <p>
              The materials on CareConnect are provided on an 'as is' basis. CareConnect makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Limitations</h2>
            <p>
              In no event shall CareConnect or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CareConnect, even if CareConnect or a CareConnect authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Contact us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our Contact page.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
