import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
          <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground">
            <p>
              At CareConnect, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our healthcare platform.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, schedule appointments, or communicate with healthcare providers through our platform. This may include your name, email address, phone number, medical history, and appointment details.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
            <p>
              Your information is used to provide healthcare services, facilitate communication between patients and providers, manage appointments, improve our services, and comply with legal obligations. We never sell your personal information to third parties.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal and medical information. This includes encryption, secure servers, and regular security audits. Access to your data is restricted to authorized healthcare providers and necessary staff only.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Information Sharing</h2>
            <p>
              We only share your information with healthcare providers involved in your care, as required by law, or with your explicit consent. We do not share your data for marketing purposes or with third parties for commercial use.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. You can also request data portability and object to certain processing activities. Contact us to exercise these rights.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve your experience on our platform, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser.
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us through our Contact page or email us at privacy@careconnect.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
