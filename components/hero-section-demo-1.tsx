"use client";


import { motion } from "framer-motion";

interface HeroSectionOneProps {
  onGetStarted?: () => void;
}

export default function HeroSectionOne({ onGetStarted }: HeroSectionOneProps = {}) {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <Navbar onConnectWallet={onGetStarted} />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Send money to South Asia instantly at the lowest fees"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          RemitAI makes international remittance affordable and instant for South Asian countries.
          Powered by Cardano blockchain with AI-driven exchange rates and secure wallet integration.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="w-60 transform rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/50"
          >
            Get Started
          </button>
          <button className="w-60 transform rounded-lg border border-cyan-500 bg-transparent px-6 py-2 font-medium text-cyan-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-500/10">
            Learn More
          </button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
            {/* Mock Dashboard Preview */}
            <div className="aspect-[16/9] p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white">
                    R
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">RemitAI Dashboard</h3>
                    <p className="text-cyan-400 text-xs">Powered by Cardano</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white text-sm font-medium">
                  Wallet Connected
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-cyan-300 text-xs mb-1">Exchange Rate</p>
                  <p className="text-white font-bold text-xl">₹83.42</p>
                  <p className="text-green-400 text-xs">↑ 1.2%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-cyan-300 text-xs mb-1">Transaction Fee</p>
                  <p className="text-white font-bold text-xl">0.5%</p>
                  <p className="text-green-400 text-xs">Lowest fees</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-cyan-300 text-xs mb-1">Speed</p>
                  <p className="text-white font-bold text-xl">&lt;2min</p>
                  <p className="text-cyan-400 text-xs">Instant</p>
                </div>
              </div>

              {/* Transaction Form Preview */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Send Money</h4>
                  <div className="flex gap-2">
                    {['🇮🇳', '🇵🇰', '🇧🇩', '🇳🇵', '🇱🇰'].map((flag, i) => (
                      <span key={i} className="text-2xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-cyan-300 text-xs mb-1">You Send</p>
                    <p className="text-white font-bold">$1,000 USD</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-cyan-300 text-xs mb-1">They Receive</p>
                    <p className="text-white font-bold">₹83,420 INR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = ({ onConnectWallet }: { onConnectWallet?: () => void }) => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400" />
        <h1 className="text-base font-bold md:text-2xl">RemitAI</h1>
      </div>
      <button
        onClick={onConnectWallet}
        className="w-32 transform rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:w-40"
      >
        Connect Wallet
      </button>
    </nav>
  );
};
