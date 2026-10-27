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

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.hidden = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeIndex;
      dot.setAttribute('aria-current', String(active));
    });
  };

  previousButton?.addEventListener('click', () => showSlide(activeIndex - 1));
  nextButton?.addEventListener('click', () => showSlide(activeIndex + 1));
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => showSlide(dotIndex));
  });
  showSlide(activeIndex);
});

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
