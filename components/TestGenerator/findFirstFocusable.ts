const FOCUSABLE_CSS_SELECTOR = `a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), *[tabindex], *[contenteditable]`;
const FOCUSABLE_ELEMENTS = `[role="checkbox"], [role="radio"], [type="checkbox"], [type="radio"], .mantine-Chip-input, .mantine-CheckboxCard-card, .mantine-RadioCard-card`;

export default function findFirstFocusable(container: HTMLElement): HTMLElement | null {
  return container.querySelector(FOCUSABLE_ELEMENTS);
}