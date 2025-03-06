// src/types/printer.d.ts
declare module "node-thermal-printer" {
  export class printer {
    constructor(config: any);
    clear(): Promise<void>;
    isPrinterConnected(): Promise<boolean>;
    alignCenter(): void;
    alignLeft(): void;
    bold(enabled: boolean): void;
    setTextSize(width: number, height: number): void;
    println(content: string): void;
    drawLine(): void;
    invert(enabled: boolean): void;
    cut(): void;
    execute(): Promise<void>;
  }

  export const types: {
    EPSON: string;
    STAR: string;
  };
}
