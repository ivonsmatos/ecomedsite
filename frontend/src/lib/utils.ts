import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina classes Tailwind com merge seguro de conflitos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata CEP: 12345678 → 12345-678 */
export function formatarCep(cep: string): string {
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/** Formata CNPJ: 12345678000195 → 12.345.678/0001-95 */
export function formatarCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

/** Formata distância em metros para string legível */
export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${metros}m`
  return `${(metros / 1000).toFixed(1)}km`
}

/** Converte dia da semana enum para pt-BR */
export function nomeDiaSemana(dia: string): string {
  const mapa: Record<string, string> = {
    SEGUNDA: 'Segunda-feira',
    TERCA: 'Terça-feira',
    QUARTA: 'Quarta-feira',
    QUINTA: 'Quinta-feira',
    SEXTA: 'Sexta-feira',
    SABADO: 'Sábado',
    DOMINGO: 'Domingo',
  }
  return mapa[dia] ?? dia
}
