<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Chart, registerables } from 'chart.js';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Filter, Info, RefreshCcw, Users, UserMinus, UserPlus, Percent, Clock3, CalendarDays, TrendingUp } from '@lucide/vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dadosDemonstrativos, meses, opcoesFiltros, type RhRecord } from '@/data/rh-indicators';

Chart.register(...registerables);

defineOptions({ layout: AppLayout });

const periodo = ref('12');
const empresa = ref<string | null>(null);
const unidade = ref<string | null>(null);
const setor = ref<string | null>(null);
const cargo = ref<string | null>(null);
const refsGraficos = [ref<HTMLCanvasElement>(), ref<HTMLCanvasElement>(), ref<HTMLCanvasElement>(), ref<HTMLCanvasElement>(), ref<HTMLCanvasElement>()];
const graficos: Chart[] = [];
const setCanvas = (indice: number, elemento: unknown) => {
    if (elemento instanceof HTMLCanvasElement) refsGraficos[indice].value = elemento;
};

const registrosFiltrados = computed(() => dadosDemonstrativos.filter((item) =>
    (!empresa.value || item.empresa === empresa.value) &&
    (!unidade.value || item.unidade === unidade.value) &&
    (!setor.value || item.setor === setor.value) &&
    (!cargo.value || item.cargo === cargo.value),
));

const inicio = computed(() => periodo.value === '6' ? 6 : 0);
const labels = computed(() => meses.slice(inicio.value));
const janela = (valores: number[]) => valores.slice(inicio.value);
const soma = (valores: number[]) => janela(valores).reduce((total, valor) => total + valor, 0);
const total = (fn: (item: RhRecord) => number) => registrosFiltrados.value.reduce((sum, item) => sum + fn(item), 0);

const indicadores = computed(() => {
    const colaboradores = total((item) => item.colaboradores[item.colaboradores.length - 1]);
    const admissoes = total((item) => soma(item.admissoes));
    const desligamentos = total((item) => soma(item.desligamentos));
    const mediaColaboradores = registrosFiltrados.value.reduce((sum, item) => sum + janela(item.colaboradores).reduce((a, b) => a + b, 0) / labels.value.length, 0);
    const turnover = mediaColaboradores ? ((admissoes + desligamentos) / 2) / mediaColaboradores * 100 : 0;
    const absenteismo = colaboradores ? total((item) => item.absenteismo * item.colaboradores[item.colaboradores.length - 1]) / colaboradores : 0;
    const permanencia = colaboradores ? total((item) => item.permanencia * item.colaboradores[item.colaboradores.length - 1]) / colaboradores : 0;
    return { colaboradores, admissoes, desligamentos, turnover, absenteismo, permanencia };
});

const tabela = computed(() => {
    const grupos = new Map<string, RhRecord[]>();
    registrosFiltrados.value.forEach((item) => grupos.set(item.setor, [...(grupos.get(item.setor) ?? []), item]));
    return [...grupos.entries()].map(([nome, registros]) => {
        const colaboradores = registros.reduce((sum, item) => sum + item.colaboradores.at(-1)!, 0);
        const admissoes = registros.reduce((sum, item) => sum + soma(item.admissoes), 0);
        const desligamentos = registros.reduce((sum, item) => sum + soma(item.desligamentos), 0);
        const media = registros.reduce((sum, item) => sum + janela(item.colaboradores).reduce((a, b) => a + b, 0) / labels.value.length, 0);
        return { setor: nome, colaboradores, admissoes, desligamentos, turnover: media ? ((admissoes + desligamentos) / 2) / media * 100 : 0, absenteismo: registros.reduce((sum, item) => sum + item.absenteismo * item.colaboradores.at(-1)!, 0) / colaboradores };
    });
});

const limparFiltros = () => { periodo.value = '12'; empresa.value = unidade.value = setor.value = cargo.value = null; };
const formatarNumero = (valor: number) => new Intl.NumberFormat('pt-BR').format(Math.round(valor));
const formatarPercentual = (valor: number) => `${valor.toFixed(1).replace('.', ',')}%`;

