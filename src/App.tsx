/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { 
  LogOut, 
  Settings, 
  Users, 
  Link as LinkIcon, 
  Cross, 
  Anchor, 
  Download, 
  Upload, 
  BarChart3, 
  Cake, 
  Bell, 
  Award, 
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- CONSTANTS ---
const NOME_IGREJA = 'Ministério Evangélico Enraizados';
const DIAS_CULTO = [3, 5, 0]; // quarta(3), sexta(5), domingo(0)
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CATS = ['Aluguel / Manutenção','Energia / Água','Som / Mídia','Material de Limpeza','Eventos / Cultos','Missões','Secretaria','Outros'];
const CARGOS = ['Pastor','Evangelista','Diácono','Diaconisa','Presbítero','Líder de Louvor','Secretário(a)','Tesoureiro(a)','Outro'];

const VERSICULOS = [
  { texto: "Portanto, assim como vocês receberam Cristo Jesus, o Senhor, continuem a viver nele, enraizados e edificados nele, firmados na fé, como foram ensinados, transbordando de gratidão.", ref: "Colossenses 2:6-7" },
  { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", ref: "João 3:16" },
  { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", ref: "Salmos 37:5" },
  { texto: "O choro pode durar uma noite, mas a alegria vem pela manhã.", ref: "Salmos 30:5" },
  { texto: "Se Deus é por nós, quem será contra nós?", ref: "Romanos 8:31" },
  { texto: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" }
];

// --- TYPES ---
interface Membro {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  dataNascimento?: string;
  dataIngresso?: string;
  batizado?: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  observacoes?: string;
}

interface Congregado {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  dataNascimento?: string;
  dataInicio?: string;
}

interface Obreiro {
  id: string;
  membroId?: string;
  nome: string;
  cargo: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  dataNascimento?: string;
  dataOrdenacao?: string;
}

interface Entrada {
  id: string;
  data: string;
  tipo: 'Dízimo' | 'Oferta';
  membro: string;
  valor: number;
}

interface Dispensa {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
}

// --- UTILS ---
const uid = () => Math.random().toString(36).substring(2, 9);
const hoje = () => new Date().toISOString().split('T')[0];
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hashPin = (p: string) => {
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    h = ((h << 5) - h) + p.charCodeAt(i);
    h |= 0;
  }
  return String(Math.abs(h));
};

export default function App() {
  // --- STATE ---
  const [mode, setMode] = useState<'login' | 'app' | 'cadastro'>('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('membros');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [finUnlocked, setFinUnlocked] = useState(false);
  const [logo, setLogo] = useState<string | null>(localStorage.getItem('igr-logo'));
  
  const [membros, setMembros] = useState<Membro[]>(() => {
    try {
      const saved = localStorage.getItem('igr-membros');
      return saved ? JSON.parse(saved).filter((m: any) => m && m.id) : [];
    } catch {
      return [];
    }
  });
  const [congregados, setCongregados] = useState<Congregado[]>(() => {
    try {
      const saved = localStorage.getItem('igr-congregados');
      return saved ? JSON.parse(saved).filter((c: any) => c && c.id) : [];
    } catch {
      return [];
    }
  });
  const [obreiros, setObreiros] = useState<Obreiro[]>(() => {
    try {
      const saved = localStorage.getItem('igr-obreiros');
      return saved ? JSON.parse(saved).filter((o: any) => o && o.id) : [];
    } catch {
      return [];
    }
  });
  const [entradas, setEntradas] = useState<Entrada[]>(() => {
    try {
      const saved = localStorage.getItem('igr-entradas');
      return saved ? JSON.parse(saved).filter((e: any) => e && e.id) : [];
    } catch {
      return [];
    }
  });
  const [dispensas, setDispensas] = useState<Dispensa[]>(() => {
    try {
      const saved = localStorage.getItem('igr-dispensas');
      return saved ? JSON.parse(saved).filter((d: any) => d && d.id) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [bdayMonth, setBdayMonth] = useState(new Date().getMonth());
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });
  const [modal, setModal] = useState<any>(null);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('igr-membros', JSON.stringify(membros));
    localStorage.setItem('igr-congregados', JSON.stringify(congregados));
    localStorage.setItem('igr-obreiros', JSON.stringify(obreiros));
    localStorage.setItem('igr-entradas', JSON.stringify(entradas));
    localStorage.setItem('igr-dispensas', JSON.stringify(dispensas));
    if (logo) localStorage.setItem('igr-logo', logo);
  }, [membros, congregados, obreiros, entradas, dispensas, logo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cadastro') === '1') setMode('cadastro');
  }, []);

  // --- HELPERS ---
  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const isDiaDeCulto = () => DIAS_CULTO.includes(new Date().getDay());
  const getVersiculo = () => {
    const d = new Date().getDate();
    return VERSICULOS[d % VERSICULOS.length];
  };

  const totals = useMemo(() => {
    const tE = entradas.reduce((s, r) => s + r.valor, 0);
    const tD = dispensas.reduce((s, r) => s + r.valor, 0);
    return { entradas: tE, dispensas: tD, saldo: tE - tD };
  }, [entradas, dispensas]);

  // --- ACTIONS ---
  const handleLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogo(base64);
      showToast('Logo atualizado');
    };
    reader.readAsDataURL(file);
  };

  const gerarCertificado = (tipo: 'batismo' | 'apresentacao', f: any) => {
    const logoTag = logo ? `<img src="${logo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : `<div style="width:80px;height:80px;border-radius:50%;background:#3D4A1A;display:flex;align-items:center;justify-content:center;font-size:40px;color:#C49A2A">✝</div>`;
    const dataFmt = new Date(f.dataEvento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const isB = tipo === 'batismo';
    const v = isB ? { t: '"Portanto, fomos sepultados com ele na morte por meio do batismo..."', r: 'Romanos 6:4' } : { t: '"Deixem vir a mim as crianças..."', r: 'Mateus 19:14' };
    const texto = isB ? `Certificamos que <strong>${f.nome}</strong> foi batizado(a) no dia <strong>${dataFmt}</strong>.` : `Certificamos que <strong>${f.nome}</strong> foi apresentado(a) ao Senhor no dia <strong>${dataFmt}</strong>.`;
    
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificado</title><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Great+Vibes&display=swap" rel="stylesheet"><style>body{background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Crimson Text',serif}.cert{width:297mm;max-width:100%;min-height:210mm;border:6px double #3D4A1A;padding:40px;position:relative;background:#fdfcf8;text-align:center}h2{font-family:'Great Vibes',cursive;font-size:42px;color:#C49A2A;margin:20px 0}p{font-size:15px;line-height:2;margin:15px 30px;text-align:justify}.verse{font-style:italic;color:#5C6B2E;margin:20px 40px;padding:15px;border-top:1px solid rgba(61,74,26,.2);border-bottom:1px solid rgba(61,74,26,.2)}.sig{display:flex;justify-content:space-around;margin-top:30px}.sig-line{border-top:1px solid #3D4A1A;width:200px;margin:0 auto 5px}.footer{margin-top:30px;font-size:10px;color:#999}@media print{@page{size:A4 landscape;margin:0}}</style></head><body><div class="cert"><div style="margin-bottom:20px">${logoTag}</div><h2>${isB ? 'Certificado de Batismo' : 'Certificado de Apresentação'}</h2><p>${texto}</p><div class="verse">${v.t}<br><strong>${v.r}</strong></div><div class="sig"><div><div class="sig-line"></div><div style="font-family:'Great Vibes',cursive;font-size:22px">${f.pastor || '_________________'}</div><small>Pastor(a)</small></div></div><div class="footer">${f.local || ''} — ${dataFmt}<br>"Enraizados em Cristo"</div></div><script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  };

  const gerarRelatorioPDF = () => {
    const { entradas: tE, dispensas: tD, saldo } = totals;
    const periodo = "Relatório Geral";
    const dataEmissao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const logoTag = logo ? `<img src="${logo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #C49A2A">` : `<div style="width:80px;height:80px;border-radius:50%;background:#3D4A1A;display:flex;align-items:center;justify-content:center;font-size:40px;color:#C49A2A;border:3px solid #C49A2A">✝</div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório Financeiro</title><style>body{font-family:sans-serif;padding:30px}.header{display:flex;align-items:center;gap:20px;border-bottom:3px solid #3D4A1A;padding-bottom:15px;margin-bottom:20px}.card{background:#f4f4f4;padding:15px;border-radius:8px;text-align:center;flex:1}table{width:100%;border-collapse:collapse}th{background:#3D4A1A;color:#E8C96A;padding:10px;text-align:left}td{padding:10px;border-bottom:1px solid #ddd}</style></head><body><div class="header">${logoTag}<div><h1>${NOME_IGREJA}</h1><p>Relatório Financeiro — ${periodo}</p></div></div><div style="display:flex;gap:10px;margin-bottom:20px"><div class="card">Total Entradas<br><b>${brl(tE)}</b></div><div class="card">Total Saídas<br><b>${brl(tD)}</b></div><div class="card">Saldo<br><b>${brl(saldo)}</b></div></div><h2>Histórico de Entradas</h2><table><thead><tr><th>Data</th><th>Tipo</th><th>Doador</th><th>Valor</th></tr></thead><tbody>${entradas.map(e => `<tr><td>${e.data}</td><td>${e.tipo}</td><td>${e.membro}</td><td>${brl(e.valor)}</td></tr>`).join('')}</tbody></table></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const handleLogin = (u: string, p: string) => {
    const creds = JSON.parse(localStorage.getItem('igr-credentials') || '{"usuario":"admin","senha":"1234"}');
    if (u === creds.usuario && p === creds.senha) {
      setLoggedIn(true);
      setMode('app');
    } else {
      alert('Usuário ou senha incorretos');
    }
  };

  const removeRec = (type: string, id: string) => {
    if (!confirm('Deseja realmente excluir este registro?')) return;
    if (type === 'membros') setMembros(membros.filter(m => m.id !== id));
    if (type === 'congregados') setCongregados(congregados.filter(c => c.id !== id));
    if (type === 'obreiros') setObreiros(obreiros.filter(o => o.id !== id));
    if (type === 'entradas') setEntradas(entradas.filter(e => e.id !== id));
    if (type === 'dispensas') setDispensas(dispensas.filter(d => d.id !== id));
    showToast('Registro removido');
  };

  const saveRec = (type: string, data: any) => {
    if (!data) return;
    if (data.id) {
        if (type === 'membros') setMembros(prev => prev.map(m => m && m.id === data.id ? data : m).filter(Boolean));
        if (type === 'congregados') setCongregados(prev => prev.map(c => c && c.id === data.id ? data : c).filter(Boolean));
        if (type === 'obreiros') setObreiros(prev => prev.map(o => o && o.id === data.id ? data : o).filter(Boolean));
        if (type === 'entradas') setEntradas(prev => prev.map(e => e && e.id === data.id ? data : e).filter(Boolean));
        if (type === 'dispensas') setDispensas(prev => prev.map(d => d && d.id === data.id ? data : d).filter(Boolean));
    } else {
      const newRec = { ...data, id: uid() };
      if (type === 'membros') setMembros(prev => [...prev, newRec]);
      if (type === 'congregados') setCongregados(prev => [...prev, newRec]);
      if (type === 'obreiros') setObreiros(prev => [...prev, newRec]);
      if (type === 'entradas') setEntradas(prev => [...prev, newRec]);
      if (type === 'dispensas') setDispensas(prev => [...prev, newRec]);
    }
    setModal(null);
    showToast('Salvo com sucesso');
  };

  // --- RENDERERS ---
  const renderSidebar = () => (
    <div className={`sidebar fixed inset-y-0 left-0 z-50 w-64 bg-linear-to-b from-[var(--o900)] to-black border-r border-white/5 flex flex-col h-full overflow-y-auto no-scrollbar transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-5 lg:hidden bg-black/40">
         <span className="font-cinzel text-xs font-bold text-[var(--g900)] tracking-widest">MINISTÉRIO ENRAIZADOS</span>
         <button onClick={() => setMobileMenuOpen(false)} className="text-white/40 p-1"><Cross size={20}/></button>
      </div>
      <div className="p-4 border-b border-[rgba(92,107,46,0.1)]">
        <h2 className="text-[10px] font-bold tracking-widest text-[#a8b87a38] uppercase">Pessoas</h2>
        <div className="mt-2 space-y-1">
          <NavItem active={tab === 'membros'} onClick={() => { setTab('membros'); setMobileMenuOpen(false); }} icon={<Users size={16} />} label="Membros" badge={membros.length} />
          <NavItem active={tab === 'congregados'} onClick={() => { setTab('congregados'); setMobileMenuOpen(false); }} icon={<ChevronRight size={16} />} label="Congregados" badge={congregados.length} />
          <NavItem active={tab === 'obreiros'} onClick={() => { setTab('obreiros'); setMobileMenuOpen(false); }} icon={<Anchor size={16} />} label="Obreiros" badge={obreiros.length} />
        </div>
      </div>
      
      <div className="p-4 border-b border-[rgba(92,107,46,0.1)]">
        <h2 className="text-[10px] font-bold tracking-widest text-[#a8b87a38] uppercase">Financeiro {finUnlocked ? '🔓' : '🔒'}</h2>
        <div className="mt-2 space-y-1">
          <NavItem active={tab === 'entradas'} onClick={() => { setTab('entradas'); setMobileMenuOpen(false); }} icon={<Download size={16} />} label="Entradas" />
          <NavItem active={tab === 'dispensas'} onClick={() => { setTab('dispensas'); setMobileMenuOpen(false); }} icon={<Upload size={16} />} label="Dispensas" />
          <NavItem active={tab === 'relatorios'} onClick={() => { setTab('relatorios'); setMobileMenuOpen(false); }} icon={<BarChart3 size={16} />} label="Relatórios" />
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-[10px] font-bold tracking-widest text-[#a8b87a38] uppercase">Outros</h2>
        <div className="mt-2 space-y-1">
          <NavItem active={tab === 'aniversarios'} onClick={() => { setTab('aniversarios'); setMobileMenuOpen(false); }} icon={<Cake size={16} />} label="Aniversariantes" />
          <NavItem active={tab === 'certificados'} onClick={() => { setTab('certificados'); setMobileMenuOpen(false); }} icon={<Award size={16} />} label="Certificados" />
          {isDiaDeCulto() && (
            <NavItem active={tab === 'lembretes'} onClick={() => { setTab('lembretes'); setMobileMenuOpen(false); }} icon={<Bell size={16} />} label="Relatórios" className="text-orange-400" />
          )}
        </div>
      </div>

      <div className="mt-auto p-4 border-top border-[rgba(92,107,46,0.12)] text-center">
         <p className="text-[9px] text-[#a8b87a38]">✝ Enraizados em Cristo<br/>Colossenses 2:7</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (tab === 'membros' || tab === 'congregados' || tab === 'obreiros') {
      const data = tab === 'membros' ? membros : tab === 'congregados' ? congregados : obreiros;
      const filtered = data.filter(r => r.nome.toLowerCase().includes(search.toLowerCase()));
      
      return (
        <div className="panel animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="panel-head">
            <span className="ptitle text-[var(--g900)] font-cinzel text-sm font-bold capitalize">
              {tab === 'membros' ? '✝ Membros' : tab === 'congregados' ? '🕊 Congregados' : '⚓ Obreiros'}
            </span>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--o400)]" />
                <input 
                  className="bg-[rgba(0,0,0,0.28)] border border-[rgba(92,107,46,0.28)] rounded-md pl-8 pr-3 py-1.5 text-white text-xs w-48 focus:outline-none focus:border-[var(--g900)]"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-gold !py-1.5 !min-h-0 text-xs flex items-center gap-1"
                onClick={() => setModal({ type: tab, data: { status: 'Ativo' } })}
              >
                <Plus size={14} /> Novo
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[rgba(10,15,3,0.8)] border-b border-[rgba(196,154,42,0.1)]">
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">Nome</th>
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">Telefone</th>
                  {tab === 'membros' && <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">Status</th>}
                  {tab === 'obreiros' && <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">Cargo</th>}
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px] w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(92,107,46,0.1)] text-[rgba(255,255,255,0.82)]">
                {filtered.map(r => r && r.id && (
                  <tr key={r.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.nome}</td>
                    <td className="px-4 py-3 opacity-60">{r.telefone || '—'}</td>
                    {tab === 'membros' && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (r as Membro).status === 'Ativo' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          (r as Membro).status === 'Pendente' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {(r as Membro).status || 'Ativo'}
                        </span>
                      </td>
                    )}
                    {tab === 'obreiros' && <td className="px-4 py-3 text-[var(--g700)]">{(r as Obreiro).cargo}</td>}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setModal({ type: tab, data: r })} className="text-[var(--o400)] hover:text-white transition-colors cursor-pointer"><Edit2 size={14}/></button>
                        <button onClick={() => removeRec(tab, r.id)} className="text-red-400/50 hover:text-red-400 transition-colors cursor-pointer"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-20 text-center text-[var(--o400)] italic">
                Nenhum registro encontrado
              </div>
            )}
          </div>
        </div>
      );
    }

    if (tab === 'entradas' || tab === 'dispensas') {
      if (!finUnlocked) return <FinLock onUnlock={() => setFinUnlocked(true)} />;
      
      const isEntrada = tab === 'entradas';
      const data = isEntrada ? entradas : dispensas;
      
      return (
        <div className="panel animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="panel-head">
            <span className="ptitle text-[var(--g900)] font-cinzel text-sm font-bold">
              {isEntrada ? '📥 Entradas' : '📤 Dispensas'}
            </span>
            <button 
                className="btn btn-gold !py-1.5 !min-h-0 text-xs flex items-center gap-1"
                onClick={() => setModal({ type: isEntrada ? 'entrada' : 'dispensa', data: { data: hoje(), tipo: 'Dízimo' } })}
              >
                <Plus size={14} /> Lançar
            </button>
          </div>
          
          <div className="px-4 py-3 bg-[rgba(0,0,0,0.1)] flex justify-between items-center">
            <div className="flex gap-2">
               {isEntrada ? (
                   ['Todos', 'Dízimo', 'Oferta'].map(f => (
                     <button 
                        key={f}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${filter === f ? 'bg-[var(--o500)] text-white border-[var(--o400)]' : 'bg-transparent text-[var(--o400)] border-[rgba(92,107,46,0.22)]'}`}
                        onClick={() => setFilter(f)}
                     >
                       {f}
                     </button>
                   ))
               ) : (
                  ['Todos', ...CATS.slice(0, 3)].map(f => (
                    <button 
                       key={f}
                       className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${filter === f ? 'bg-[var(--o500)] text-white border-[var(--o400)]' : 'bg-transparent text-[var(--o400)] border-[rgba(92,107,46,0.22)]'}`}
                       onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))
               )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--o400)] uppercase tracking-wider block">Total de {isEntrada ? 'Entradas' : 'Dispensas'}</span>
              <span className={`text-xl font-cinzel font-bold ${isEntrada ? 'text-green-400' : 'text-red-400'}`}>
                {brl(isEntrada ? totals.entradas : totals.dispensas)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[rgba(10,15,3,0.8)] border-b border-[rgba(196,154,42,0.1)]">
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">Data</th>
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">{isEntrada ? 'Tipo' : 'Categoria'}</th>
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px]">{isEntrada ? 'Pessoa' : 'Descrição'}</th>
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px] text-right">Valor</th>
                  <th className="px-4 py-3 uppercase tracking-wider text-[var(--g900)] font-bold text-[9px] w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(92,107,46,0.1)] text-[rgba(255,255,255,0.82)]">
                {data.map(r => r && r.id && (
                  <tr key={r.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-4 py-3">{r.data}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isEntrada ? (r as Entrada).tipo === 'Dízimo' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {isEntrada ? (r as Entrada).tipo : (r as Dispensa).categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">{isEntrada ? (r as Entrada).membro : (r as Dispensa).descricao}</td>
                    <td className={`px-4 py-3 text-right font-bold ${isEntrada ? 'text-green-400/80' : 'text-red-400/80'}`}>{brl(r.valor)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => removeRec(tab, r.id)} className="text-red-400/50 hover:text-red-400 transition-colors cursor-pointer"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (tab === 'aniversarios') {
        const all = [...membros.map(r=>({...r,type:'Membro'})), ...congregados.map(r=>({...r,type:'Congregado'})), ...obreiros.map(r=>({...r,type:'Obreiro'}))];
        const inM = all.filter(r => r.dataNascimento && parseInt(r.dataNascimento.split('-')[1]) - 1 === bdayMonth);

        return (
            <div className="panel animate-in fade-in transition-all">
                <div className="panel-head">
                    <span className="ptitle text-yellow-500 font-cinzel text-sm font-bold flex items-center gap-2"><Cake size={16}/> Aniversariantes de {MONTHS[bdayMonth]}</span>
                </div>
                <div className="p-4 bg-[rgba(0,0,0,0.1)] overflow-x-auto flex gap-2">
                    {MONTHS.map((m, i) => (
                        <button 
                            key={m} 
                            onClick={() => setBdayMonth(i)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${bdayMonth === i ? 'bg-yellow-600 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {inM.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-white/20 italic">Ninguém faz aniversário este mês</div>
                    ) : (
                        inM.map(r => (
                            <div key={r.id} className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-[var(--o500)] mx-auto mb-3 flex items-center justify-center font-cinzel text-lg text-yellow-400 border-2 border-yellow-400/20">
                                    {(r.nome || 'AB').slice(0, 2).toUpperCase()}
                                </div>
                                <h4 className="font-cinzel text-xs text-white mb-1">{r.nome}</h4>
                                <p className="text-yellow-500 text-sm font-bold">🎂 {parseInt((r.dataNascimento || '').split('-')[2])} de {MONTHS[bdayMonth]}</p>
                                <p className="text-[9px] uppercase tracking-widest text-white/30 mt-2">{(r as any).type}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    if (tab === 'certificados') {
        return (
            <div className="panel animate-in fade-in">
                <div className="panel-head"><span className="ptitle text-[var(--g900)] font-cinzel text-sm font-bold flex items-center gap-2"><Award size={16}/> Certificados</span></div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all cursor-pointer" onClick={() => setModal({ type: 'certificado', certTipo: 'batismo', data: { dataEvento: hoje(), igreja: NOME_IGREJA } })}>
                        <div className="text-4xl mb-4">💧</div>
                        <h3 className="font-cinzel text-lg text-[var(--g900)] mb-4">Certificado de Batismo</h3>
                        <button className="btn btn-blue w-full">Gerar Certificado</button>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all cursor-pointer" onClick={() => setModal({ type: 'certificado', certTipo: 'apresentacao', data: { dataEvento: hoje(), igreja: NOME_IGREJA } })}>
                        <div className="text-4xl mb-4">👶</div>
                        <h3 className="font-cinzel text-lg text-[var(--g900)] mb-4">Certificado de Apresentação</h3>
                        <button className="btn btn-green w-full">Gerar Certificado</button>
                    </div>
                </div>
            </div>
        );
    }

    if (tab === 'relatorios') {
        if (!finUnlocked) return <FinLock onUnlock={() => setFinUnlocked(true)} />;
        return (
            <div className="panel animate-in fade-in">
                <div className="panel-head">
                    <span className="ptitle text-[var(--g900)] font-cinzel text-sm font-bold flex items-center gap-2"><BarChart3 size={16}/> Relatórios Financeiros</span>
                    <button className="btn btn-gold !py-1.5 !min-h-0 text-xs" onClick={gerarRelatorioPDF}>Imprimir PDF</button>
                </div>
                <div className="p-10 text-center">
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <span className="block text-white/40 text-[10px] font-bold uppercase mb-2">Entradas</span>
                            <span className="text-2xl font-cinzel font-bold text-green-400">{brl(totals.entradas)}</span>
                        </div>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <span className="block text-white/40 text-[10px] font-bold uppercase mb-2">Saídas</span>
                            <span className="text-2xl font-cinzel font-bold text-red-400">{brl(totals.dispensas)}</span>
                        </div>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <span className="block text-white/40 text-[10px] font-bold uppercase mb-2">Saldo Final</span>
                            <span className={`text-2xl font-cinzel font-bold ${totals.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>{brl(totals.saldo)}</span>
                        </div>
                    </div>
                    <p className="text-white/40 text-sm">Use o botão acima para gerar uma versão impressa detalhada do relatório.</p>
                </div>
            </div>
        );
    }

    if (tab === 'lembretes') {
        return (
            <div className="panel animate-in fade-in">
                <div className="panel-head"><span className="ptitle text-orange-400 font-cinzel text-sm font-bold flex items-center gap-2"><Bell size={16}/> Lembretes de Culto</span></div>
                <div className="p-10 text-center">
                    <div className="text-5xl mb-6">📢</div>
                    <h3 className="font-cinzel text-lg text-[var(--g900)] mb-4">Mensagens para hoje</h3>
                    <p className="max-w-md mx-auto text-white/60 mb-8 font-crimson italic text-lg">"🌟 Bom dia! Hoje é dia de congregarmos no Ministério Enraizados. Temos culto às 19:30h. Esperamos por você! 🙏✨"</p>
                    <button 
                      className="btn btn-green px-10"
                      onClick={() => alert('Função de envio em lote simula a abertura de abas do WhatsApp. Verifique as permissões de pop-up.')}
                    >
                        Enviar via WhatsApp
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <Cross size={64}/>
            <p className="mt-4 font-cinzel tracking-widest text-lg">Em Desenvolvimento</p>
        </div>
    );
  };

  const renderTopBar = () => (
    <header className="topbar h-16 bg-linear-to-r from-black via-[var(--o800)] to-black border-b border-[rgba(196,154,42,0.18)] px-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-[var(--g900)]">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className="tb-logo w-10 h-10 rounded-full border-2 border-[rgba(196,154,42,0.35)] overflow-hidden cursor-pointer bg-linear-to-br from-[var(--o600)] to-[var(--o800)] flex items-center justify-center shrink-0">
            {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Cross size={18} className="text-[var(--g900)]"/>}
        </div>
        <div className="flex-1 min-w-0">
            <h1 className="font-cinzel font-bold text-xs sm:text-sm text-[var(--g900)] truncate uppercase tracking-wider">{NOME_IGREJA}</h1>
            <p className="text-[8px] text-[var(--o300)] uppercase tracking-[1px] sm:tracking-[2px] mt-0.5">SISTEMA INTEGRADO</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden xs:block bg-black/40 border border-white/5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-right">
                <span className="text-[7px] sm:text-[8px] text-[var(--o300)] font-bold uppercase tracking-widest block">Saldo</span>
                <span className={`font-cinzel font-bold text-xs sm:text-sm ${totals.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {brl(totals.saldo)}
                </span>
            </div>
            <div className="flex gap-1 sm:gap-1.5">
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/?cadastro=1`;
                    prompt('Link para cadastro externo:', link);
                  }}
                  className="p-2 sm:p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
                  title="Link de Cadastro"
                >
                    <LinkIcon size={14}/>
                </button>
                <button 
                  onClick={() => setModal({ type: 'settings' })} 
                  className="p-2 sm:p-2.5 rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  title="Configurações"
                >
                    <Settings size={14}/>
                </button>
                <button 
                  onClick={() => { setLoggedIn(false); setMode('login'); }}
                  className="p-2 sm:p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Sair"
                >
                    <LogOut size={14}/>
                </button>
            </div>
        </div>
    </header>
  );

  const renderForms = () => {
    if (!modal) return null;
    const { type, data } = modal;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="modal w-full max-w-lg bg-linear-to-br from-[var(--o900)] to-[#1c1c1c] border border-[rgba(196,154,42,0.18)] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          <div className="modal-head flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
            <h3 className="font-cinzel text-sm font-bold text-[var(--g900)] uppercase tracking-widest leading-none mt-1">{data?.id ? 'Editar' : 'Novo'} {type}</h3>
            <button onClick={() => setModal(null)} className="text-white/40 hover:text-red-400 transition-colors cursor-pointer p-2 -mr-2"><Cross size={20}/></button>
          </div>
          <div className="modal-body p-6 overflow-y-auto">
            {type === 'membros' && <MembroForm data={data || { status: 'Ativo' }} onSave={(d: any) => saveRec('membros', d)} onCancel={() => setModal(null)} />}
            {type === 'congregados' && <CongregadoForm data={data || {}} onSave={(d: any) => saveRec('congregados', d)} onCancel={() => setModal(null)} />}
            {type === 'obreiros' && <ObreiroForm data={data || {}} onSave={(d: any) => saveRec('obreiros', d)} onCancel={() => setModal(null)} />}
            {type === 'entrada' && <EntradaForm data={data || { tipo: 'Dízimo' }} onSave={(d: any) => saveRec('entradas', d)} onCancel={() => setModal(null)} members={membros} />}
            {type === 'dispensa' && <DispensaForm data={data || {}} onSave={(d: any) => saveRec('dispensas', d)} onCancel={() => setModal(null)} />}
            {type === 'certificado' && modal && <CertificadoForm certTipo={modal.certTipo} data={data || {}} onSave={(d: any) => { gerarCertificado(modal.certTipo, d); setModal(null); }} onCancel={() => setModal(null)} />}
            {type === 'settings' && <SettingsForm onSave={() => setModal(null)} onLogoChange={handleLogo} logo={logo} />}
          </div>
        </motion.div>
      </div>
    );
  };

  if (mode === 'cadastro') return <PublicCadastro onFinish={() => setMode('login')} saveRec={saveRec} />;
  if (!loggedIn) return <Login onLogin={handleLogin} versiculo={getVersiculo()} logo={logo} />;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--o700)] selection:bg-[var(--g900)] selection:text-black overflow-hidden">
      {renderTopBar()}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {renderSidebar()}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar relative">
          {/* Overlay for mobile menu */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              <StatCard label="Membros" value={membros.length} color="text-yellow-400" />
              <StatCard label="Congregados" value={congregados.length} color="text-blue-400" />
              <StatCard label="Obreiros" value={obreiros.length} color="text-emerald-400" />
              <StatCard label="Entradas" value={brl(totals.entradas)} color="text-green-400" />
              <StatCard label="Dispensas" value={brl(totals.dispensas)} color="text-red-400" />
              <StatCard label="Saldo" value={brl(totals.saldo)} color={totals.saldo >= 0 ? "text-green-400" : "text-red-400"} />
          </div>

          <div className="mb-6 rounded-xl overflow-hidden bg-black/20 border border-[rgba(196,154,42,0.2)] p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[var(--g700)] to-transparent opacity-50"></div>
              <p className="font-crimson italic text-lg text-white/90 text-center leading-relaxed">"{getVersiculo().texto}"</p>
              <p className="font-cinzel text-[10px] text-[var(--g700)] text-center mt-3 font-bold tracking-[3px] uppercase">📖 {getVersiculo().ref}</p>
          </div>

          {renderContent()}
        </main>
      </div>
      
      {renderForms()}

      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-[var(--o900)] border border-[var(--o400)] px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-xs font-bold text-white/80">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ icon, label, badge, active, onClick, className = '' }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all border-l-4 ${
        active 
          ? 'bg-[var(--g900)]/10 text-[var(--g900)] border-[var(--g900)] font-bold' 
          : 'bg-transparent text-white/40 border-transparent hover:bg-white/5'
      } ${className} cursor-pointer`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full font-bold">{badge}</span>
      )}
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-linear-to-br from-[rgba(46,59,18,0.6)] to-[rgba(20,20,20,0.7)] border border-[rgba(92,107,46,0.22)] rounded-xl p-3.5 shadow-sm">
      <span className={`block font-cinzel font-bold text-base ${color}`}>{value}</span>
      <span className="text-[9px] font-bold tracking-widest text-[var(--o400)] uppercase mt-0.5 block">{label}</span>
    </div>
  );
}

function Login({ onLogin, versiculo, logo }: any) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[var(--o800)] via-[var(--o900)] to-black p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-linear-to-br from-[rgba(46,59,18,0.95)] to-[rgba(20,20,20,0.98)] border border-[rgba(196,154,42,0.25)] rounded-3xl p-10 shadow-2xl text-center"
      >
        <div className="w-24 h-24 rounded-full border-4 border-[rgba(196,154,42,0.4)] bg-linear-to-br from-[var(--o700)] to-[var(--o900)] flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden bg-black/20">
          {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Cross size={40} className="text-[var(--g700)]"/>}
        </div>
        <h1 className="font-cinzel text-xl font-bold text-[var(--g900)] tracking-wider">MINISTÉRIO ENRAIZADOS</h1>
        <p className="text-[10px] text-[var(--o300)] uppercase tracking-[3px] mt-1 mb-8">SISTEMA INTEGRADO</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 italic text-white/60">
            <p className="text-sm">"{versiculo.texto}"</p>
            <p className="font-cinzel text-[9px] text-[var(--g700)] mt-2 font-bold tracking-widest">📖 {versiculo.ref}</p>
        </div>

        <div className="space-y-4">
            <div className="field">
                <label>Administrador</label>
                <input value={u} onChange={e => setU(e.target.value)} placeholder="Usuário" />
            </div>
            <div className="field">
                <label>Senha</label>
                <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn btn-gold w-full mt-4" onClick={() => onLogin(u, p)}>ENTRAR NO SISTEMA</button>
        </div>
        <p className="text-[11px] text-white/20 mt-6 font-mono">Padrão: admin / 1234</p>
      </motion.div>
    </div>
  );
}

function FinLock({ onUnlock }: any) {
  const [pin, setPin] = useState('');
  const handleUnlock = () => {
    const stored = localStorage.getItem('igr-finpin');
    const expected = stored || hashPin('123456');
    if (hashPin(pin) === expected) onUnlock();
    else alert('PIN Incorreto');
  };

  return (
    <div className="flex flex-col items-center justify-center py-40">
        <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center mb-6 border border-red-400/20">
            <Lock size={32} className="text-red-400" />
        </div>
        <h2 className="font-cinzel text-xl text-[var(--g900)] mb-2 uppercase tracking-widest">Acesso Restrito</h2>
        <p className="text-white/40 text-sm mb-8">Área financeira protegida por PIN</p>
        
        <div className="w-full max-w-xs space-y-4">
            <div className="field">
                <label>Digite seu PIN Financeiro</label>
                <input 
                  type="password" 
                  maxLength={6} 
                  className="text-center tracking-[1em]" 
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                />
            </div>
            <button onClick={handleUnlock} className="btn btn-gold w-full flex gap-2">
                <Unlock size={16}/> DESBLOQUEAR
            </button>
        </div>
    </div>
  );
}

// --- FORM COMPONENTS ---

function MembroForm({ data, onSave, onCancel }: any) {
  const [form, setForm] = useState(data);
  return (
    <div className="space-y-4">
      <div className="field"><label>Nome Completo</label><input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="field"><label>Telefone</label><input value={form.telefone || ''} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
        <div className="field"><label>Batizado</label><select value={form.batizado} onChange={e => setForm({...form, batizado: e.target.value})}><option>Sim</option><option>Não</option></select></div>
      </div>
      <div className="field"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}><option>Ativo</option><option>Pendente</option><option>Inativo</option></select></div>
      <div className="flex gap-2 pt-4">
        <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-gold flex-1" onClick={() => onSave(form)}>Salvar</button>
      </div>
    </div>
  );
}

function CongregadoForm({ data, onSave, onCancel }: any) {
    const [form, setForm] = useState(data);
    return (
      <div className="space-y-4">
        <div className="field"><label>Nome Completo</label><input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
            <div className="field"><label>Telefone</label><input value={form.telefone || ''} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
            <div className="field"><label>Data Início</label><input type="date" value={form.dataInicio || ''} onChange={e => setForm({...form, dataInicio: e.target.value})} /></div>
        </div>
        <div className="flex gap-2 pt-4">
          <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-gold flex-1" onClick={() => onSave(form)}>Salvar</button>
        </div>
      </div>
    );
}

function ObreiroForm({ data, onSave, onCancel }: any) {
    const [form, setForm] = useState(data);
    return (
      <div className="space-y-4">
        <div className="field"><label>Nome Completo</label><input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
            <div className="field"><label>Cargo</label><select value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}><option value="">Selecione</option>{CARGOS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Telefone</label><input value={form.telefone || ''} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
        </div>
        <div className="flex gap-2 pt-4">
          <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-gold flex-1" onClick={() => onSave(form)}>Salvar</button>
        </div>
      </div>
    );
}

function EntradaForm({ data, onSave, onCancel, members }: any) {
    const [form, setForm] = useState(data);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="field"><label>Tipo</label><select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}><option>Dízimo</option><option>Oferta</option></select></div>
            <div className="field"><label>Data</label><input type="date" value={form.data || ''} onChange={e => setForm({...form, data: e.target.value})} /></div>
        </div>
        <div className="field">
            <label>Doador / Membro</label>
            <select value={form.membro} onChange={e => setForm({...form, membro: e.target.value})}>
                <option value="">Selecione</option>
                {members.map((m: any) => <option key={m.id}>{m.nome}</option>)}
                <option value="Congregado / Visitante">Congregado / Visitante</option>
            </select>
        </div>
        <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={form.valor || ''} onChange={e => setForm({...form, valor: parseFloat(e.target.value)})} /></div>
        <div className="flex gap-2 pt-4">
          <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-gold flex-1" onClick={() => onSave(form)}>Confirmar Lançamento</button>
        </div>
      </div>
    );
}

function DispensaForm({ data, onSave, onCancel }: any) {
    const [form, setForm] = useState(data);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="field"><label>Categoria</label><select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}><option value="">Selecione</option>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Data</label><input type="date" value={form.data || ''} onChange={e => setForm({...form, data: e.target.value})} /></div>
        </div>
        <div className="field"><label>Descrição / Destinatário</label><input value={form.descricao || ''} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
        <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={form.valor || ''} onChange={e => setForm({...form, valor: parseFloat(e.target.value)})} /></div>
        <div className="flex gap-2 pt-4">
          <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-gold flex-1" onClick={() => onSave(form)}>Confirmar Dispensa</button>
        </div>
      </div>
    );
}

function CertificadoForm({ certTipo, data, onSave, onCancel }: any) {
    const [form, setForm] = useState(data);
    const isB = certTipo === 'batismo';
    return (
      <div className="space-y-4">
        <p className="text-[10px] text-[var(--g700)] uppercase font-bold tracking-widest text-center mb-6">Documento Oficial {isB ? 'Batismo' : 'Apresentação'}</p>
        <div className="field"><label>Nome Completo</label><input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} /></div>
        <div className="field"><label>Data do Evento</label><input type="date" value={form.dataEvento || ''} onChange={e => setForm({...form, dataEvento: e.target.value})} /></div>
        <div className="field"><label>Nome do Pastor</label><input value={form.pastor || ''} onChange={e => setForm({...form, pastor: e.target.value})} /></div>
        <div className="field"><label>Local (Cidade/Estado)</label><input value={form.local || ''} onChange={e => setForm({...form, local: e.target.value})} /></div>
        <div className="flex gap-2 pt-4">
          <button className="btn btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${isB ? 'btn-blue' : 'btn-green'} flex-1`} onClick={() => onSave(form)}>Emitir PDF</button>
        </div>
      </div>
    );
}

