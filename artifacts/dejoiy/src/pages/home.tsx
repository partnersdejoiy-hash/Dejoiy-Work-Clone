import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Globe, User, Search, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans w-full overflow-x-hidden">
      {/* Announcement Banner */}
      <div className="bg-[#0E1B4D] text-white text-sm py-2 px-4 flex justify-center items-center font-medium border-b border-white/10" data-testid="announcement-banner">
        Dejoiy DevCon hits Vegas June 1–4.
        <a href="#" className="ml-2 underline hover:no-underline font-semibold text-[#F26522] flex items-center">
          Register Now <ArrowRight className="w-3 h-3 ml-1" />
        </a>
      </div>

      {/* Navigation */}
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm text-[#0E1B4D] py-3" 
            : "bg-white text-[#0E1B4D] py-4"
        }`}
        data-testid="main-nav"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-[#0E1B4D]" data-testid="logo">Dejoiy</span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-8 font-semibold text-[15px]">
            <a href="#" className="hover:text-[#F26522] transition-colors" data-testid="nav-products">Products</a>
            <a href="#" className="hover:text-[#F26522] transition-colors" data-testid="nav-industries">Industries</a>
            <a href="#" className="hover:text-[#F26522] transition-colors" data-testid="nav-customers">Customers</a>
            <a href="#" className="hover:text-[#F26522] transition-colors" data-testid="nav-resources">Resources</a>
            <a href="#" className="hover:text-[#F26522] transition-colors" data-testid="nav-partners">Partners</a>
            <a href="#" className="hover:text-[#F26522] transition-colors" data-testid="nav-company">Company</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex" data-testid="nav-globe">
              <Globe className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex" data-testid="nav-user">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" data-testid="nav-search">
              <Search className="w-5 h-5" />
            </button>
            <Button className="bg-[#F26522] hover:bg-[#d5581e] text-white rounded-full px-6 font-semibold hidden md:flex" data-testid="btn-contact-sales">
              Contact Sales
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#0E1B4D] text-white pt-24 pb-32 px-6 relative overflow-hidden" data-testid="hero-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight" data-testid="hero-headline">
              Superintelligence <br/>
              <span className="text-[#F26522]">for work.</span> <br/>
              Meet Aura.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-lg leading-relaxed" data-testid="hero-subtext">
              The unified AI platform built for HR, Finance, and IT. Elevate your entire organization to market leadership.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-[#F26522] hover:bg-[#d5581e] text-white rounded-full px-8 py-6 text-lg font-semibold" data-testid="btn-hero-contact">
                Contact Sales
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-semibold" data-testid="btn-hero-demo">
                Watch Demo
              </Button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F26522]/20 to-transparent rounded-3xl blur-3xl" />
            <img 
              src="/images/hero.png" 
              alt="Dejoiy Platform Dashboard" 
              className="w-full h-auto rounded-xl shadow-2xl border border-white/10 relative z-10 object-cover aspect-[16/9]"
              data-testid="hero-image"
            />
          </motion.div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="bg-gray-50 py-16 border-b border-gray-200" data-testid="customer-logos-section">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Trusted by industry leaders globally</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-60 grayscale">
            <span className="text-2xl font-black font-serif">ACME Corp</span>
            <span className="text-2xl font-black font-sans tracking-tighter">GlobalTech</span>
            <span className="text-2xl font-black font-mono">NEXUS</span>
            <span className="text-2xl font-bold font-serif italic">Zenith</span>
            <span className="text-2xl font-black font-sans uppercase">Apex</span>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 px-6 bg-white" data-testid="platform-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0E1B4D] mb-6 tracking-tight">A unified AI platform built to serve your entire organization.</h2>
            <p className="text-xl text-gray-600">Break down silos and align your teams with a single source of truth powered by Dejoiy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cards */}
            {[
              { title: "Human Resources", img: "/images/hr.png", links: ["Talent Management", "Payroll", "Workforce Planning"] },
              { title: "Finance", img: "/images/finance.png", links: ["Accounting", "Financial Planning", "Spend Management"] },
              { title: "IT", img: "/images/it.png", links: ["Enterprise Architecture", "Security & Compliance", "Cloud Infrastructure"] },
              { title: "Legal", img: "/images/legal.png", links: ["Contract Lifecycle", "Compliance Tracking", "Risk Management"] },
              { title: "Operations", img: "/images/operations.png", links: ["Supply Chain", "Procurement", "Resource Allocation"] },
            ].map((card, idx) => (
              <motion.div 
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#0E1B4D] rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-all duration-300"
                data-testid={`platform-card-${card.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className="h-48 overflow-hidden">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <ul className="space-y-3 mb-6">
                    {card.links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-gray-300 hover:text-white flex items-center group/link">
                          <ChevronRight className="w-4 h-4 mr-2 text-[#F26522] group-hover/link:translate-x-1 transition-transform" />
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="text-[#F26522] font-semibold flex items-center hover:underline">
                    Explore {card.title} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="bg-gray-50 py-24 px-6 border-y border-gray-200" data-testid="ai-features-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#0E1B4D] mb-6">The power of Dejoiy Aura AI</h2>
              <p className="text-xl text-gray-600 mb-8">Work smarter, faster, and more securely with our embedded artificial intelligence.</p>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-bold text-[#0E1B4D] mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#F26522]/10 text-[#F26522] flex items-center justify-center mr-3 text-sm">1</span>
                    Automated Insights
                  </h4>
                  <p className="text-gray-600 pl-11">Surface anomalies and opportunities instantly across your enterprise data.</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#0E1B4D] mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#F26522]/10 text-[#F26522] flex items-center justify-center mr-3 text-sm">2</span>
                    Generative Workflows
                  </h4>
                  <p className="text-gray-600 pl-11">Draft contracts, job descriptions, and financial reports in seconds.</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#0E1B4D] mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#F26522]/10 text-[#F26522] flex items-center justify-center mr-3 text-sm">3</span>
                    Enterprise Security
                  </h4>
                  <p className="text-gray-600 pl-11">Your data never trains public models. Complete privacy, always.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img src="/images/ai-feature.png" alt="Dejoiy AI Features" className="rounded-2xl shadow-2xl object-cover aspect-[4/3] w-full" data-testid="ai-feature-image" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#0E1B4D] text-white py-20 px-6" data-testid="stats-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="pt-8 md:pt-0">
              <p className="text-5xl md:text-6xl font-black text-[#F26522] mb-2">10,000+</p>
              <p className="text-lg font-medium text-gray-300 uppercase tracking-wider">Enterprise Customers</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-5xl md:text-6xl font-black text-[#F26522] mb-2">$10B+</p>
              <p className="text-lg font-medium text-gray-300 uppercase tracking-wider">Assets Managed</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-5xl md:text-6xl font-black text-[#F26522] mb-2">99.9%</p>
              <p className="text-lg font-medium text-gray-300 uppercase tracking-wider">Uptime Reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0E1B4D] mb-16">Why leaders choose Dejoiy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-10 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex gap-1 text-[#F26522] mb-6">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-2xl text-[#0E1B4D] font-medium leading-relaxed mb-8">
                "Dejoiy replaced six different legacy systems for us. The AI insights alone have saved our finance team hundreds of hours this quarter."
              </p>
              <div>
                <p className="font-bold text-[#0E1B4D]">Sarah Jenkins</p>
                <p className="text-gray-500">CFO, GlobalTech Industries</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-10 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex gap-1 text-[#F26522] mb-6">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-2xl text-[#0E1B4D] font-medium leading-relaxed mb-8">
                "We rolled out Dejoiy to our entire 5,000-person workforce. The adoption was seamless, and the HR features are second to none."
              </p>
              <div>
                <p className="font-bold text-[#0E1B4D]">Marcus Torres</p>
                <p className="text-gray-500">CHRO, Apex Solutions</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-br from-[#0E1B4D] to-[#1a2b6d] py-20 px-6 text-center" data-testid="cta-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your organization?</h2>
          <p className="text-xl text-gray-300 mb-10">Join thousands of leading enterprises building the future of work with Dejoiy.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-[#F26522] hover:bg-[#d5581e] text-white rounded-full px-10 py-6 text-lg font-bold w-full sm:w-auto" data-testid="btn-bottom-contact">
              Contact Sales
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-[#0E1B4D] hover:bg-gray-100 rounded-full px-10 py-6 text-lg font-bold w-full sm:w-auto" data-testid="btn-bottom-demo">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-16 px-6 border-t border-gray-200" data-testid="footer">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <span className="text-2xl font-black text-[#0E1B4D] mb-6 block">Dejoiy</span>
          </div>
          
          <div>
            <h4 className="font-bold text-[#0E1B4D] mb-4">Products</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#F26522]">Human Resources</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Finance</a></li>
              <li><a href="#" className="hover:text-[#F26522]">IT & Cloud</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Legal</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Platform & AI</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-[#0E1B4D] mb-4">Industries</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#F26522]">Healthcare</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Financial Services</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Manufacturing</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Technology</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Retail</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-[#0E1B4D] mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#F26522]">About Us</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Leadership</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Careers</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Newsroom</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#0E1B4D] mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#F26522]">Customer Stories</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Blog</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Events</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Community</a></li>
              <li><a href="#" className="hover:text-[#F26522]">Developers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} Dejoiy, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#F26522]">Privacy</a>
            <a href="#" className="hover:text-[#F26522]">Terms</a>
            <a href="#" className="hover:text-[#F26522]">Security</a>
            <a href="#" className="hover:text-[#F26522]">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