const opcoesPeriodo = [{ title: 'Últimos 6 meses', value: '6' }, { title: 'Últimos 12 meses', value: '12' }];
const cartoes = computed(() => [
    { titulo: 'Colaboradores ativos', valor: formatarNumero(indicadores.value.colaboradores), detalhe: 'base atual', icone: Users, cor: '#4f46e5' },
    { titulo: 'Admissões', valor: formatarNumero(indicadores.value.admissoes), detalhe: 'no período', icone: UserPlus, cor: '#059669' },
    { titulo: 'Desligamentos', valor: formatarNumero(indicadores.value.desligamentos), detalhe: 'no período', icone: UserMinus, cor: '#e11d48' },
    { titulo: 'Turnover', valor: formatarPercentual(indicadores.value.turnover), detalhe: 'fórmula demonstrativa', icone: Percent, cor: '#d97706' },
    { titulo: 'Absenteísmo', valor: formatarPercentual(indicadores.value.absenteismo), detalhe: 'média ponderada', icone: CalendarDays, cor: '#0891b2' },
    { titulo: 'Permanência média', valor: `${indicadores.value.permanencia.toFixed(1).replace('.', ',')} anos`, detalhe: 'tempo de casa', icone: Clock3, cor: '#7c3aed' },
]);

const temaGrafico = () => document.documentElement.classList.contains('dark') ? { texto: '#cbd5e1', grade: '#334155' } : { texto: '#64748b', grade: '#e2e8f0' };
const opcoesBase = () => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: temaGrafico().texto, usePointStyle: true, boxWidth: 8 } } }, scales: { x: { ticks: { color: temaGrafico().texto }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: temaGrafico().texto }, grid: { color: temaGrafico().grade } } } });

