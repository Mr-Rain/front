/**
 * Smooth scroll utility
 * @param to - The target scroll position (Y-coordinate)
 * @param duration - Duration of the scroll animation in milliseconds
 * @param element - The element to scroll within (defaults to window)
 */
export function scrollTo(to: number, duration: number = 500, element: Element | Window = window): void {
  const start = element === window ? window.pageYOffset : (element as Element).scrollTop;
  const change = to - start;
  const increment = 20;
  let currentTime = 0;

  const animateScroll = () => {
    currentTime += increment;
    const val = easeInOutQuad(currentTime, start, change, duration);
    if (element === window) {
      window.scrollTo(0, val);
    } else {
      (element as Element).scrollTop = val;
    }
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    }
  };

  // Ease in/out function
  const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };

  requestAnimationFrame(animateScroll);
} 