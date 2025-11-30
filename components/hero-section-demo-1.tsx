"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wallet, Zap, Shield, TrendingUp } from "lucide-react";

interface HeroSectionOneProps {
  onGetStarted?: () => void;
}

export default function HeroSectionOne({ onGetStarted }: HeroSectionOneProps = {}) {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <Navbar onConnectWallet={onGetStarted} />
      
      {/* Decorative Lines */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-border">
        <motion.div 
          className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-chart-1 to-transparent"
          animate={{ y: [0, 100, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-border">
        <motion.div 
          className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-chart-2 to-transparent"
          animate={{ y: [100, 0, 100] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-border">
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 h-px w-40 bg-gradient-to-r from-transparent via-chart-1 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      <div className="px-4 py-10 md:py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground border border-border hover:bg-muted transition-colors">
            <Zap className="w-4 h-4 mr-2 text-chart-1" />
            Powered by Cardano Blockchain
          </Badge>
        </motion.div>

        {/* Hero Title */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-foreground md:text-4xl lg:text-7xl">
          {"Send money to South Asia instantly at the lowest fees"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className={`mr-2 inline-block ${
                  ["instantly", "lowest"].includes(word.toLowerCase()) 
                    ? "text-chart-1" 
                    : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-muted-foreground"
        >
          RemitAI makes international remittance affordable and instant for South Asian countries.
          Powered by Cardano blockchain with AI-driven exchange rates and secure wallet integration.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-3 mt-6"
        >
          {[
            { icon: Shield, text: "Bank-grade Security", color: "text-chart-3" },
            { icon: Zap, text: "Instant Transfers", color: "text-chart-1" },
            { icon: TrendingUp, text: "Best Rates", color: "text-chart-2" },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm text-secondary-foreground"
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              {item.text}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="w-60 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg group"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-60 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5"
          >
            Learn More
          </Button>
        </motion.div>

        {/* Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="relative z-10 mt-20"
        >
          <Card className="overflow-hidden border-border shadow-xl bg-card">
            <CardContent className="p-4">
              <div className="w-full overflow-hidden rounded-lg border border-border bg-muted">
                <DashboardPreview />
              </div>
            </CardContent>
          </Card>
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 top-10 hidden lg:block"
          >
            <Card className="p-3 shadow-lg border-border bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate Updated</p>
                  <p className="text-sm font-semibold text-card-foreground">+1.2% today</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 bottom-20 hidden lg:block"
          >
            <Card className="p-3 shadow-lg border-border bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-chart-1/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-chart-1" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transfer Speed</p>
                  <p className="text-sm font-semibold text-card-foreground">&lt; 2 minutes</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

const DashboardPreview = () => {
  const stats = [
    { label: "Exchange Rate", value: "₹83.42", change: "↑ 1.2%", changeColor: "text-chart-2" },
    { label: "Transaction Fee", value: "0.5%", change: "Lowest fees", changeColor: "text-chart-2" },
    { label: "Speed", value: "<2min", change: "Instant", changeColor: "text-chart-1" },
  ];

  const flags = ['🇮🇳', '🇵🇰', '🇧🇩', '🇳🇵', '🇱🇰'];

  return (
    <div className="aspect-[16/9] p-6 md:p-8 space-y-6 bg-card">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground shadow-md">
            R
          </div>
          <div>
            <h3 className="text-card-foreground font-bold text-lg">RemitAI Dashboard</h3>
            <p className="text-chart-1 text-xs">Powered by Cardano</p>
          </div>
        </div>
        <Badge className="bg-primary text-primary-foreground border-0 shadow-md">
          <Wallet className="w-3 h-3 mr-1" />
          Wallet Connected
        </Badge>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-secondary rounded-lg p-3 md:p-4 border border-border hover:border-primary/50 transition-colors"
          >
            <p className="text-muted-foreground text-xs mb-1">{stat.label}</p>
            <p className="text-card-foreground font-bold text-lg md:text-xl">{stat.value}</p>
            <p className={`${stat.changeColor} text-xs`}>{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction Form Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="bg-accent rounded-lg p-4 md:p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-card-foreground font-semibold">Send Money</h4>
          <div className="flex gap-1 md:gap-2">
            {flags.map((flag, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.2 }}
                className="text-xl md:text-2xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {flag}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-background rounded-lg p-3 border border-border hover:border-chart-1/50 transition-colors"
          >
            <p className="text-muted-foreground text-xs mb-1">You Send</p>
            <p className="text-card-foreground font-bold text-sm md:text-base">$1,000 USD</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-background rounded-lg p-3 border border-border hover:border-chart-2/50 transition-colors"
          >
            <p className="text-muted-foreground text-xs mb-1">They Receive</p>
            <p className="text-card-foreground font-bold text-sm md:text-base">₹83,420 INR</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ onConnectWallet }: { onConnectWallet?: () => void }) => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full items-center justify-between border-t border-b border-border px-4 py-4 bg-background/80 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="size-7 rounded-lg bg-primary shadow-md" 
        />
        <h1 className="text-base font-bold md:text-2xl text-foreground">RemitAI</h1>
      </div>
      <Button
        onClick={onConnectWallet}
        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
      >
        <Wallet className="w-4 h-4 mr-2" />
        <span className="hidden md:inline">Connect Wallet</span>
        <span className="md:hidden">Connect</span>
      </Button>
    </motion.nav>
  );
};