'use server';

/**
 * @fileOverview Um agente de IA para identificar detalhes de produtos (Marca, Modelo, Categoria) a partir de descrições brutas de NF-e.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyProductInputSchema = z.object({
  description: z.string().describe('A descrição bruta do produto conforme consta na nota fiscal ou etiqueta.'),
});

const IdentifyProductOutputSchema = z.object({
  brand: z.string().describe('A marca ou fabricante identificado.'),
  model: z.string().describe('O modelo, SKU ou especificação técnica principal.'),
  category: z.string().describe('Uma categoria sugerida para o produto.'),
});

export type IdentifyProductInput = z.infer<typeof IdentifyProductInputSchema>;
export type IdentifyProductOutput = z.infer<typeof IdentifyProductOutputSchema>;

export async function identifyProductDetails(input: IdentifyProductInput): Promise<IdentifyProductOutput> {
  return identifyProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyProductPrompt',
  input: { schema: IdentifyProductInputSchema },
  output: { schema: IdentifyProductOutputSchema },
  prompt: `Você é um especialista em catálogo de produtos e logística.
Analise a seguinte descrição bruta de um produto extraída de uma Nota Fiscal Eletrônica (NF-e) e extraia de forma limpa a Marca, o Modelo e a Categoria.

Descrição: {{{description}}}

Diretrizes:
1. Se a marca não estiver explícita, tente inferir pelo nome do produto.
2. No campo modelo, extraia apenas a especificação principal (ex: "Air Max", "1.0 Turbo", "Slim Fit"). Se não houver modelo claro, use "Padrão".
3. A categoria deve ser curta e direta (ex: "Calçados", "Eletrônicos", "Limpeza").
4. Remova códigos internos de fornecedor da descrição se possível.`,
});

const identifyProductDetailsFlow = ai.defineFlow(
  {
    name: 'identifyProductDetailsFlow',
    inputSchema: IdentifyProductInputSchema,
    outputSchema: IdentifyProductOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
