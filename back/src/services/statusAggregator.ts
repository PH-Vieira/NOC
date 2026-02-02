import type { StatusResponse } from '../types.js';
import { checkVercel } from './checkers/vercel.js';
import { checkGitHub } from './checkers/github.js';
import { checkSupabase } from './checkers/supabase.js';
import { checkRailway } from './checkers/railway.js';
import { checkNuvemFiscal } from './checkers/nuvemFiscal.js';
import { checkSiscomex } from './checkers/siscomex.js';
import { checkViaCep } from './checkers/viacep.js';

const CACHE_TTL_MS = 12_000; // 12 s, alinhado ao polling do front para histórico de tempo de resposta
let cached: StatusResponse | null = null;
let cachedAt = 0;

export async function getAggregatedStatus(): Promise<StatusResponse> {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) {
    return cached;
  }
  const [
    vercel,
    github,
    supabase,
    railway,
    nuvemFiscal,
    siscomex,
    viacep,
  ] = await Promise.all([
    checkVercel(),
    checkGitHub(),
    checkSupabase(),
    checkRailway(),
    checkNuvemFiscal(),
    checkSiscomex(),
    checkViaCep(),
  ]);
  const response: StatusResponse = {
    updatedAt: new Date().toISOString(),
    services: [
      vercel,
      railway,
      nuvemFiscal,
      viacep,
      siscomex,
      github,
      supabase,
    ],
  };
  cached = response;
  cachedAt = now;
  return response;
}
