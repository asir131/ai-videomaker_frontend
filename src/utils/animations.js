import gsap from 'gsap';

export const fadeInUp = (element, delay = 0) => {
    gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' }
    );
};

export const staggerFadeIn = (elements, stagger = 0.1) => {
    gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger, ease: 'power2.out' }
    );
};

export const scaleIn = (element, delay = 0) => {
    gsap.fromTo(
        element,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, delay, ease: 'back.out(1.7)' }
    );
};

export const slideInRight = (element, delay = 0) => {
    gsap.fromTo(
        element,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, delay, ease: 'power3.out' }
    );
};

// GPU-accelerated hover scale animation
export const scaleOnHover = (element, scale = 1.05) => {
    if (!element) return;
    const handleMouseEnter = () => {
        gsap.to(element, {
            scale,
            duration: 0.3,
            ease: 'power2.out',
            transformOrigin: 'center',
        });
    };
    const handleMouseLeave = () => {
        gsap.to(element, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
        });
    };
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
    };
};

// Subtle pulse for loading states
export const pulse = (element, duration = 1.5) => {
    if (!element) return;
    gsap.to(element, {
        opacity: 0.6,
        duration: duration / 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
    });
};

// Smooth state change animation
export const smoothStateChange = (element, fromState, toState, duration = 0.3) => {
    if (!element) return;
    gsap.fromTo(
        element,
        fromState,
        {
            ...toState,
            duration,
            ease: 'power2.out',
        }
    );
};