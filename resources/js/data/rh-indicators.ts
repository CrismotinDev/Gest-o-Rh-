export type RhRecord = {
    empresa: string;
    unidade: string;
    setor: string;
    cargo: string;
    colaboradores: number[];
    admissoes: number[];
    desligamentos: number[];
    absenteismo: number;
    permanencia: number;
    motivos: Record<string, number>;
};

export const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const dadosDemonstrativos: RhRecord[] = [
    { empresa: 'Grupo Horizonte', unidade: 'Matriz', setor: 'Administrativo', cargo: 'Analista', colaboradores: [42, 43, 44, 44, 45, 46, 46, 47, 48, 48, 49, 50], admissoes: [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2], desligamentos: [1, 0, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1], absenteismo: 1.8, permanencia: 3.8, motivos: { 'Pedido de demissão': 7, 'Término de contrato': 3, 'Desempenho': 2, 'Outros': 1 } },
    { empresa: 'Grupo Horizonte', unidade: 'Matriz', setor: 'Administrativo', cargo: 'Assistente', colaboradores: [28, 28, 29, 30, 30, 31, 31, 31, 32, 32, 33, 33], admissoes: [1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1], desligamentos: [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1], absenteismo: 2.4, permanencia: 2.9, motivos: { 'Pedido de demissão': 5, 'Término de contrato': 3, 'Desempenho': 1, 'Outros': 1 } },
    { empresa: 'Grupo Horizonte', unidade: 'Matriz', setor: 'Operações', cargo: 'Operador', colaboradores: [116, 114, 118, 120, 119, 121, 123, 124, 126, 127, 129, 130], admissoes: [6, 4, 7, 5, 6, 7, 6, 7, 8, 6, 7, 8], desligamentos: [8, 6, 3, 5, 7, 5, 4, 6, 6, 5, 5, 7], absenteismo: 4.6, permanencia: 2.2, motivos: { 'Pedido de demissão': 20, 'Término de contrato': 14, 'Desempenho': 9, 'Outros': 9 } },
    { empresa: 'Grupo Horizonte', unidade: 'Filial Sul', setor: 'Operações', cargo: 'Supervisor', colaboradores: [24, 24, 25, 25, 26, 26, 26, 27, 27, 28, 28, 29], admissoes: [1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1], desligamentos: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0], absenteismo: 2.1, permanencia: 4.5, motivos: { 'Pedido de demissão': 4, 'Término de contrato': 2, 'Desempenho': 1, 'Outros': 1 } },
    { empresa: 'Grupo Horizonte', unidade: 'Filial Sul', setor: 'Comercial', cargo: 'Consultor', colaboradores: [38, 39, 40, 39, 41, 42, 43, 43, 44, 45, 46, 47], admissoes: [2, 2, 2, 1, 3, 2, 2, 1, 2, 2, 2, 2], desligamentos: [1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1], absenteismo: 2.8, permanencia: 3.1, motivos: { 'Pedido de demissão': 6, 'Término de contrato': 3, 'Desempenho': 2, 'Outros': 2 } },
    { empresa: 'Nova Gestão', unidade: 'Unidade Norte', setor: 'Tecnologia', cargo: 'Desenvolvedor', colaboradores: [32, 33, 34, 35, 36, 36, 37, 38, 39, 40, 41, 42], admissoes: [2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2], desligamentos: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], absenteismo: 1.2, permanencia: 2.7, motivos: { 'Pedido de demissão': 5, 'Término de contrato': 2, 'Desempenho': 1, 'Outros': 2 } },
];

export const opcoesFiltros = {
    empresas: [...new Set(dadosDemonstrativos.map((item) => item.empresa))],
    unidades: [...new Set(dadosDemonstrativos.map((item) => item.unidade))],
    setores: [...new Set(dadosDemonstrativos.map((item) => item.setor))],
    cargos: [...new Set(dadosDemonstrativos.map((item) => item.cargo))],
};
