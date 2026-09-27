// Contacts: email decoding and copy, ray and glow effects,
// footer reveal triggers.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../core/env.js';
import { parallax, reveal } from '../core/motion.js';

export const initContacts = () => {
  const contacts = document.querySelector('.contacts');
  const copy = contacts.querySelector('.contacts__copy');
  const emailField = contacts.querySelector('.contacts__email');
  const email = atob(emailField.dataset.email);
  emailField.textContent = email;

  let resetTimer;

  // Copy button and email field
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      console.error('Failed to copy: ', err);
      return;
    }
    copy.classList.add('is-copied');
    copy.ariaLabel = 'Email address copied';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copy.classList.remove('is-copied');
      copy.ariaLabel = 'Copy the email address';
    }, 2000);
  };
  copy.addEventListener('click', copyEmail);
  emailField.addEventListener('click', copyEmail);

  // Ray grows while the section comes in
  // The section for the ray (::before), and the form
  parallax([contacts, contacts.querySelector('.contacts__form')], '--contacts-parallax', 0, 1, { trigger: contacts, start: 'top bottom', end: 'bottom bottom' });

  // Glows follow the mouse (fine pointers, on screen)
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const toX = gsap.quickTo(contacts, '--pointer-x', { duration: 1.2, ease: 'power3.out' });
    const toY = gsap.quickTo(contacts, '--pointer-y', { duration: 1.2, ease: 'power3.out' });
    const inView = ScrollTrigger.create({ trigger: contacts, start: 'top bottom', end: 'max' });
    window.addEventListener('mousemove', (e) => {
      if (!inView.isActive) return;
      toX(e.clientX / window.innerWidth * 2 - 1);
      toY(e.clientY / window.innerHeight * 2 - 1);
    }, { passive: true });
  }

  // Footer artwork and arc; here, not in initFooter: must follow the pins
  parallax('.footer', '--footer-reveal', 0, 1, { trigger: contacts, start: 'bottom bottom', end: 'max' });

  parallax(contacts, '--contacts-arc', 0, 1, { trigger: contacts, start: 'bottom bottom+=300', end: 'max' });

  reveal(contacts);
};
