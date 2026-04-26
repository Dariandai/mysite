export {};

declare global {
  interface GsapLike {
    set: (target: unknown, vars: Record<string, unknown>) => unknown;
    to: (target: unknown, vars: Record<string, unknown>) => unknown;
  }

  interface Window {
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    goBack: () => void;
    openSocialModal: () => void;
    closeSocialModal: () => void;
    copyEmail: (email: string) => void;
    stackingCardsInstance?: {
      scrollToSection: (index: number) => void;
      getCurrentIndex?: () => number;
    };
  }

  const gsap: GsapLike;
  const ScrollTrigger: unknown;
}
