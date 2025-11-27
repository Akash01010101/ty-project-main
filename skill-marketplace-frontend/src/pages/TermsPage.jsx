import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)',
        fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-medium mb-8 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service for Peerly</h1>
          <p className="text-sm mb-12" style={{ color: 'var(--text-secondary)' }}>
            Last Modified: November 27, 2025
          </p>

          <div className="prose max-w-none space-y-8">
            <section>
              <p className="leading-relaxed">
                These Terms of Service (this "Agreement") are a binding contract between you ("Customer," "User," "you," or "your") and the operators of Peerly, Devang and Akash, having their principal place of operations at Mira Road, Mumbai, Thane, India 401107 ("Peerly," "we," "our," or "us").
              </p>
              <p className="mt-4 leading-relaxed">
                This Agreement governs your access to and use of the Peerly application and services (collectively, the "Services").
              </p>
            </section>

            <section className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">Agreement Acceptance</h2>
              <p className="text-sm leading-relaxed font-medium">
                THIS AGREEMENT TAKES EFFECT WHEN YOU ACCEPT THE TERMS DURING SIGN-UP OR BY ACCESSING OR USING THE SERVICES. BY ACCEPTING THE TERMS, YOU: (A) ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THIS AGREEMENT; (B) REPRESENT THAT YOU HAVE THE LEGAL AUTHORITY TO ENTER INTO THIS AGREEMENT; AND (C) ACCEPT THIS AGREEMENT AND AGREE THAT YOU ARE LEGALLY BOUND BY ITS TERMS.
              </p>
              <p className="mt-4 text-sm font-bold text-red-500">
                IF YOU DO NOT ACCEPT THESE TERMS, YOU MAY NOT ACCESS OR USE THE SERVICES.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">1. Definitions</h2>
              <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>"User Data"</strong> means information, data, and other content that is submitted, posted, or otherwise transmitted by you through the Services.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>"Peerly IP"</strong> means the Services, documentation, and any intellectual property provided to you in connection with the Services.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>"Services"</strong> means the Peerly proprietary software platform and application.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">2. Access and Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">a. License Grant</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Subject to your compliance with this Agreement, Peerly grants you a non-exclusive, non-transferable, non-sublicensable limited right to access and use the Services for your personal or internal business purposes.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">b. Use Restrictions</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>You shall not, and shall not permit others to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>Copy, modify, or create derivative works of Peerly IP.</li>
                    <li>Rent, lease, lend, sell, or sublicense the Services to any third party.</li>
                    <li>Reverse engineer, disassemble, or decompile the Services.</li>
                    <li>Use the Services for any illegal purpose or to transmit any viruses, malware, or harmful code.</li>
                    <li>Violate any applicable Indian laws or regulations.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">c. Suspension</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>We reserve the right to suspend your access immediately if we determine that: (i) your use poses a security risk to the Services or other users; (ii) you are using the Services for fraudulent or illegal activities; or (iii) you have breached this Agreement.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">3. User Responsibilities</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                You are responsible for all activity that occurs under your account. You are responsible for maintaining the security of your access credentials. Peerly is not liable for any loss or damage arising from your failure to protect your password or account information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">4. Fees and Payment</h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>If you purchase paid features of Peerly:</p>
              <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li>You agree to pay the fees specified at the time of purchase.</li>
                <li>All fees are non-refundable unless otherwise stated.</li>
                <li>All fees are exclusive of taxes (such as GST). You are responsible for paying all applicable taxes associated with your use of the Services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">5. Confidentiality</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Both parties agree to protect the confidentiality of non-public information disclosed by the other party. We will not disclose your confidential User Data to third parties except: (i) as required to provide the Services; (ii) to comply with legal obligations (e.g., court orders); or (iii) with your consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">6. Intellectual Property</h2>
              <div className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>a. Peerly IP:</strong> You acknowledge that Peerly (and its licensors) owns all right, title, and interest in and to the Services and Peerly IP.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>b. User Data:</strong> You retain ownership of your User Data. You grant Peerly a license to use, reproduce, and display your User Data as necessary to provide the Services to you.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">7. Privacy</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your use of the Services is also governed by our Privacy Policy. By using Peerly, you consent to the collection and use of your information as described in the Privacy Policy, in compliance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">8. Warranty Disclaimer</h2>
              <p className="uppercase text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." PEERLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="uppercase text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL PEERLY, DEVANG, AKASH, OR THEIR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS OR DATA, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT.
              </p>
              <p className="uppercase text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                PEERLY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO PEERLY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">10. Indemnification</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                You agree to indemnify, defend, and hold harmless Peerly, Devang, and Akash from and against any losses, damages, liabilities, and costs (including reasonable attorneys' fees) resulting from any third-party claim arising out of: (i) your violation of this Agreement; (ii) your User Data; or (iii) your violation of any applicable law or rights of a third party.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">11. Termination</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We may terminate this Agreement and your access to the Services at any time, for any reason, with or without notice. Upon termination, your right to use the Services will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">12. Governing Law and Dispute Resolution</h2>
              <div className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>a. Governing Law:</strong> This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>b. Jurisdiction:</strong> Subject to the arbitration clause below, the parties agree to submit to the exclusive jurisdiction of the courts located in Thane or Mumbai, Maharashtra.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>c. Arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to this Agreement shall be settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Mumbai, India. The language of the arbitration shall be English.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">13. Miscellaneous</h2>
              <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Entire Agreement:</strong> This Agreement constitutes the entire agreement between you and Peerly regarding the Services.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Severability:</strong> If any provision of this Agreement is found to be unenforceable, the remaining provisions will remain in full force and effect.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Changes:</strong> We may modify these Terms at any time. We will post the revised Terms on the Peerly app/website. Your continued use of the Services constitutes acceptance of the updated Terms.</li>
              </ul>
            </section>

            <section className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold mb-4">14. Contact Information</h2>
              <p style={{ color: 'var(--text-secondary)' }}>For any questions regarding these Terms, please contact us at:</p>
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="font-semibold">Peerly</p>
                <p style={{ color: 'var(--text-secondary)' }}>Attn: Devang and Akash</p>
                <p style={{ color: 'var(--text-secondary)' }}>Mira Road, Mumbai, Thane India 401107</p>
                <p className="mt-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Email: </span>
                  <a href="mailto:maybedevang29@gmail.com" className="hover:underline" style={{ color: 'var(--button-action)' }}>maybedevang29@gmail.com</a>
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
