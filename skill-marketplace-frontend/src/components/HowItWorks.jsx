import { motion } from 'framer-motion';

const steps = [
  { title: 'Create a Gig', description: 'Sign up in seconds and showcase your skills with a stunning profile.' },
  { title: 'Get Discovered', description: 'Our smart recommendation engine connects you with the right people.' },
  { title: 'Collaborate & Create', description: 'Use our built-in tools to manage projects and communicate seamlessly.' },
  { title: 'Earn & Grow', description: 'Receive secure mock payments and build your reputation on campus.' },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center text-white"
        >
          Get Started in Minutes
        </motion.h2>
        <div className="mt-16 relative">
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/10"></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`mb-12 flex items-center w-full ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">{step.title}</h3>
                  <p className="mt-2 text-gray-400">{step.description}</p>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-900 border-2 border-purple-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;