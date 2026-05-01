/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Menu, 
  X, 
  Calendar, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  ArrowRight,
  Instagram,
  Mail,
  ShieldCheck,
  Timer,
  Heart,
  Sparkles,
  Wind,
  Droplets,
  ArrowUpRight,
  ChevronDown,
  Bot,
  User,
  Loader2,
  ShoppingBag,
  Users,
  LogOut,
  Plus,
  Trash2,
  AlertCircle,
  LayoutDashboard,
  Settings,
  BookOpen,
  Package,
  History,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  Edit3,
  Download,
  CalendarPlus,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { cn } from './lib/utils';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  updateDoc
} from './firebase';

import { Toaster, toast } from 'sonner';

// --- Types ---

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'client' | 'admin';
}

interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const SERVICES_CONFIG = {
  'Banho e Tosa': { 
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800'
  },
  'Veterinário': { 
    imageUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800'
  },
  'Hospedagem': { 
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'
  }
};

interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

interface Professional {
  id?: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
}

interface AppSettings {
  id?: string;
  name: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  enabledServices: {
    grooming: boolean;
    veterinary: boolean;
    hotel: boolean;
  };
}

// --- Components ---

const Navbar = ({ 
  user, 
  onLogin, 
  onLogout, 
  onOpenDashboard,
  settings
}: { 
  user: UserProfile | null, 
  onLogin: () => void, 
  onLogout: () => void,
  onOpenDashboard: () => void,
  settings: AppSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Serviços', href: '#servicos', show: true },
    { name: 'Equipe', href: '#equipe', show: true },
    { name: 'Contato', href: '#contato', show: true },
  ].filter(l => l.show);

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled 
        ? "bg-bg-light/95 backdrop-blur-md border-b border-soft-gray py-2" 
        : "bg-bg-light py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-soft-gray group-hover:scale-105 transition-transform overflow-hidden">
               <img 
                src="https://lh3.googleusercontent.com/u/0/d/1tnYWkvXY68WVtQQr_Dma0u456ehDhxU9" 
                alt="Logo Guaporé" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl text-slate-900 leading-none tracking-tight italic">Guaporé</span>
              <span className="text-[7px] font-bold text-primary uppercase tracking-[0.2em] mt-1 italic">Estética Animal • Petshop</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-soft-gray">
              {user?.role === 'admin' && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={onOpenDashboard}
                    className="p-2 text-slate-400 hover:text-primary rounded-xl transition-all"
                    title="Dashboard"
                  >
                    <LayoutDashboard size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-soft-gray" referrerPolicy="no-referrer" />
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                    title="Sair"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
              <a 
                href={`https://wa.me/55${settings.contactPhone.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre os serviços.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bg-dark text-white px-6 py-2.5 rounded-full font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
              >
                WhatsApp <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-light border-t border-soft-gray overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="block px-3 py-3 text-sm font-bold uppercase tracking-widest text-slate-600 hover:bg-soft-gray rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 mt-4 border-t border-soft-gray flex flex-col gap-3">
                <a 
                  href={`https://wa.me/55${settings.contactPhone.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre os serviços.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-white text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs"
                >
                  Falar no WhatsApp
                </a>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => { onLogout(); setIsOpen(false); }}
                    className="w-full text-red-400 py-2 font-bold text-sm"
                  >
                    Sair da Conta (Admin)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ settings }: { settings: AppSettings }) => (
  <section id="home" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-bg-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex-1 text-center lg:text-left space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Sparkles size={12} /> Cuidado especializado & carinho
          </div>
          <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] text-slate-900 italic">
            O melhor para <br />
            <span className="text-primary not-italic font-bold underline decoration-soft-gray underline-offset-8">seu melhor amigo.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-80">
            Oferecemos banho, tosa, veterinário e hospedagem com foco total no bem-estar do seu pet. Um novo conceito em estética animal em Ribeirão Preto.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
            <a 
              href={`https://wa.me/55${settings.contactPhone.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre os serviços.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bg-dark text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              Falar no WhatsApp <ArrowRight size={18} />
            </a>
            <a 
              href="#servicos"
              className="bg-white border border-soft-gray px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-soft-gray transition-all flex items-center justify-center gap-3"
            >
              Conhecer serviços
            </a>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex-1 w-full relative"
        >
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary-light/10 rounded-[4rem] rotate-6"></div>
            <div className="absolute inset-0 bg-soft-gray rounded-[4rem] -rotate-3 border border-primary/5"></div>
            <img 
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1000" 
              alt="Pet Care" 
              className="relative w-full h-full object-cover rounded-[4rem] shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Minimal floating card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-soft-gray flex items-center gap-4 hidden sm:flex"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-white">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Atendimento VIP</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase transition-all tracking-widest mt-1 opacity-60">100% Personalizado</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const PainPoints = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl font-serif text-slate-900 italic">O diferencial Guaporé</h2>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">
          Trabalhamos com carinho e técnica para oferecer o melhor tratamento que seu pet já recebeu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {[
          { icon: <Sparkles />, title: "SPA Terapêutico", desc: "Banhoterapia com produtos biodegradáveis e calmantes." },
          { icon: <ShieldCheck />, title: "Segurança Total", desc: "Monitoramento constante e profissionais certificados." },
          { icon: <Timer />, title: "Agilidade & Conforto", desc: "Processos otimizados para reduzir o estresse do pet." },
          { icon: <Heart />, title: "Cuidado Individual", desc: "Cada pet é único e recebe atenção exclusiva." },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="text-center space-y-6 group"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-soft-gray flex items-center justify-center text-primary-light group-hover:bg-primary-light group-hover:text-white transition-all">
              {React.cloneElement(item.icon as React.ReactElement, { size: 32 })}
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl text-slate-900 italic">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const DEFAULT_PROFESSIONALS: Professional[] = [
  {
    id: 'def-1',
    name: 'Dr. Eduardo Guaporé',
    role: 'Veterinário Senior',
    bio: 'Pós-graduado em clínica médica e cirúrgica com 15 anos de atuação dedicada ao bem-estar animal.',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'def-2',
    name: 'Beatriz Lima',
    role: 'Esteticista Canina Master',
    bio: 'Certificada internacionalmente em tratamentos de pelagens complexas e técnicas de tosa tesoura.',
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'def-3',
    name: 'Carlos Alberto',
    role: 'Especialista em Bem-estar',
    bio: 'Especialista em comportamento animal focado em tornar a experiência do pet shop positiva e sem estresse.',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600'
  }
];

const ProfessionalsList = ({ isAdmin }: { isAdmin: boolean }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'professionals'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Professional));
      setProfessionals(pros);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const displayProfessionals = professionals.length > 0 ? professionals : DEFAULT_PROFESSIONALS;

  return (
    <section id="equipe" className="py-24 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl font-serif text-slate-900 italic">Mãos que <span className="text-primary-light not-italic font-bold">cuidam.</span></h2>
          <p className="text-slate-500 font-medium">Nossa equipe é formada por especialistas certificados e apaixonados por pets.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {displayProfessionals.map((pro, idx) => (
              <motion.div 
                key={pro.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group text-center space-y-6"
              >
                <div className="relative mx-auto w-64 h-64 overflow-hidden rounded-full border-4 border-white shadow-xl shadow-bg-dark/5">
                  <img 
                    src={pro.photoUrl} 
                    alt={pro.name} 
                    className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif italic text-slate-900">{pro.name}</h3>
                  <p className="text-[10px] font-bold text-primary-light uppercase tracking-[0.2em]">{pro.role}</p>
                  <p className="text-sm text-slate-500 px-6 mt-4 leading-relaxed line-clamp-3">{pro.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Services = ({ settings }: { settings: AppSettings }) => {
  const services = [
    { id: 'grooming', title: "Banho e Tosa", img: SERVICES_CONFIG['Banho e Tosa'].imageUrl, show: settings.enabledServices.grooming },
    { id: 'veterinary', title: "Veterinário", img: SERVICES_CONFIG['Veterinário'].imageUrl, show: settings.enabledServices.veterinary },
    { id: 'hotel', title: "Hospedagem", img: SERVICES_CONFIG['Hospedagem'].imageUrl, show: settings.enabledServices.hotel },
  ].filter(s => s.show);

  return (
    <section id="servicos" className="py-24 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl font-serif mb-4 text-slate-900 italic">Uma curadoria <br /><span className="text-primary not-italic font-bold">especial.</span></h2>
            <p className="text-slate-500 font-medium">Tudo o que seu pet precisa para viver com saúde e estilo, centralizado em um só lugar.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] bg-soft-gray border border-soft-gray">
                <img 
                  src={service.img} 
                  alt={service.title} 
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] flex justify-between items-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="font-serif text-xl italic text-slate-900">{service.title}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-soft-gray flex items-center justify-center text-slate-400 group-hover:bg-bg-dark group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section id="depoimentos" className="py-24 bg-primary/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-extrabold text-center mb-16 text-slate-900">Clientes e pets felizes 🐶</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: "Mariana Silva", loc: "Ribeirão Preto, SP", text: "O Thor adora vir aqui. O cuidado no banho é excepcional e ele sempre volta cheiroso e muito calmo. Recomendo para todos em Ribeirão!" },
          { name: "Ricardo Oliveira", loc: "Bonfim Paulista, SP", text: "Utilizo o serviço de hospedagem quando viajo e fico totalmente tranquilo. Recebo fotos e vejo que a Luna está sendo muito bem cuidada." },
          { name: "Ana Costa", loc: "Ribeirão Preto, SP", text: "Excelente atendimento veterinário. Profissionais competentes que realmente amam o que fazem e transmitem muita confiança." },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-light p-8 rounded-2xl shadow-sm border border-primary/5 relative"
          >
            <div className="flex text-primary mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
            </div>
            <p className="text-slate-600 mb-6 italic">"{item.text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {item.name[0]}
              </div>
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.loc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Gallery = () => {
  const pets = [
    { name: "Bidu", img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800" },
    { name: "Luna", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800" },
    { name: "Max", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800" },
    { name: "Thor", img: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800" },
    { name: "Nina", img: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <section id="galeria" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Galeria de Fofuras</h2>
          <p className="text-slate-600">Alguns dos nossos clientes especiais brilhando após o tratamento.</p>
        </div>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={16}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {pets.map((pet, idx) => (
            <SwiperSlide key={idx}>
              <div className="overflow-hidden rounded-xl aspect-square relative group shadow-md">
                <img 
                  src={pet.img} 
                  alt={pet.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-bold text-center text-lg">{pet.name}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const Manifesto = () => (
  <section className="py-24 bg-bg-light overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center group shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=2000" 
          alt="Amor Pet" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center max-w-3xl px-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-[0.3em]"
          >
            Nosso Propósito
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif text-white italic leading-tight"
          >
            "Onde o carinho é o primeiro protocolo e o <span className="text-primary-light not-italic font-bold">amor</span> é a nossa maior tradição."
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg font-medium"
          >
            Porque sabemos que para você, ele não é apenas um animal. É parte da família.
          </motion.p>
        </div>
      </div>
    </div>
  </section>
);

const SafetySection = () => (
  <section className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-slate-900 italic">Padrão Ouro de <span className="text-primary not-italic font-bold">Higiene</span></h2>
            <div className="h-1 w-20 bg-primary-light rounded-full"></div>
          </div>
          
          <p className="text-slate-600 text-lg leading-relaxed">
            Na Guaporé, a segurança e a saúde do seu pet são nossa prioridade absoluta. Implementamos protocolos rigorosos de assepsia que vão além do convencional, garantindo um ambiente esterilizado e seguro.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: <ShieldCheck className="text-primary" size={28} />, title: "Esterilização", desc: "Lâminas e tesouras esterilizadas em autoclave após cada uso." },
              { icon: <Wind className="text-primary" size={28} />, title: "Ar Filtrado", desc: "Ambiente climatizado com purificadores de ar constantes." },
              { icon: <Droplets className="text-primary" size={28} />, title: "Toalhas Individuais", desc: "Higienização profissional com produtos biodegradáveis." },
              { icon: <Sparkles className="text-primary" size={28} />, title: "Ambiente Vivo", desc: "Desinfecção completa de todas as bancadas entre sessões." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-bg-light flex items-center justify-center p-2">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{item.title}</h4>
                  <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-y-2 group">
            <img 
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200" 
              alt="Higiene Pet Shop" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          </div>
          {/* Floating accent */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-light/10 rounded-full blur-3xl animate-pulse"></div>
        </motion.div>
      </div>
    </div>
  </section>
);

const MapSection = () => (
  <section className="py-24 bg-bg-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif text-slate-900 italic">Onde <span className="text-primary not-italic font-bold">Estamos</span></h2>
          <p className="text-slate-500 font-medium">Venha nos visitar em Bonfim Paulista ou use o mapa para navegar.</p>
        </div>
        
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[450px] bg-slate-200 border-8 border-white">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.573215284428!2d-47.8037!3d-21.2483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94b9bc9f5c56b775%3A0x6a0c0c0c0c0c0c0c!2sAv.%20Her%C3%A1clito%20Fontoura%20Sobral%20Pinto%2C%20Ribeir%C3%A3o%20Preto%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1714562000000!5m2!1spt-BR!2sbr" 
            className="absolute inset-0 w-full h-full border-0 grayscale-[20%] hover:grayscale-0 transition-all duration-500"
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute bottom-8 right-8 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <MapPin size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Nossa Sede</p>
                <p className="font-bold text-slate-900 text-sm">Bonfim Paulista</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=Av.+Heráclito+Fontoura+Sobral+Pinto+-+Bonfim+Paulista,+Ribeirão+Preto+-+SP" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl group"
          >
            <span>ABRIR NO GPS</span>
            <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

const About = () => (

  <section id="sobre" className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200" 
              alt="Tradição e Confiança" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 p-8 bg-primary rounded-[2.5rem] text-white shadow-xl hidden md:block">
            <p className="font-serif text-3xl italic mb-2">12+</p>
            <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Anos de dedicação absoluta ao seu melhor amigo em Ribeirão Preto.</p>
          </div>
        </div>
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-5xl font-serif text-slate-900 italic">Tradição & <span className="text-primary not-italic font-bold underline decoration-soft-gray underline-offset-8">Confiança.</span></h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fundada em 2012 na charmosa Bonfim Paulista, a Estética Animal Guaporé nasceu de um propósito simples, porém poderoso: elevar o padrão de cuidado animal em Ribeirão Preto. O que começou como um pequeno sonho familiar transformou-se em uma referência regional, onde a tradição do atendimento personalizado encontra a modernidade das melhores técnicas de estética pet.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Nossa história é escrita diariamente com carinho, paciência e o compromisso inabalável de tratar cada animal como parte da nossa própria família.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { icon: <Sparkles size={24} />, title: "Certificação", text: "Profissionais certificados pelas maiores escolas de estética pet do Brasil." },
              { icon: <CheckCircle2 size={24} />, title: "Infraestrutura", text: "Ambientes climatizados e equipamentos de última geração com baixo ruído." },
              { icon: <Heart size={24} />, title: "Amor", text: "Atendimento humanizado focado no emocional e conforto de cada pet." },
              { icon: <ShieldCheck size={24} />, title: "Segurança", text: "Monitoramento constante e protocolos rigorosos de assepsia e higiene." },
            ].map((item, idx) => (
              <div key={idx} className="space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Quais vacinas são obrigatórias para a hospedagem?",
      answer: "Para a segurança de todos os hóspedes, exigimos as vacinas V8 ou V10, Raiva e Gripe em dia. Também solicitamos que o pet esteja com o controle de pulgas e carrapatos atualizado."
    },
    {
      question: "Quanto tempo demora o banho e tosa?",
      answer: "O tempo médio é de 1h30 a 2h, variando conforme o porte do animal, o tipo de pelagem e o serviço escolhido (tosa higiênica, na máquina ou tesoura)."
    },
    {
      question: "Quais as formas de pagamento aceitas?",
      answer: "Aceitamos cartões de crédito e débito (todas as bandeiras), PIX e dinheiro. Oferecemos condições especiais para pacotes mensais de banho."
    },
    {
      question: "O atendimento veterinário precisa de agendamento?",
      answer: "Recomendamos entrar em contato previamente pelo nosso WhatsApp para garantir o melhor atendimento para seu pet, mas atendemos casos de urgência conforme disponibilidade."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-bg-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-serif text-slate-900 italic">Dúvidas</h2>
          <p className="text-slate-500 font-medium">As principais perguntas sobre nossos serviços.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-[2rem] border border-soft-gray overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 text-left flex justify-between items-center transition-colors"
              >
                <span className="font-serif text-xl italic text-slate-800">{faq.question}</span>
                <ChevronDown 
                  className={cn("text-primary-light transition-transform duration-500", openIndex === idx && "rotate-180")} 
                  size={20} 
                />
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-slate-500 font-medium text-sm leading-relaxed pt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', pet: '', service: 'Banho e Tosa', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const text = `Olá, gostaria de saber mais sobre os serviços! \nNome: ${formData.name} \nPet: ${formData.pet} \nServiço: ${formData.service} \nMensagem: ${formData.message}`;
    window.open(`https://wa.me/5516997795601?text=${encodeURIComponent(text)}`, '_blank');
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Resetar mensagem de sucesso após 5 segundos
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section id="contato" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="flex-1 p-8 lg:p-16 text-white space-y-8">
            <h2 className="text-4xl font-extrabold">Fale conosco!</h2>
            <p className="text-white/80 text-lg">Preencha o formulário e nossa equipe entrará em contato via WhatsApp para tirar suas dúvidas.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <MapPin className="text-white shrink-0" size={32} />
                <div>
                  <p className="font-bold">Endereço</p>
                  <p className="text-white/70 italic text-sm sm:text-base">Av. Heráclito Fontoura Sobral Pinto - Bonfim Paulista, Ribeirão Preto - SP, 14022-090</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-white shrink-0" size={32} />
                <div>
                  <p className="font-bold">Telefones</p>
                  <p className="text-white/70 italic">(16) 99779-5601 / (16) 99252-9012</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="text-white shrink-0" size={32} />
                <div>
                  <p className="font-bold">Horário de Funcionamento</p>
                  <p className="text-white/70 italic">Segunda a Sábado: 08:00 às 18:00</p>
                </div>
              </div>
            </div>
            
            {/* Google Maps Integration */}
            <div className="mt-8 rounded-2xl overflow-hidden border-2 border-white/20 h-48 sm:h-64 shadow-inner">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.841857943015!2d-47.8188176!3d-21.2381517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94b9be385f8c6797%3A0x6d8b9f8b9f8b9f8b!2sAv.%20Her%C3%A1clito%20Fontoura%20Sobral%20Pinto%2C%20Ribeir%C3%A3o%20Preto%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1709900000000!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Estética Animal Guaporé"
              ></iframe>
            </div>
          </div>
          <div className="flex-1 bg-white p-8 lg:p-16">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Seu Nome</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary" 
                  placeholder="Digite seu nome completo" 
                  required 
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">Seu WhatsApp</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary" 
                    placeholder="(16) 99999-9999" 
                    required 
                    type="tel"
                    disabled={isSubmitting}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">Nome do Pet</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary" 
                    placeholder="Nome do seu amigo" 
                    required
                    disabled={isSubmitting}
                    value={formData.pet}
                    onChange={e => setFormData({...formData, pet: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Serviço Desejado</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                  value={formData.service}
                  disabled={isSubmitting}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                >
                  <option>Banho e Tosa</option>
                  <option>Veterinário</option>
                  <option>Hospedagem</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Mensagem (Opcional)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary" 
                  placeholder="Conte-nos mais detalhes..." 
                  rows={3}
                  disabled={isSubmitting}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="consent" 
                  required 
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="consent" className="text-xs text-slate-500 leading-relaxed">
                  Concordo com o processamento dos meus dados para fins de contato, conforme a <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-privacy'))} className="text-primary font-bold hover:underline">Política de Privacidade</button>.
                </label>
              </div>
              <button 
                className={cn(
                  "w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
                  isSubmitting ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 active:scale-[0.98]"
                )}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Processando...
                  </>
                ) : (
                  <>Enviar via WhatsApp <Send size={20} /></>
                )}
              </button>
              
              {isSuccess && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-emerald-600 font-bold text-sm mt-2"
                >
                  Redirecionando para o WhatsApp... 🐾
                </motion.p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};



const Footer = ({ user, onLogin }: { user: UserProfile | null, onLogin: () => void }) => (
  <footer className="bg-bg-light border-t border-soft-gray py-24 text-slate-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
        <div className="space-y-8 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-soft-gray overflow-hidden">
               <img 
                src="https://lh3.googleusercontent.com/u/0/d/1tnYWkvXY68WVtQQr_Dma0u456ehDhxU9" 
                alt="Logo Guaporé" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-serif text-2xl text-slate-900 italic">Guaporé</span>
          </div>
          <p className="text-sm leading-relaxed font-medium">
            Referência em estética pet e hospedagem em Bonfim Paulista, Ribeirão Preto. Onde o amor pelos animais vem em primeiro lugar.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/esteticanimalguapore" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-soft-gray flex items-center justify-center hover:bg-bg-dark hover:text-white transition-all">
              <Instagram size={20} />
            </a>
            <a href="mailto:contato@guapore.com" className="w-12 h-12 rounded-full border border-soft-gray flex items-center justify-center hover:bg-bg-dark hover:text-white transition-all">
              <Mail size={20} />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-serif text-xl italic text-slate-900 mb-8">Navegação</h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-[10px]">
            {['Início', 'Serviços', 'Equipe', 'Contato'].map(link => (
              <li key={link}><a href={`#${link.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")}`} className="hover:text-primary transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-xl italic text-slate-900 mb-8">Contato</h4>
          <ul className="space-y-6 text-sm font-medium">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-primary-light shrink-0" />
              <span>Av. Heráclito Fontoura Sobral Pinto - Bonfim Paulista<br />Ribeirão Preto - SP</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-primary-light shrink-0" />
              <span>(16) 99779-5601</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-primary-light shrink-0" />
              <span>contato@petguapore.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-xl italic text-slate-900 mb-8">Horários</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex justify-between border-b border-soft-gray pb-2">
              <span>Segunda - Sexta</span>
              <span className="font-bold text-slate-900">08:00 - 18:00</span>
            </li>
            <li className="flex justify-between border-b border-soft-gray pb-2">
              <span>Sábado</span>
              <span className="font-bold text-slate-900">08:00 - 14:00</span>
            </li>
            <li className="flex justify-between text-slate-300">
              <span>Domingo</span>
              <span>Fechado</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="pt-12 border-t border-soft-gray flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">&copy; {new Date().getFullYear()} Estética Animal Guaporé. Todos os direitos reservados.</p>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-privacy'))} className="hover:text-primary transition-colors">Privacidade</button>
          {!user && (
            <button onClick={onLogin} className="opacity-0 hover:opacity-10 cursor-default">Admin</button>
          )}
          <a href="#" className="hover:text-primary transition-colors">Termos</a>
        </div>
      </div>
    </div>
  </footer>
);
const FloatingWhatsApp = () => (
  <a 
    href="https://wa.me/5516997795601?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20falar%20com%20vocês." 
    target="_blank" 
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
  >
    <MessageCircle size={32} fill="currentColor" />
  </a>
);

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Olá! Sou o assistente virtual da Estética Animal Guaporé. Como posso ajudar você e seu pet hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `Você é o assistente virtual da "Estética Animal Guaporé", um centro de estética e bem-estar pet em Ribeirão Preto (Bonfim Paulista).
          Seu objetivo é ajudar os clientes com informações sobre os serviços e horários da clínica.
          
          Informações Importantes:
          - Localização: Av. Heráclito Fontoura Sobral Pinto - Bonfim Paulista, Ribeirão Preto - SP, 14022-090.
          - Serviços: Banho e Tosa, Atendimento Veterinário, Hospedagem Pet (Hotel).
          - Horário: Segunda a Sábado, das 08:00 às 18:00. Não abrimos aos feriados.
          - Observação: Hoje, dia 1º de Maio (feriado), o petshop está FECHADO.
          - Contato/WhatsApp: (16) 99779-5601.
          - Vacinas para Hospedagem: V8/V10, Raiva e Gripe (obrigatórias).
          
          Diretrizes de Comportamento:
          - Seja extremamente gentil, atencioso e apaixonado por animais.
          - Use emojis de pets (🐾, 🐶, 🐱).
          - MANTENHA AS RESPOSTAS CURTAS E DIRETAS (máximo 3-4 frases).
          - NÃO USE ASTERISCOS (**) OU QUALQUER FORMATAÇÃO MARKDOWN. Escreva apenas texto puro.
          - Se o cliente perguntar sobre algo fora do escopo pet (como venda de carros), responda educadamente que somos exclusivos para cuidados animais.
          - Se o cliente quiser saber mais ou solicitar um serviço, oriente-o a entrar em contato diretamente pelo WhatsApp (16) 99779-5601.
          - Se você não souber a resposta, estiver em dúvida ou se o caso for urgente, informe o WhatsApp (16) 99779-5601 e diga que nossa equipe irá atendê-los assim que possível.`
        }
      });

      const response = await model;
      let aiText = response.text || "Desculpe, tive um probleminha para processar sua mensagem. Pode tentar novamente?";
      
      // Limpar asteriscos caso a IA ignore a instrução do sistema
      aiText = aiText.replace(/\*\*/g, '');
      
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Erro na IA:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Ops! Estou com dificuldades técnicas agora. Por favor, use nosso WhatsApp para falar com a equipe! 🐾" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-[320px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-primary/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <p className="font-bold leading-none">Assistente Guaporé</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Online agora 🐾</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="h-[350px] overflow-y-auto p-4 space-y-4 bg-slate-50"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex gap-2 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 mr-auto max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm shadow-sm border border-slate-100 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span>Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              >
                <input 
                  type="text" 
                  placeholder="Tire sua dúvida aqui..."
                  className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95",
          isOpen ? "bg-slate-800 text-white" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X size={32} /> : <Bot size={32} />}
      </button>
    </div>
  );
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-24 md:max-w-md z-[60] bg-white rounded-2xl shadow-2xl border border-primary/10 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-primary" size={24} />
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Privacidade e Cookies</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Utilizamos cookies para melhorar sua experiência e garantir a segurança dos seus dados. Ao continuar, você concorda com nossa política.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleAccept}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Aceitar
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-privacy'))}
                  className="text-slate-500 font-bold text-sm hover:text-primary transition-colors"
                >
                  Saber mais
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const AdminDashboard = ({ 
  user, 
  onClose, 
  settings, 
  onUpdateSettings 
}: { 
  user: UserProfile, 
  onClose: () => void,
  settings: AppSettings,
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'professionals' | 'settings' | 'tutorial'>('overview');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [editingProfessional, setEditingProfessional] = useState<Partial<Professional> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'professional', name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPros = onSnapshot(query(collection(db, 'professionals'), orderBy('name')), (snap) => {
      setProfessionals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Professional)));
    });

    setLoading(false);
    return () => {
      unsubPros();
    };
  }, []);

  const handleDeleteProfessional = async (proId: string) => {
    try {
      await deleteDoc(doc(db, 'professionals', proId));
      toast.success('Profissional excluído.');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Erro ao excluir profissional.');
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'professional') handleDeleteProfessional(deleteConfirm.id);
  };

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfessional) return;
    
    try {
      const data = {
        name: editingProfessional.name,
        role: editingProfessional.role,
        bio: editingProfessional.bio,
        photoUrl: editingProfessional.photoUrl
      };
      
      if (editingProfessional.id) {
        await updateDoc(doc(db, 'professionals', editingProfessional.id), data);
        toast.success('Profissional atualizado!');
      } else {
        await addDoc(collection(db, 'professionals'), data);
        toast.success('Profissional adicionado!');
      }
      setEditingProfessional(null);
    } catch (error) {
      toast.error('Erro ao salvar profissional.');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Olá, {user.displayName} 👋</h3>
          <p className="text-slate-500">Bem-vindo ao painel administrativo da {settings.name}.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setActiveTab('professionals')}>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Equipe</p>
            <p className="text-3xl font-bold text-slate-900">{professionals.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setActiveTab('settings')}>
          <div className="w-16 h-16 bg-slate-900/10 text-slate-900 rounded-2xl flex items-center justify-center">
            <Settings size={32} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configurações</p>
            <p className="text-sm font-bold text-slate-900">Personalize seu site</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={20} className="text-primary" /> Configurações Gerais
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome do Pet Shop</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              value={settings.name}
              onChange={e => onUpdateSettings({...settings, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cor Principal (Hex)</label>
            <input 
              type="color" 
              className="w-full h-12 p-1 rounded-xl border-slate-200 cursor-pointer"
              value={settings.primaryColor}
              onChange={e => onUpdateSettings({...settings, primaryColor: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo URL</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              value={settings.logoUrl}
              onChange={e => onUpdateSettings({...settings, logoUrl: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Favicon URL</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              value={settings.faviconUrl}
              onChange={e => onUpdateSettings({...settings, faviconUrl: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h5 className="font-bold text-slate-900 mb-4">Serviços Ativos</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'grooming', label: 'Banho e Tosa' },
              { id: 'veterinary', label: 'Veterinário' },
              { id: 'hotel', label: 'Hospedagem' },
            ].map(service => (
              <label key={service.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  checked={(settings.enabledServices as any)[service.id]}
                  onChange={e => onUpdateSettings({
                    ...settings, 
                    enabledServices: { ...settings.enabledServices, [service.id]: e.target.checked }
                  })}
                />
                <span className="font-bold text-slate-700 text-sm">{service.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTutorial = () => (
    <div className="max-w-4xl bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
      <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen size={24} className="text-primary" /> Tutorial do Administrador
      </h4>
      
      <div className="space-y-6">
        <section className="space-y-3">
          <h5 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">1</span>
            Personalização (White Label)
          </h5>
          <p className="text-slate-600 text-sm leading-relaxed">
            Na aba "Configurações", você pode alterar o logotipo, favicon e as cores do sistema. Isso permite que você adapte a plataforma para a identidade visual do pet shop. Você também pode escolher quais serviços aparecem na vitrine principal.
          </p>
        </section>

        <section className="space-y-3">
          <h5 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">2</span>
            Gerenciando a Equipe
          </h5>
          <p className="text-slate-600 text-sm leading-relaxed">
            Na aba "Equipe", você pode adicionar, editar ou excluir os profissionais do pet shop. É possível alterar a foto, o cargo e a descrição de cada um. O design é otimizado para transmitir confiança aos seus clientes.
          </p>
        </section>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Admin Panel</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Controle Total</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
            { id: 'professionals', label: 'Equipe', icon: <Users size={18} /> },
            { id: 'settings', label: 'Configurações', icon: <Settings size={18} /> },
            { id: 'tutorial', label: 'Tutorial', icon: <BookOpen size={18} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            <Eye size={18} /> Ver Site
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Administrador</p>
            </div>
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-primary/20" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={48} className="animate-spin text-primary opacity-20" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'tutorial' && renderTutorial()}
              {activeTab === 'professionals' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900">Gerenciar Equipe</h4>
                    <button 
                      onClick={() => setEditingProfessional({ name: '', role: '', bio: '', photoUrl: '' })}
                      className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                    >
                      <Plus size={18} /> Novo Profissional
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map(pro => (
                      <div key={pro.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
                        <img src={pro.photoUrl} className="w-24 h-24 rounded-2xl object-cover" alt="" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-primary uppercase">{pro.role}</p>
                          <h5 className="font-bold text-slate-900">{pro.name}</h5>
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => setEditingProfessional(pro)}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm({ id: pro.id!, type: 'professional', name: pro.name })}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tem certeza?</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Você está prestes a excluir <strong>{deleteConfirm.name}</strong>. Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Edit Modal */}
      <AnimatePresence>
        {editingProfessional && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">{editingProfessional.id ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                <button onClick={() => setEditingProfessional(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveProfessional} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                    value={editingProfessional.name}
                    onChange={e => setEditingProfessional({...editingProfessional, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Especialidade / Cargo</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                    value={editingProfessional.role}
                    onChange={e => setEditingProfessional({...editingProfessional, role: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">URL da Foto</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                    value={editingProfessional.photoUrl}
                    onChange={e => setEditingProfessional({...editingProfessional, photoUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio / Descrição</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                    value={editingProfessional.bio}
                    onChange={e => setEditingProfessional({...editingProfessional, bio: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Salvar Profissional
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PrivacyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-privacy', handleOpen);
    return () => window.removeEventListener('open-privacy', handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-primary text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} />
                <h3 className="text-xl font-bold">Política de Privacidade</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 text-slate-600 leading-relaxed">
              <section>
                <h4 className="font-bold text-slate-900 mb-2">1. Coleta de Dados</h4>
                <p>Coletamos apenas as informações necessárias para prestar o melhor serviço ao seu pet e entrar em contato: nome, WhatsApp, nome do pet e serviço de interesse.</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">2. Uso das Informações</h4>
                <p>Seus dados são utilizados exclusivamente para comunicação direta sobre serviços, dúvidas e novidades da Estética Animal Guaporé. Nunca compartilhamos seus dados com terceiros.</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">3. Segurança</h4>
                <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado ou uso indevido.</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">4. Seus Direitos</h4>
                <p>Você tem o direito de solicitar a exclusão ou alteração de seus dados a qualquer momento através do nosso WhatsApp oficial.</p>
              </section>
              <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">Última atualização: Março de 2024. Estética Animal Guaporé - Ribeirão Preto/SP.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Helpers ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    name: 'Estética Animal Guaporé',
    logoUrl: 'https://lh3.googleusercontent.com/u/0/d/1tnYWkvXY68WVtQQr_Dma0u456ehDhxU9',
    faviconUrl: 'https://lh3.googleusercontent.com/u/0/d/1tnYWkvXY68WVtQQr_Dma0u456ehDhxU9',
    primaryColor: '#d48a94',
    contactPhone: '(16) 99779-5601',
    contactEmail: 'contato@esteticaanimal.com',
    address: 'Bonfim Paulista, Ribeirão Preto/SP',
    enabledServices: {
      grooming: true,
      veterinary: true,
      hotel: true,
    }
  });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings);
      } else {
        setDoc(doc(db, 'settings', 'global'), settings);
      }
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = settings.faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = settings.name;
    
    // Update primary color dynamically
    document.documentElement.style.setProperty('--primary', settings.primaryColor);
  }, [settings]);

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    await setDoc(doc(db, 'settings', 'global'), newSettings);
    toast.success('Configurações atualizadas com sucesso!');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: firebaseUser.email === 'ambriautopecas@gmail.com' ? 'admin' : 'client'
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-primary mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse">Carregando {settings.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light selection:bg-primary/30 selection:text-primary">
      <Toaster position="top-center" richColors />
      
      {user?.role === 'admin' && showAdminDashboard ? (
        <AdminDashboard 
          user={user} 
          onClose={() => setShowAdminDashboard(false)} 
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : (
        <>
          <Navbar 
            user={user} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
            onOpenDashboard={() => setShowAdminDashboard(true)}
            settings={settings}
          />
          <main>
            <Hero settings={settings} />
            <PainPoints />
            <Services settings={settings} />
            <ProfessionalsList isAdmin={user?.role === 'admin'} />
            <Testimonials />
            <Gallery />
            <About />
            <SafetySection />
            <Manifesto />
            <FAQ />
            <MapSection />
            <Contact />

          </main>
          <Footer user={user} onLogin={handleLogin} />
          <FloatingWhatsApp />
          <AIChatAssistant />
          <CookieConsent />
          <PrivacyModal />
        </>
      )}
    </div>
  );
}
