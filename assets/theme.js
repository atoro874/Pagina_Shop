document.querySelectorAll('[data-slider]').forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const previousButton = slider.querySelector('[data-slider-previous]');
  const nextButton = slider.querySelector('[data-slider-next]');
  const dots = Array.from(slider.querySelectorAll('[data-slider-dot]'));

  if (slides.length < 2) {
    previousButton?.setAttribute('hidden', '');
    nextButton?.setAttribute('hidden', '');
    dots.forEach((dot) => dot.setAttribute('hidden', ''));
    return;
  }

  let activeIndex = slides.findIndex((slide) => !slide.hidden);
  if (activeIndex < 0) activeIndex = 0;
  let isTransitioning = false;

  const updateDots = () => {
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeIndex;
      dot.setAttribute('aria-current', String(active));
    });
  };

  const showSlide = (index, direction) => {
    if (isTransitioning) return;

    const nextIndex = (index + slides.length) % slides.length;
    if (nextIndex === activeIndex) return;

    isTransitioning = true;
    const currentSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];
    nextSlide.hidden = false;
    nextSlide.inert = false;
    nextSlide.setAttribute('aria-hidden', 'false');
    nextSlide.classList.add(
      'is-entering',
      direction === 'previous' ? 'is-entering--from-left' : 'is-entering--from-right'
    );
    currentSlide.inert = true;
    currentSlide.setAttribute('aria-hidden', 'true');
    activeIndex = nextIndex;
    updateDots();

    let fallbackTimeout;
    const finishTransition = () => {
      if (!isTransitioning) return;

      window.clearTimeout(fallbackTimeout);
      nextSlide.removeEventListener('transitionend', onTransitionEnd);
      currentSlide.hidden = true;
      currentSlide.classList.remove('is-leaving');
      nextSlide.classList.remove('is-entering', 'is-entering--from-left', 'is-entering--from-right');
      isTransitioning = false;
    };
    const onTransitionEnd = (event) => {
      if (event.target === nextSlide && event.propertyName === 'clip-path') {
        finishTransition();
      }
    };

    currentSlide.classList.add('is-leaving');
    nextSlide.addEventListener('transitionend', onTransitionEnd);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishTransition();
      return;
    }

    window.requestAnimationFrame(() => {
      nextSlide.classList.add('is-transitioning');
    });
    fallbackTimeout = window.setTimeout(finishTransition, 800);
  };

  previousButton?.addEventListener('click', () => showSlide(activeIndex - 1, 'previous'));
  nextButton?.addEventListener('click', () => showSlide(activeIndex + 1, 'next'));
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => showSlide(dotIndex, dotIndex < activeIndex ? 'previous' : 'next'));
  });
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === activeIndex;
    slide.hidden = !active;
    slide.inert = !active;
    slide.setAttribute('aria-hidden', String(!active));
  });
  updateDots();
});

const parallaxSections = Array.from(document.querySelectorAll('[data-parallax]'));
if (parallaxSections.length > 0) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let parallaxFrame = 0;

  const updateParallax = () => {
    parallaxFrame = 0;

    parallaxSections.forEach((section) => {
      if (reducedMotion.matches) {
        section.style.setProperty('--parallax-offset', '0px');
        return;
      }

      const bounds = section.getBoundingClientRect();
      const distanceFromCenter = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const strength = Number(section.dataset.parallaxSpeed) / 100;
      const offset = Math.max(-40, Math.min(40, distanceFromCenter * strength));
      section.style.setProperty('--parallax-offset', `${offset.toFixed(1)}px`);
    });
  };

  const requestParallaxUpdate = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestParallaxUpdate);
  reducedMotion.addEventListener('change', requestParallaxUpdate);
}

document.querySelectorAll('[data-coming-soon]').forEach((page) => {
  if (window.Shopify?.designMode) return;

  const countdown = page.querySelector('[data-countdown]');
  const returnUrl = page.dataset.returnUrl;
  let secondsRemaining = Number(page.dataset.redirectSeconds);

  if (!Number.isFinite(secondsRemaining) || secondsRemaining <= 0 || !returnUrl) return;

  const interval = window.setInterval(() => {
    secondsRemaining -= 1;

    if (countdown) {
      countdown.textContent = countdown.dataset.label.replace('{seconds}', String(secondsRemaining));
    }

    if (secondsRemaining <= 0) {
      window.clearInterval(interval);
      window.location.assign(returnUrl);
    }
  }, 1000);
});
