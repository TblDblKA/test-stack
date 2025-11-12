export function addTypedListener<T>(
  el: HTMLElement,
  type: string,
  handler: (e: CustomEvent<T>) => void
) {
  el.addEventListener(type, (e) => handler(e as CustomEvent<T>));
}
