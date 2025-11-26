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
          className="text-4xl font-bold text-center"
          style={{ color: 'var(--text-primary)', fontWeight: 500 }}
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
              className="backdrop-blur-lg rounded-2xl p-8 border shadow-xl text-center"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <img src={testimonial.avatar} alt={testimonial.author} className="w-24 h-24 rounded-full mx-auto mb-6 border-4" style={{ borderColor: 'var(--button-action)' }} />
              <p className="italic" style={{ color: 'var(--text-secondary)' }}>"{testimonial.quote}"</p>
              <div className="mt-6">
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{testimonial.author}</p>
                <p className="text-sm" style={{ color: 'var(--text-accent)' }}>{testimonial.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;