const renderizarGraficos = async () => {
    await nextTick();
    graficos.splice(0).forEach((grafico) => grafico.destroy());
    const mensal = labels.value.map((_, index) => registrosFiltrados.value.reduce((sum, item) => sum + item.admissoes[inicio.value + index] + item.desligamentos[inicio.value + index], 0));
    const headcount = labels.value.map((_, index) => registrosFiltrados.value.reduce((sum, item) => sum + item.colaboradores[inicio.value + index], 0));
    const admissoes = labels.value.map((_, index) => registrosFiltrados.value.reduce((sum, item) => sum + item.admissoes[inicio.value + index], 0));
    const desligamentos = labels.value.map((_, index) => registrosFiltrados.value.reduce((sum, item) => sum + item.desligamentos[inicio.value + index], 0));
    const turnoverMensal = labels.value.map((_, index) => { const media = registrosFiltrados.value.reduce((sum, item) => sum + item.colaboradores[inicio.value + index], 0); return media ? mensal[index] / 2 / media * 100 : 0; });
    const setores = tabela.value.map((item) => item.setor);
    const motivos = ['Pedido de demissão', 'Término de contrato', 'Desempenho', 'Outros'].map((motivo) => registrosFiltrados.value.reduce((sum, item) => sum + (item.motivos[motivo] ?? 0), 0));
    const dadosSetor = tabela.value.map((item) => item.turnover);
    const common = opcoesBase();
    const criar = (indice: number, config: any) => { const canvas = refsGraficos[indice].value; if (canvas) graficos.push(new Chart(canvas, config)); };
    criar(0, { type: 'line', data: { labels: labels.value, datasets: [{ label: 'Turnover (%)', data: turnoverMensal, borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.12)', fill: true, tension: .35 }] }, options: common });
    criar(1, { type: 'bar', data: { labels: labels.value, datasets: [{ label: 'Admissões', data: admissoes, backgroundColor: '#10b981', borderRadius: 5 }, { label: 'Desligamentos', data: desligamentos, backgroundColor: '#f43f5e', borderRadius: 5 }] }, options: common });
    criar(2, { type: 'bar', data: { labels: setores, datasets: [{ label: 'Turnover (%)', data: dadosSetor, backgroundColor: ['#4f46e5', '#06b6d4', '#f59e0b', '#8b5cf6'], borderRadius: 6 }] }, options: { ...common, indexAxis: 'y' } });
    criar(3, { type: 'doughnut', data: { labels: motivos.map((_, index) => ['Pedido de demissão', 'Término de contrato', 'Desempenho', 'Outros'][index]), datasets: [{ data: motivos, backgroundColor: ['#4f46e5', '#06b6d4', '#f59e0b', '#94a3b8'], borderWidth: 0 }] }, options: { ...common, scales: {} } });
    criar(4, { type: 'line', data: { labels: labels.value, datasets: [{ label: 'Colaboradores', data: headcount, borderColor: '#0891b2', backgroundColor: 'rgba(8,145,178,.12)', fill: true, tension: .35 }] }, options: common });
};

watch([periodo, empresa, unidade, setor, cargo], renderizarGraficos);
onMounted(renderizarGraficos);
onBeforeUnmount(() => graficos.forEach((grafico) => grafico.destroy()));
</script>

<template>
    <Head title="Indicadores de RH" />
    <v-container fluid class="dashboard-rh pa-4 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
            <div><div class="d-flex align-center ga-2 mb-1"><TrendingUp :size="22" class="text-indigo" /><h1 class="text-h4 font-weight-bold">Indicadores de RH</h1></div><p class="text-body-2 text-medium-emphasis mb-0">Acompanhe a evolução dos principais indicadores da sua equipe.</p></div>
            <v-chip color="amber-darken-2" variant="tonal" size="small"><Info :size="15" class="mr-1" /> Dados demonstrativos</v-chip>
        </div>
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-6" border="start"><strong>Modo demonstração:</strong> os números desta tela são fictícios e servem apenas para apresentar a experiência de acompanhamento ao cliente.</v-alert>
        <v-card rounded="lg" elevation="0" border class="mb-6">
            <v-card-item><template #prepend><Filter :size="20" class="text-indigo mr-3" /></template><v-card-title class="text-subtitle-1 font-weight-bold">Filtros de análise</v-card-title><v-card-subtitle>Refine a visão dos indicadores por período e estrutura organizacional.</v-card-subtitle></v-card-item>
            <v-card-text><v-row dense><v-col cols="12" sm="6" md="2"><v-select v-model="periodo" :items="opcoesPeriodo" label="Período" variant="outlined" density="comfortable" hide-details /></v-col><v-col cols="12" sm="6" md="2"><v-select v-model="empresa" :items="opcoesFiltros.empresas" label="Empresa" variant="outlined" density="comfortable" clearable hide-details /></v-col><v-col cols="12" sm="6" md="2"><v-select v-model="unidade" :items="opcoesFiltros.unidades" label="Unidade" variant="outlined" density="comfortable" clearable hide-details /></v-col><v-col cols="12" sm="6" md="2"><v-select v-model="setor" :items="opcoesFiltros.setores" label="Setor" variant="outlined" density="comfortable" clearable hide-details /></v-col><v-col cols="12" sm="6" md="2"><v-select v-model="cargo" :items="opcoesFiltros.cargos" label="Cargo" variant="outlined" density="comfortable" clearable hide-details /></v-col><v-col cols="12" sm="6" md="2" class="d-flex align-center"><v-btn block variant="tonal" color="primary" @click="limparFiltros"><RefreshCcw :size="17" class="mr-2" /> Limpar filtros</v-btn></v-col></v-row></v-card-text>
        </v-card>
        <v-row dense class="mb-4"><v-col v-for="cartao in cartoes" :key="cartao.titulo" cols="12" sm="6" lg="4" xl="2"><v-card rounded="lg" elevation="0" border class="metric-card h-100"><v-card-text><div class="d-flex justify-space-between align-start"><div class="text-caption text-medium-emphasis">{{ cartao.titulo }}</div><div class="metric-icon" :style="{ color: cartao.cor, backgroundColor: `${cartao.cor}18` }"><component :is="cartao.icone" :size="18" /></div></div><div class="text-h5 font-weight-bold mt-3">{{ cartao.valor }}</div><div class="text-caption text-medium-emphasis mt-1">{{ cartao.detalhe }}</div></v-card-text></v-card></v-col></v-row>
        <v-row dense><v-col cols="12" lg="8"><v-card rounded="lg" elevation="0" border class="chart-card"><v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Evolução mensal do turnover</v-card-title><v-card-subtitle>Admissões e desligamentos sobre a média de colaboradores</v-card-subtitle></v-card-item><v-card-text><div class="chart-wrap"><canvas :ref="(el) => setCanvas(0, el)" /></div></v-card-text></v-card></v-col><v-col cols="12" lg="4"><v-card rounded="lg" elevation="0" border class="chart-card"><v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Motivos dos desligamentos</v-card-title></v-card-item><v-card-text><div class="chart-wrap chart-wrap--donut"><canvas :ref="(el) => setCanvas(3, el)" /></div></v-card-text></v-card></v-col><v-col cols="12" md="6"><v-card rounded="lg" elevation="0" border class="chart-card"><v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Admissões x desligamentos</v-card-title></v-card-item><v-card-text><div class="chart-wrap"><canvas :ref="(el) => setCanvas(1, el)" /></div></v-card-text></v-card></v-col><v-col cols="12" md="6"><v-card rounded="lg" elevation="0" border class="chart-card"><v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Turnover por setor</v-card-title></v-card-item><v-card-text><div class="chart-wrap"><canvas :ref="(el) => setCanvas(2, el)" /></div></v-card-text></v-card></v-col><v-col cols="12"><v-card rounded="lg" elevation="0" border class="chart-card"><v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Evolução do número de colaboradores</v-card-title></v-card-item><v-card-text><div class="chart-wrap"><canvas :ref="(el) => setCanvas(4, el)" /></div></v-card-text></v-card></v-col></v-row>
        <v-card rounded="lg" elevation="0" border class="mt-6"><v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Resumo por setor</v-card-title><v-card-subtitle>Indicadores consolidados conforme os filtros selecionados</v-card-subtitle></v-card-item><v-data-table :headers="[{ title: 'Setor', key: 'setor' }, { title: 'Colaboradores', key: 'colaboradores', align: 'end' }, { title: 'Admissões', key: 'admissoes', align: 'end' }, { title: 'Desligamentos', key: 'desligamentos', align: 'end' }, { title: 'Turnover', key: 'turnover', align: 'end' }, { title: 'Absenteísmo', key: 'absenteismo', align: 'end' }]" :items="tabela" density="comfortable" hover hide-default-footer><template #item.turnover="{ item }">{{ formatarPercentual(item.turnover) }}</template><template #item.absenteismo="{ item }">{{ formatarPercentual(item.absenteismo) }}</template><template #bottom /></v-data-table></v-card>
        <p class="text-caption text-medium-emphasis mt-5 mb-0"><strong>Fórmula demonstrativa do turnover:</strong> ((admissões + desligamentos) / 2) / média de colaboradores × 100.</p>
    </v-container>
</template>

<style scoped>
.dashboard-rh { max-width: 1600px; margin: 0 auto; }
.text-indigo { color: #4f46e5; }
.metric-card, .chart-card { background: rgb(var(--v-theme-surface)); }
.metric-icon { display: inline-flex; border-radius: 10px; padding: 9px; }
.chart-wrap { height: 280px; position: relative; }
.chart-wrap--donut { height: 280px; max-width: 340px; margin: 0 auto; }
@media (max-width: 600px) { .chart-wrap { height: 240px; } }
</style>
