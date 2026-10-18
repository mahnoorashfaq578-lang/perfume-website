
const themeToggle = document.querySelector("#themeToggle");
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const filterButtons = document.querySelectorAll(".filter-btn");
const perfumeCards = document.querySelectorAll(".perfume-card");
const filterCount = document.querySelector("#filterCount");
const revealElements = document.querySelectorAll(".reveal");

/* =====================================
   THEME TOGGLE
===================================== */

function updateThemeButton(theme) {
  if (!themeToggle) return;

  const icon = themeToggle.querySelector(".theme-icon i");
  const label = themeToggle.querySelector(".theme-label");

  if (theme === "dark") {
    if (icon) icon.className = "fa-solid fa-moon";
    if (label) label.textContent = "DARK MODE";
  } else {
    if (icon) icon.className = "fa-solid fa-sun";
    if (label) label.textContent = "LIGHT MODE";
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  try {
    localStorage.setItem("roseTheme", theme);
  } catch (error) {
    // Theme still works if browser storage is unavailable.
  }

  updateThemeButton(theme);
}

let savedTheme = "light";

try {
  savedTheme = localStorage.getItem("roseTheme") || "light";
} catch (error) {
  savedTheme = "light";
}

applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    const currentTheme =
      document.documentElement.getAttribute("data-theme");

    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

/* =====================================
   MOBILE NAVIGATION
===================================== */

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    const icon = menuToggle.querySelector("i");

    if (icon) {
      icon.className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");

      const icon = menuToggle.querySelector("i");

      if (icon) {
        icon.className = "fa-solid fa-bars";
      }
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");

      const icon = menuToggle.querySelector("i");

      if (icon) {
        icon.className = "fa-solid fa-bars";
      }
    }
  });
}

/* =====================================
   PERFUME FILTERS
===================================== */

function updateFilterCount(count) {
  if (!filterCount) return;

  const number = count < 10 ? "0" + count : String(count);

  filterCount.textContent = "SHOWING " + number + " FRAGRANCES";
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedFilter = button.getAttribute("data-filter");
    let visibleCount = 0;

    filterButtons.forEach(function (filterButton) {
      filterButton.classList.remove("active");
      filterButton.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    perfumeCards.forEach(function (card) {
      const category = card.getAttribute("data-category");

      if (selectedFilter === "all" || selectedFilter === category) {
        card.hidden = false;
        card.classList.remove("filtered-in");

        // Restart the card entrance animation.
        void card.offsetWidth;

        card.classList.add("filtered-in");
        card.style.animationDelay = (visibleCount * 0.06) + "s";

        visibleCount++;
      } else {
        card.hidden = true;
        card.classList.remove("filtered-in");
        card.style.animationDelay = "";
      }
    });

    updateFilterCount(visibleCount);
  });
});

/* =====================================
   SCROLL REVEAL
===================================== */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -25px 0px"
    }
  );

  revealElements.forEach(function (element) {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(function (element) {
    element.classList.add("visible");
  });
}

/* =====================================
   GSAP HERO ENTRANCE
===================================== */

function animateHero() {
  if (typeof gsap === "undefined" || reducedMotion) {
    return;
  }

  const hero = document.querySelector(".hero-frame");

  if (!hero) return;

  const timeline = gsap.timeline({
    defaults: {
      ease: "power3.out"
    }
  });

  timeline
    .from(".hero-topline span", {
      y: 15,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12
    })
    .from(".hero-heading .eyebrow", {
      y: 18,
      opacity: 0,
      duration: 0.6
    }, "-=0.2")
    .from(".hero-heading h1", {
      y: 35,
      opacity: 0,
      duration: 0.9
    }, "-=0.25")
    .from(".hero-description", {
      y: 18,
      opacity: 0,
      duration: 0.6
    }, "-=0.4")
    .from(".hero-cta", {
      y: 12,
      opacity: 0,
      duration: 0.5
    }, "-=0.3")
    .from(".hero-product", {
      y: 35,
      opacity: 0,
      scale: 0.94,
      duration: 1
    }, "-=0.35")
    .from(".hero-bottomline span", {
      y: 10,
      opacity: 0,
      duration: 0.45,
      stagger: 0.1
    }, "-=0.4");
}

animateHero();

/* =====================================
   OPTIONAL SCROLLTRIGGER ENHANCEMENT
===================================== */

if (
  typeof gsap !== "undefined" &&
  typeof ScrollTrigger !== "undefined" &&
  !reducedMotion
) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".collection-heading, .closing-copy").forEach(
    function (element) {
      gsap.from(element, {
        y: 25,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true
        }
      });
    }
  );
}
