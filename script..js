// Counter Animation
const counters = {
  clients: 950,
  projects: 500,
  successRate: 95
};

const animateCounters = () => {
  let steps = 60;
  let duration = 2000;
  let stepTime = duration / steps;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    let progress = Math.min(currentStep / steps, 1);
    document.getElementById('clients').textContent = Math.floor(progress * counters.clients);
    document.getElementById('projects').textContent = Math.floor(progress * counters.projects);
    document.getElementById('successRate').textContent = Math.floor(progress * counters.successRate) + '%';

    if (currentStep >= steps) clearInterval(interval);
  }, stepTime);
};

document.addEventListener("DOMContentLoaded", animateCounters);

// Testimonials
const testimonials = [
  { text: "Meta Plus Media transformed our online presence completely...", author: "Jennifer K." },
  { text: "Working with this team has been a game-changer...", author: "Michael T." },
  { text: "Their strategy resulted in 200% increase in leads...", author: "Sarah L." },
  { text: "Helped us establish a strong brand voice...", author: "David R." }
];

let activeIndex = 0;
const slider = document.getElementById('testimonial-slider');
const dotsContainer = document.getElementById('testimonial-dots');

function updateTestimonials() {
  slider.innerHTML = '';
  testimonials.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'testimonial';
    div.innerHTML = `<p>"${t.text}"</p><p><strong>– ${t.author}</strong></p>`;
    slider.appendChild(div);
  });

  slider.style.transform = `translateX(-${activeIndex * 100}%)`;

  dotsContainer.innerHTML = '';
  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === activeIndex ? ' active' : '');
    dot.onclick = () => {
      activeIndex = i;
      updateTestimonials();
    };
    dotsContainer.appendChild(dot);
  });
}

setInterval(() => {
  activeIndex = (activeIndex + 1) % testimonials.length;
  updateTestimonials();
}, 5000);

document.addEventListener("DOMContentLoaded", updateTestimonials);