function SettingsForm({ onSave, onLogoChange, logo }: any) {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [finPin, setFinPin] = useState('');

    const handleSave = () => {
        if (finPin) localStorage.setItem('igr-finpin', hashPin(finPin));
        if (u && p) localStorage.setItem('igr-credentials', JSON.stringify({ usuario: u, senha: p }));
        alert('Configurações salvas!');
        onSave();
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-4">
            <label className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center relative group overflow-hidden cursor-pointer hover:border-[var(--g900)] transition-colors">
                {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Upload size={24} className="text-white/20" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                   onLogoChange(e);
                }} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Upload size={20} className="text-white" />
                </div>
            </label>
            <p className="text-[10px] text-white/40 uppercase font-bold">Toque para alterar o Logo</p>
        </div>
        
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-bold text-[var(--g900)] tracking-widest uppercase">Credenciais de Acesso</h4>
            <div className="field"><label>Usuário</label><input value={u} onChange={e => setU(e.target.value)} placeholder="Novo usuário" /></div>
            <div className="field"><label>Senha</label><input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Nova senha" /></div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-bold text-red-400 tracking-widest uppercase">Segurança Financeira</h4>
            <div className="field"><label>Novo PIN Financeiro (6 dígitos)</label><input type="password" maxLength={6} value={finPin} onChange={e => setFinPin(e.target.value)} placeholder="••••••" /></div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-gold w-full" onClick={handleSave}>Salvar Todas as Alterações</button>
        </div>
      </div>
    );
}

