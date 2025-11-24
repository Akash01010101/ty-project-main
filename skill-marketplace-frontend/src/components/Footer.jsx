import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/5 backdrop-blur-lg mt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; 2025 SkillMarketplace. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><Github /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><Twitter /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300"><Linkedin /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;