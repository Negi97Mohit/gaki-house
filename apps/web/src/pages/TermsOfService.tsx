import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@caption-cam/ui/button";
import { useThemeStore } from "@/features/theme";

export const TermsOfService = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground lead">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <hr className="my-8 border-border" />

          <h2>1. Terms</h2>
          <p>
            By accessing or using <strong>GAKI - House of Video Creation</strong>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site and our services.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use our services for personal, non-commercial, and commercial video creation purposes, subject to these Terms of Service. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Attempt to decompile or reverse engineer any software contained on our application.</li>
            <li>Use the service for any illegal or unauthorized purpose.</li>
            <li>Transmit any worms or viruses or any code of a destructive nature.</li>
          </ul>

          <h2>3. User Generated Content</h2>
          <p>
            Our service allows you to create, upload, and stream video content. You retain all of your ownership rights in your content. However, by uploading content to our platform, you guarantee that you have the right to use and share that content and that it does not violate any third-party rights or laws. We reserve the right to remove any content that violates these terms.
          </p>

          <h2>4. Authentication and Accounts</h2>
          <p>
            To use certain features of the service, you must create an account. You may do so using third-party providers (such as Google). You are responsible for maintaining the security of your account and your login credentials. We are not liable for any loss or damage from your failure to comply with this security obligation.
          </p>

          <h2>5. Disclaimer</h2>
          <p>
            The materials and services on GAKI are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2>6. Limitations</h2>
          <p>
            In no event shall GAKI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform, even if we have been notified orally or in writing of the possibility of such damage.
          </p>

          <h2>7. Modifications</h2>
          <p>
            We may revise these terms of service at any time without notice. By using this application you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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

export default TermsOfService;