function PublicCadastro({ onFinish, saveRec }: any) {
    const [nome, setNome] = useState('');
    const [tel, setTel] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = () => {
        if (!nome) return alert('Nome é obrigatório');
        saveRec('membros', { nome, telefone: tel, status: 'Pendente', dataIngresso: hoje() });
        setSuccess(true);
    };

    if (success) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-[var(--o800)] to-black">
            <div className="bg-white/10 p-10 rounded-2xl text-center">
                <CheckCircle2 size={64} className="mx-auto text-green-400 mb-4" />
                <h2 className="text-2xl font-cinzel text-white">Cadastro Enviado!</h2>
                <p className="text-white/60 mt-2">Agradecemos o seu interesse. A secretaria entrará em contato.</p>
                <button onClick={onFinish} className="mt-8 text-yellow-500 font-bold uppercase tracking-widest text-xs">Voltar ao Início</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-[var(--o800)] to-black">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-[var(--o700)] to-black border-2 border-[var(--g900)]/30 flex items-center justify-center overflow-hidden mb-4">
                        {localStorage.getItem('igr-logo') ? <img src={localStorage.getItem('igr-logo')!} className="w-full h-full object-cover" /> : <Cross size={32} className="text-[var(--g900)]"/>}
                    </div>
                    <h1 className="font-cinzel text-xl text-yellow-500 text-center">FICHA DE CADASTRO</h1>
                </div>
                <div className="space-y-4">
                    <div className="field"><label>Nome Completo</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></div>
                    <div className="field"><label>Telefone / WhatsApp</label><input value={tel} onChange={e => setTel(e.target.value)} placeholder="(00) 00000-0000" /></div>
                    <button onClick={handleSubmit} className="btn btn-gold w-full">ENVIAR DADOS</button>
                </div>
            </div>
        </div>
    );
}
