import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: 'I found a talented designer for my startup logo in just a few hours. The quality of work on SkillMarketplace is incredible!',
    author: 'Sarah L.',
    title: 'Entrepreneurship Major',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    quote: 'As a developer, this platform has been a game-changer for finding paid projects and building my portfolio outside of class.',
    author: 'Michael B.',
    title: 'Computer Science Student',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    quote: 'The collaborative workspace is amazing. My team and I use it to manage all our freelance video projects.',
    author: 'Jessica P.',
    title: 'Film & Media Student',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center text-white"
          style={{ fontWeight: 500 }}
        >
          Loved by Students Like You
        </motion.h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl text-center"
            >
              <img src={testimonial.avatar} alt={testimonial.author} className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-purple-500/50" />
              <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              <div className="mt-6">
                <p className="font-bold text-white">{testimonial.author}</p>
                <p className="text-sm text-purple-400">{testimonial.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;