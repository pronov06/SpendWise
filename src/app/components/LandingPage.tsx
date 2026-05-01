import { Link } from "react-router";
import { Wallet, TrendingUp, Shield, Bell, PieChart, Smartphone } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">SpendWise</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-teal-600 transition-colors">About</a>
            <Link to="/login" className="text-teal-600 hover:text-teal-700 transition-colors">Sign In</Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              Get Started
            </Link>
            <ThemeToggle />
          </nav>
          <Link
            to="/login"
            className="md:hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg"
          >
            Sign In
          </Link>
          <div className="md:hidden ml-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm">
              {"🎯 Smart Money Management"}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Track smarter.<br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Spend wiser.
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Take control of your finances with SpendWise. Perfect for students and young professionals.
              Simple, secure, and smart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transition-all text-center"
              >
                Get Started Free
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all text-center"
              >
                Learn More
              </a>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">10,000+ Users</div>
                <div className="text-gray-600">Managing their finances</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="text-sm opacity-90 mb-2">Total Balance</div>
                    <div className="text-3xl font-bold">₹12,543.00</div>
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12.5% from last month</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          🍕
                        </div>
                        <div>
                          <div className="font-medium text-sm">Food & Dining</div>
                          <div className="text-xs text-gray-500">Today</div>
                        </div>
                      </div>
                      <div className="font-semibold text-red-500">-₹45.00</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          💼
                        </div>
                        <div>
                          <div className="font-medium text-sm">Salary</div>
                          <div className="text-xs text-gray-500">Yesterday</div>
                        </div>
                      </div>
                      <div className="font-semibold text-green-500">+₹3,200.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to manage money
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you track, analyze, and optimize your spending habits.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PieChart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize your spending patterns with beautiful charts and insights. Make data-driven financial decisions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Budget Alerts</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant notifications when you're approaching your spending limits. Stay on track with your goals.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Accounts</h3>
            <p className="text-gray-600 leading-relaxed">
              Keep your account protected with verification and a focused personal finance experience.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Income Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Track all your income sources in one place. Get a complete picture of your financial health.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Category Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Organize expenses by categories. See exactly where your money goes each month.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Friendly</h3>
            <p className="text-gray-600 leading-relaxed">
              Access your finances anywhere, anytime. Fully responsive design for all your devices.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTE0aDEydjEySDF6bTI0IDBoMTJ2MTJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already making smarter financial decisions with SpendWise.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-teal-600 rounded-xl hover:shadow-xl transition-all"
            >
              Start Free Today
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">SpendWise</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your personal finance companion for smarter spending and better saving.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-teal-600">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-teal-600">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 SpendWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
