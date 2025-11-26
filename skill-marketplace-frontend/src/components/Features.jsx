import { motion } from 'framer-motion';
import { Briefcase, Users, MessageSquare, Zap } from 'lucide-react';

const features = [
	{
		icon: <Briefcase size={36} style={{ color: 'var(--text-accent)' }} />,
		title: 'Diverse Skill Marketplace',
		description: 'From coding to creative arts, find the talent you need or the gigs you want.',
	},
	{
		icon: <Users size={36} style={{ color: 'var(--text-accent)' }} />,
		title: 'Build Your Digital Portfolio',
		description: 'Showcase your skills and build credibility with every completed project.',
	},
	{
		icon: <MessageSquare size={36} style={{ color: 'var(--text-accent)' }} />,
		title: 'Seamless Communication',
		description: 'Integrated chat and collaboration tools to keep your projects on track.',
	},
	{
		icon: <Zap size={36} style={{ color: 'var(--text-accent)' }} />,
		title: 'Instant & Secure Transactions',
		description: 'Mock payment system for safe and immediate compensation for your work.',
	},
];

const Features = () => {
	return (
		<section id="features" className="py-20">
			<div className="container mx-auto px-6">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
					className="text-4xl font-bold text-center"
					style={{ color: 'var(--text-primary)', fontWeight: 500 }}
				>
					Why Choose SkillMarketplace?
				</motion.h2>
				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50, scale: 0.9 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ duration: 0.5, delay: index * 0.15 }}
							viewport={{ once: true }}
							className="backdrop-blur-lg rounded-2xl p-8 shadow-xl transform hover:-translate-y-2 transition-all duration-300 border"
							style={{
								backgroundColor: 'rgba(50, 50, 50, 0.4)',
								borderColor: 'rgba(128, 128, 128, 0.3)'
							}}
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
								{feature.title}
							</h3>
							<p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;