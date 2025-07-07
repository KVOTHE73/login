declare module "bootstrap" {
  export class Modal {
    constructor(element: Element, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }
  export class Toast {
    constructor(element: Element, options?: any);
    show(): void;
    hide(): void;
    dispose(): void;
  }
}

declare module "bootstrap/js/dist/popover" {
  const Popover: any;
  export default Popover;
}

declare module "bootstrap/js/dist/dropdown" {
  const Dropdown: any;
  export default Dropdown;
}
