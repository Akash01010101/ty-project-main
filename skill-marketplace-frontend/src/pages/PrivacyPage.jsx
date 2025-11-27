import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy for Peerly</h1>
          <p className="text-sm mb-12" style={{ color: 'var(--text-secondary)' }}>
            Last Modified: November 27, 2025
          </p>

          <div className="prose max-w-none space-y-8">
            <section>
              <p className="leading-relaxed">
                Thank you for your interest in Peerly ("Peerly," "we", "our" or "us"), operated by Devang and Akash. This Privacy Policy explains how information about you, that directly identifies you, or that makes you identifiable ("personal information") is collected, used, and disclosed by Peerly in connection with our application and services (collectively, the "Service").
              </p>
            </section>

            <section className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">What Does This Privacy Policy Apply To?</h2>
              <p className="text-sm leading-relaxed mb-4">
                This Privacy Policy explains how we use your personal information when you use the Service. We are the data controller of your personal information, meaning that we determine and are responsible for how your personal information is processed.
              </p>
              <p className="text-sm leading-relaxed mb-2">This policy applies to information we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>On the Peerly application.</li>
                <li>In email, text, and other electronic messages between you and Peerly.</li>
              </ul>
              <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
                It does not apply to information collected by any third party (including our affiliates and subsidiaries), including through any application or content (including advertising) that may link to or be accessible from the Peerly application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">1. Information We Collect and How We Use It</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                We collect personal information in connection with your visits to and use of the Service.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">A. Information That You Provide</h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                    We collect personal information that you submit directly to us. The categories of information we collect can include:
                  </p>
                  <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li><strong style={{ color: 'var(--text-primary)' }}>Registration Information:</strong> When you register for an account, we collect information such as your name, email address, password, and username. We use this to administer your account and provide the Service.</li>
                    <li><strong style={{ color: 'var(--text-primary)' }}>User Content:</strong> You may upload files, documents, images, or data as part of your use of the Service.</li>
                    <li><strong style={{ color: 'var(--text-primary)' }}>Communications:</strong> If you contact us for support or feedback, we collect your contact information and the contents of your communication.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">B. Information from Third-Party Sources</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Single Sign-On (SSO):</strong> If you log in using a third-party service (like Google or GitHub), we will have access to certain information from those third parties, such as your name, email address, and profile picture, in accordance with your privacy settings on that service.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">C. Information Collected Automatically</h3>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                    When you access the Service, we and our third-party partners may automatically collect usage and device information, such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                    <li><strong style={{ color: 'var(--text-primary)' }}>Device Information:</strong> IP address, browser type, device model, operating system, and unique device identifiers.</li>
                    <li><strong style={{ color: 'var(--text-primary)' }}>Usage Data:</strong> The pages you visit, the time spent on those pages, and other actions you take on the Service.</li>
                  </ul>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>We use this information to:</p>
                  <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>Provide, maintain, and improve the Service.</li>
                    <li>Monitor usage metrics (traffic, volume, demographic patterns).</li>
                    <li>Detect, prevent, and address technical issues or fraud.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">2. How We Share Personal Information</h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                We may share your personal information in the following instances:
              </p>
              <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Service Providers:</strong> We share data with third-party vendors who help us deliver the Service (e.g., cloud hosting providers, analytics services, email delivery services). These parties are bound by confidentiality agreements.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Legal Requirements:</strong> We may disclose your information if required to do so by law or in the good-faith belief that such action is necessary to: (a) comply with Indian laws (including the Information Technology Act, 2000); (b) comply with legal process served on us; (c) protect and defend the rights or property of Peerly; or (d) protect the personal safety of users or the public.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Business Transfers:</strong> If Peerly is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">3. Data Retention and Security</h2>
              <div className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Retention:</strong> We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Security:</strong> Peerly is located in India. We use commercially reasonable physical, technical, and organizational measures designed to preserve the integrity and security of all information we collect. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">4. International Data Transfers</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your information, including Personal Data, may be transferred to—and maintained on—computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction. By using the Service, you consent to the transfer of information to countries where our cloud service providers operate (e.g., United States, Singapore) for storage and processing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">5. Control Over Your Information</h2>
              <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Access and Update:</strong> You may update your account information through your profile settings within the Peerly app.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Opt-Out:</strong> You may opt-out of receiving marketing communications from us by following the unsubscribe link in the emails. You cannot opt-out of service-related emails (e.g., account verification, technical notices).</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Deletion:</strong> You may request the deletion of your account and personal data by contacting us at the email provided below.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">6. Cookies and Tracking Technologies</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">7. Children's Privacy</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">8. Links to Third-Party Sites</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">9. Changes to This Privacy Policy</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Modified" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold mb-4">10. Contact Us</h2>
              <p style={{ color: 'var(--text-secondary)' }}>If you have any questions about this Privacy Policy, please contact us:</p>
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

export default PrivacyPage;
