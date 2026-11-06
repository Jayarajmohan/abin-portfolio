import "@/styles/globals.css";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Layout from "@/components/layout/Layout";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export default function App({ Component, pageProps }) {
  return (
    <div className={`${display.variable} ${sans.variable} ${mono.variable} font-sans`}>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SmoothScroll>
      </MotionConfig>
    </div>
  );
}
