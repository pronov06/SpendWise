import { Link } from "react-router";
import { Wallet, TrendingUp, Shield, Bell, PieChart, Smartphone } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const floatingAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300 overflow-x-hidden">
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">SpendWise</span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-8"
            >
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 transition-colors">About</a>
              <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors">Sign In</Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <ThemeToggle />
            </motion.div>
          </nav>

          <div className="md:hidden flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-sm"
            >
              Sign In
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium"
            >
              {"🎯 Smart Money Management"}
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Track smarter.<br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Spend wiser.
              </span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
            >
              Take control of your finances with SpendWise. Perfect for students and young professionals.
              Simple, secure, and smart.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transition-all text-center font-bold transform hover:-translate-y-1"
              >
                Get Started Free
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all text-center font-bold transform hover:-translate-y-1"
              >
                Learn More
              </a>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 pt-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      i === 1 ? 'from-purple-400 to-pink-400' : 
                      i === 2 ? 'from-blue-400 to-cyan-400' : 
                      'from-green-400 to-emerald-400'
                    } border-2 border-white dark:border-gray-900 cursor-pointer shadow-sm`} 
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900 dark:text-white">10,000+ Users</div>
                <div className="text-gray-600 dark:text-gray-400">Managing their finances</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <motion.div 
              animate={floatingAnimation}
              className="relative w-full aspect-square max-w-md mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl blur-3xl animate-pulse" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
                  >
                    <div className="text-sm opacity-90 mb-2">Total Balance</div>
                    <div className="text-3xl font-bold">₹12,543.00</div>
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12.5% from last month</span>
                    </div>
                  </motion.div>
                  <div className="space-y-3">
                    {[
                      { icon: "🍕", label: "Food & Dining", date: "Today", amount: "-₹45.00", color: "text-red-500", bg: "bg-orange-100" },
                      { icon: "💼", label: "Salary", date: "Yesterday", amount: "+₹3,200.00", color: "text-green-500", bg: "bg-green-100" }
                    ].map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm dark:text-white">{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.date}</div>
                          </div>
                        </div>
                        <div className={`font-semibold ${item.color}`}>{item.amount}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to manage money
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to help you track, analyze, and optimize your spending habits.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            { icon: PieChart, title: "Smart Analytics", desc: "Visualize your spending patterns with beautiful charts and insights.", color: "from-teal-500 to-emerald-600" },
            { icon: Bell, title: "Budget Alerts", desc: "Get instant notifications when you're approaching your spending limits.", color: "from-purple-500 to-pink-600" },
            { icon: Shield, title: "Secure Accounts", desc: "Keep your account protected with verification and a focused personal finance experience.", color: "from-orange-500 to-amber-600" },
            { icon: TrendingUp, title: "Income Tracking", desc: "Track all your income sources in one place. Get a complete picture of your financial health.", color: "from-blue-500 to-cyan-600" },
            { icon: Wallet, title: "Category Management", desc: "Organize expenses by categories. See exactly where your money goes each month.", color: "from-red-500 to-pink-600" },
            { icon: Smartphone, title: "Mobile Friendly", desc: "Access your finances anywhere, anytime. Fully responsive design for all your devices.", color: "from-green-500 to-emerald-600" }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-teal-100 dark:hover:border-teal-900/50 transition-all group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTE0aDEydjEySDF6bTI0IDBoMTJ2MTJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to take control of your finances?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of users who are already making smarter financial decisions with SpendWise.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-white text-teal-600 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Free Today
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              About the Developer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              SpendWise was built with a vision to simplify personal finance for everyone. 
              Our mission is to provide a clean, intuitive, and powerful tool that helps you 
              make informed decisions about your money.
            </p>
            <div className="pt-4">
              <a 
                href="https://github.com/pronov06/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-20 grayscale" />
              <div className="relative text-center p-8">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-10 h-10 text-teal-600" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Crafting better financial futures, one line of code at a time.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">SpendWise</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your personal finance companion for smarter spending and better saving.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 text-center text-sm text-gray-600 dark:text-gray-500">
            <p>&copy; 2026 SpendWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
