import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };
  return (
    <section
      className="relative h-screen flex items-center justify-center text-center"
      style={{
        fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(to right, #3ECF8E, var(--button-primary))",
              fontWeight: 500,
            }}
          >
            Monetize Your Skills.
          </span>
          <br />
          <span style={{ fontWeight: 400 }}>
          Elevate Your Campus Life.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-6 text-base md:text-lg max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          SkillMarketplace is the ultimate peer-to-peer platform for college
          students to connect, collaborate, and create. Turn your talents into
          opportunities.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-10 flex justify-center gap-4"
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="px-6 py-2.5 font-bold rounded-full hover:scale-105 transform transition-all duration-300"
            style={{ backgroundColor: "var(--button-action)", color: "#fff" }}
          >
            Get Started
          </Button>
          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="px-6 py-2.5 backdrop-blur-md font-bold rounded-full border transform transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "var(--text-primary)",
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              Learn More
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
