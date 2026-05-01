import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@caption-cam/ui/button";
import { useThemeStore } from "@/features/theme";

export const PrivacyPolicy = () => {
  const mode = useThemeStore((s) => s.mode);
  
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container max-w-4xl mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Studio
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground lead">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <hr className="my-8 border-border" />

          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>GAKI - House of Video Creation</strong> ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our application (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>

          <h2>2. The Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Profile Data</strong> includes your username and password, your interests, preferences, feedback and survey responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, application, and services.</li>
          </ul>

          <h2>3. How We Use Your Personal Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2>4. Third-Party Authentication</h2>
          <p>
            We offer the ability to register and log in using third-party services (such as Google OAuth). If you choose to log in using a third-party service, we receive your profile information (such as your name and email address) from that provider. We use this information solely to create your account and provide our services to you.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          </p>

          <h2>6. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.
          </p>
          <p>
            If you wish to exercise any of the rights set out above, please contact us at our support email.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
            <br />
            <strong>Email:</strong> mohit.snegi123@gmail.com
          </p>
        </article>
      </main>
      
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GAKI - House of Video Creation. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
